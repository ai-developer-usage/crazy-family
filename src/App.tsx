import { useMemo, useState } from 'react';
import { useData } from './context/DataContext';
import { useTheme } from './hooks/useTheme';
import { fullName, byBirthDate } from './utils/relations';
import type { Person } from './types';
import Header from './components/Header';
import TreeView from './components/TreeView';
import PersonCard from './components/PersonCard';
import PersonProfile from './components/PersonProfile';
import PersonForm from './components/PersonForm';
import LoginModal from './components/LoginModal';
import Modal from './components/Modal';

type View = 'tree' | 'grid';

export default function App() {
  const {
    people,
    loading,
    error,
    isDemo,
    canEdit,
    userEmail,
    savePerson,
    deletePerson,
    uploadPhoto,
    signIn,
    signOut,
  } = useData();

  const { theme, toggle: toggleTheme } = useTheme();
  const [view, setView] = useState<View>('tree');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Person | undefined>(undefined);
  const [loginOpen, setLoginOpen] = useState(false);

  const selected = useMemo(
    () => people.find((p) => p.id === selectedId) ?? null,
    [people, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? people.filter(
          (p) =>
            fullName(p).toLowerCase().includes(q) ||
            (p.birthPlace ?? '').toLowerCase().includes(q),
        )
      : people;
    return [...list].sort(byBirthDate);
  }, [people, search]);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (person: Person) => {
    setSelectedId(null);
    setEditing(person);
    setFormOpen(true);
  };
  const handleSaved = (saved: Person) => {
    setFormOpen(false);
    setEditing(undefined);
    setSelectedId(saved.id);
  };
  const handleDelete = async (id: string) => {
    await deletePerson(id);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen">
      <Header
        view={view}
        onView={setView}
        search={search}
        onSearch={setSearch}
        count={people.length}
        canEdit={canEdit}
        isDemo={isDemo}
        userEmail={userEmail}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAdd={openAdd}
        onSignIn={() => setLoginOpen(true)}
        onSignOut={signOut}
      />

      <main className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-6">
        {loading && <CenterNote>Loading your family… 🌱</CenterNote>}

        {error && (
          <CenterNote tone="error">
            Couldn’t load data: {error}
          </CenterNote>
        )}

        {!loading && !error && people.length === 0 && (
          <EmptyState canEdit={canEdit} onAdd={openAdd} />
        )}

        {!loading && !error && people.length > 0 && (
          <>
            {view === 'tree' ? (
              search.trim() ? (
                <SearchResults
                  people={filtered}
                  onSelect={setSelectedId}
                  search={search}
                />
              ) : (
                <TreeView people={people} onSelect={setSelectedId} />
              )
            ) : (
              <Grid people={filtered} onSelect={setSelectedId} search={search} />
            )}
          </>
        )}
      </main>

      <footer className="pb-8 pt-4 text-center text-xs font-bold text-slate-400">
        Made with 💜 for the Crazy Family
        {isDemo && ' · running on demo data — connect Supabase to save changes'}
      </footer>

      {/* Profile */}
      <Modal open={!!selected} onClose={() => setSelectedId(null)} maxWidth="max-w-xl">
        {selected && (
          <PersonProfile
            person={selected}
            people={people}
            canEdit={canEdit}
            onClose={() => setSelectedId(null)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onNavigate={setSelectedId}
          />
        )}
      </Modal>

      {/* Add / edit form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} maxWidth="max-w-2xl">
        {formOpen && (
          <PersonForm
            person={editing}
            people={people}
            onClose={() => setFormOpen(false)}
            onSaved={handleSaved}
            savePerson={savePerson}
            uploadPhoto={uploadPhoto}
          />
        )}
      </Modal>

      {/* Login */}
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="max-w-md">
        <LoginModal onClose={() => setLoginOpen(false)} signIn={signIn} />
      </Modal>
    </div>
  );
}

function Grid({
  people,
  onSelect,
  search,
}: {
  people: Person[];
  onSelect: (id: string) => void;
  search: string;
}) {
  if (people.length === 0) {
    return <CenterNote>No one matches “{search}”.</CenterNote>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <PersonCard key={p.id} person={p} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SearchResults({
  people,
  onSelect,
  search,
}: {
  people: Person[];
  onSelect: (id: string) => void;
  search: string;
}) {
  return (
    <div>
      <p className="mb-3 font-display font-bold text-slate-500">
        {people.length} result{people.length === 1 ? '' : 's'} for “{search}”
      </p>
      <Grid people={people} onSelect={onSelect} search={search} />
    </div>
  );
}

function CenterNote({
  children,
  tone = 'info',
}: {
  children: React.ReactNode;
  tone?: 'info' | 'error';
}) {
  return (
    <div
      className={`mx-auto mt-10 max-w-md rounded-3xl p-8 text-center font-display text-lg font-bold ${
        tone === 'error'
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
          : 'bg-white/60 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300'
      }`}
    >
      {children}
    </div>
  );
}

function EmptyState({
  canEdit,
  onAdd,
}: {
  canEdit: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl bg-white/70 p-10 text-center shadow-card dark:bg-slate-800/70">
      <div className="text-6xl">🌱</div>
      <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-700 dark:text-slate-100">
        Your family tree is empty
      </h2>
      <p className="mt-2 font-semibold text-slate-500 dark:text-slate-400">
        {canEdit
          ? 'Plant the first seed — add a family member to get started.'
          : 'Sign in to start adding your family.'}
      </p>
      {canEdit && (
        <button className="btn-primary mt-5" onClick={onAdd}>
          ＋ Add the first person
        </button>
      )}
    </div>
  );
}
