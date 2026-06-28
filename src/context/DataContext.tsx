import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Person, PersonDraft } from '../types';
import { repo } from '../services/repo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DataContextValue {
  people: Person[];
  loading: boolean;
  error: string | null;
  /** true when running on bundled sample data (no backend). */
  isDemo: boolean;
  /** Whether the current user may add/edit/delete. */
  canEdit: boolean;
  /** Signed-in user's email, when using Supabase auth. */
  userEmail: string | null;
  reload: () => Promise<void>;
  savePerson: (draft: PersonDraft) => Promise<Person>;
  deletePerson: (id: string) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const dedupe = (ids: string[]) => Array.from(new Set(ids));

export function DataProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const isDemo = !repo.persistent;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPeople(await repo.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load family data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Track Supabase auth session (only relevant when a backend is configured).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth
      .getSession()
      .then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const applyLocal = useCallback((updated: Person[], removedId?: string) => {
    setPeople((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      if (removedId) map.delete(removedId);
      for (const p of updated) map.set(p.id, p);
      return [...map.values()];
    });
  }, []);

  /**
   * Create or update a person, keeping spouse links bidirectional: if A now
   * lists B as a spouse, B is updated to list A too (and removals are mirrored).
   * This is what guarantees marriages can never be recorded on only one side.
   */
  const savePerson = useCallback(
    async (draft: PersonDraft): Promise<Person> => {
      const id = draft.id ?? crypto.randomUUID();
      const person: Person = {
        ...draft,
        id,
        spouseIds: dedupe(draft.spouseIds.filter((s) => s && s !== id)),
      };

      const prev = people.find((p) => p.id === id);
      const prevSpouses = new Set(prev?.spouseIds ?? []);
      const nextSpouses = new Set(person.spouseIds);
      const affected: Person[] = [];

      for (const sid of nextSpouses) {
        if (prevSpouses.has(sid)) continue;
        const sp = people.find((p) => p.id === sid);
        if (sp && !sp.spouseIds.includes(id)) {
          affected.push({ ...sp, spouseIds: [...sp.spouseIds, id] });
        }
      }
      for (const sid of prevSpouses) {
        if (nextSpouses.has(sid)) continue;
        const sp = people.find((p) => p.id === sid);
        if (sp && sp.spouseIds.includes(id)) {
          affected.push({
            ...sp,
            spouseIds: sp.spouseIds.filter((x) => x !== id),
          });
        }
      }

      await repo.upsert(person);
      for (const a of affected) await repo.upsert(a);
      applyLocal([person, ...affected]);
      return person;
    },
    [people, applyLocal],
  );

  /**
   * Delete a person and scrub every reference to them: children lose the
   * parent link, spouses lose the marriage. No dangling ids are left behind.
   */
  const deletePerson = useCallback(
    async (id: string): Promise<void> => {
      const affected: Person[] = [];
      for (const p of people) {
        const next: Person = { ...p, spouseIds: [...p.spouseIds] };
        let changed = false;
        if (p.fatherId === id) {
          next.fatherId = null;
          changed = true;
        }
        if (p.motherId === id) {
          next.motherId = null;
          changed = true;
        }
        if (p.spouseIds.includes(id)) {
          next.spouseIds = p.spouseIds.filter((x) => x !== id);
          changed = true;
        }
        if (changed) affected.push(next);
      }

      await repo.remove(id);
      for (const a of affected) await repo.upsert(a);
      applyLocal(affected, id);
    },
    [people, applyLocal],
  );

  const uploadPhoto = useCallback((file: File) => repo.uploadPhoto(file), []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Sign-in requires a configured backend.');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      people,
      loading,
      error,
      isDemo,
      canEdit: isDemo || Boolean(userEmail),
      userEmail,
      reload,
      savePerson,
      deletePerson,
      uploadPhoto,
      signIn,
      signOut,
    }),
    [
      people,
      loading,
      error,
      isDemo,
      userEmail,
      reload,
      savePerson,
      deletePerson,
      uploadPhoto,
      signIn,
      signOut,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>.');
  return ctx;
}
