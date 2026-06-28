import { useMemo, useState, type FormEvent } from 'react';
import type { Gender, Person, PersonDraft } from '../types';
import { fullName } from '../utils/relations';
import Avatar from './Avatar';

interface Props {
  /** Existing person when editing; undefined when adding. */
  person?: Person;
  people: Person[];
  onClose: () => void;
  onSaved: (saved: Person) => void;
  savePerson: (draft: PersonDraft) => Promise<Person>;
  uploadPhoto: (file: File) => Promise<string>;
}

const GENDERS: Gender[] = ['male', 'female', 'other'];

function blankDraft(): PersonDraft {
  return {
    firstName: '',
    lastName: '',
    gender: 'other',
    photoUrl: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    bio: '',
    fatherId: null,
    motherId: null,
    spouseIds: [],
  };
}

export default function PersonForm({
  person,
  people,
  onClose,
  onSaved,
  savePerson,
  uploadPhoto,
}: Props) {
  const [draft, setDraft] = useState<PersonDraft>(() =>
    person ? { ...person, spouseIds: [...person.spouseIds] } : blankDraft(),
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Everyone except the person being edited can be a relative.
  const others = useMemo(
    () =>
      people
        .filter((p) => p.id !== person?.id)
        .sort((a, b) => fullName(a).localeCompare(fullName(b))),
    [people, person?.id],
  );

  const set = <K extends keyof PersonDraft>(key: K, value: PersonDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleSpouse = (id: string) =>
    setDraft((d) => ({
      ...d,
      spouseIds: d.spouseIds.includes(id)
        ? d.spouseIds.filter((x) => x !== id)
        : [...d.spouseIds, id],
    }));

  async function handlePhoto(file: File) {
    setError(null);
    setUploading(true);
    try {
      set('photoUrl', await uploadPhoto(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.firstName.trim()) {
      setError('A first name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      onSaved(await savePerson(draft));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
      setSaving(false);
    }
  }

  const previewPerson: Person = {
    ...(person ?? { id: 'preview', spouseIds: [] }),
    ...draft,
    id: person?.id ?? 'preview',
  } as Person;

  return (
    <form onSubmit={handleSubmit} className="max-h-[88vh] overflow-y-auto">
      <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-grape via-bubble to-tangerine px-6 py-4">
        <h2 className="font-display text-xl font-extrabold text-white">
          {person ? `Edit ${person.firstName}` : 'Add a family member'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/25 text-white hover:bg-white/40"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5 p-6">
        {/* Photo + name */}
        <div className="flex items-center gap-4">
          <Avatar person={previewPerson} size={80} />
          <div className="flex-1">
            <label className="field-label">Photo</label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="btn-ghost cursor-pointer text-sm">
                {uploading ? 'Uploading…' : '📷 Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handlePhoto(e.target.files[0])
                  }
                />
              </label>
              {draft.photoUrl && (
                <button
                  type="button"
                  className="text-sm font-bold text-rose-500"
                  onClick={() => set('photoUrl', '')}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">First name *</label>
            <input
              className="field"
              value={draft.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="Beatrice"
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Last name</label>
            <input
              className="field"
              value={draft.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="Bloom"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Gender</label>
            <select
              className="field"
              value={draft.gender}
              onChange={(e) => set('gender', e.target.value as Gender)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g[0].toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Born</label>
            <input
              type="date"
              className="field"
              value={draft.birthDate ?? ''}
              onChange={(e) => set('birthDate', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Died</label>
            <input
              type="date"
              className="field"
              value={draft.deathDate ?? ''}
              onChange={(e) => set('deathDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Birthplace</label>
          <input
            className="field"
            value={draft.birthPlace ?? ''}
            onChange={(e) => set('birthPlace', e.target.value)}
            placeholder="Cork, Ireland"
          />
        </div>

        <div>
          <label className="field-label">Story / bio</label>
          <textarea
            className="field min-h-[80px] resize-y"
            value={draft.bio ?? ''}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Something memorable about them…"
          />
        </div>

        {/* Parents */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ParentSelect
            label="Father"
            value={draft.fatherId ?? ''}
            options={others}
            onChange={(id) => set('fatherId', id || null)}
          />
          <ParentSelect
            label="Mother"
            value={draft.motherId ?? ''}
            options={others}
            onChange={(id) => set('motherId', id || null)}
          />
        </div>

        {/* Spouses */}
        <div>
          <label className="field-label">
            Partners / spouses{' '}
            <span className="font-semibold text-slate-400">
              (links both ways automatically)
            </span>
          </label>
          {others.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400">
              Add more people first to link partners.
            </p>
          ) : (
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              {others.map((p) => {
                const on = draft.spouseIds.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleSpouse(p.id)}
                    className={`chip ring-1 transition ${
                      on
                        ? 'bg-grape text-white ring-grape'
                        : 'bg-white text-slate-600 ring-slate-200 hover:ring-grape/40 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600'
                    }`}
                  >
                    {on ? '✓ ' : ''}
                    {fullName(p)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Siblings & children note */}
        <p className="rounded-xl bg-violet-50 px-4 py-3 text-xs font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
          💡 Siblings and children are figured out automatically from parents —
          just set each person’s father and mother and the rest connects itself.
        </p>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : person ? 'Save changes' : 'Add to family'}
          </button>
        </div>
      </div>
    </form>
  );
}

function ParentSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Person[];
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— none —</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {fullName(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
