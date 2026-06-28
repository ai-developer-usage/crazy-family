import { useMemo, useState } from 'react';
import type { Person, RelationKind } from '../types';
import { getRelatives, relationLabel } from '../utils/relations';
import { genderTheme } from '../utils/theme';
import { formatDate, lifespan, isLiving, ageYears } from '../utils/format';
import Avatar from './Avatar';

interface Props {
  person: Person;
  people: Person[];
  canEdit: boolean;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onNavigate: (id: string) => void;
}

export default function PersonProfile({
  person,
  people,
  canEdit,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
}: Props) {
  const theme = genderTheme(person.gender);
  const relatives = useMemo(
    () => getRelatives(person, people),
    [person, people],
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const age = ageYears(person);

  const groups: { kind: RelationKind; title: string; people: Person[] }[] = [
    { kind: 'parent', title: 'Parents', people: relatives.parents },
    { kind: 'spouse', title: 'Partners', people: relatives.spouses },
    { kind: 'sibling', title: 'Siblings', people: relatives.siblings },
    { kind: 'child', title: 'Children', people: relatives.children },
  ];

  return (
    <div className="overflow-hidden rounded-3xl">
      {/* Colourful header */}
      <div className={`relative bg-gradient-to-br ${theme.gradient} p-6 pb-16`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
          aria-label="Close"
        >
          ✕
        </button>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-white/80">
          {theme.emoji} {person.gender}
          {isLiving(person) ? ' · living' : person.deathDate ? ' · in memory' : ''}
        </p>
        <h2 className="mt-1 font-display text-3xl font-extrabold text-white drop-shadow">
          {person.firstName} {person.lastName}
        </h2>
      </div>

      <div className="-mt-12 px-6 pb-6">
        <Avatar person={person} size={104} className="mx-auto" />

        {/* Vital stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Born" value={formatDate(person.birthDate) || '—'} />
          <Stat
            label={person.deathDate ? 'Died' : 'Age'}
            value={
              person.deathDate
                ? formatDate(person.deathDate)
                : age != null
                  ? `${age} yrs`
                  : '—'
            }
          />
          <Stat label="Lifespan" value={lifespan(person) || '—'} />
          <Stat label="Birthplace" value={person.birthPlace || '—'} />
        </div>

        {person.bio && (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-600">
            {person.bio}
          </p>
        )}

        {/* Relationships */}
        <div className="mt-5 space-y-4">
          {groups.map(
            (g) =>
              g.people.length > 0 && (
                <div key={g.kind}>
                  <h3 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wide text-slate-400">
                    {g.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {g.people.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onNavigate(rel.id)}
                        className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-pop"
                      >
                        <Avatar person={rel} size={32} />
                        <span className="text-left leading-tight">
                          <span className="block text-sm font-bold text-slate-700">
                            {rel.firstName} {rel.lastName}
                          </span>
                          <span
                            className={`block text-[11px] font-bold ${genderTheme(rel.gender).text}`}
                          >
                            {relationLabel(g.kind, rel)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ),
          )}
          {groups.every((g) => g.people.length === 0) && (
            <p className="rounded-2xl bg-amber-50 p-4 text-center text-sm font-semibold text-amber-700">
              No relatives linked yet. {canEdit ? 'Edit this person to connect their family.' : ''}
            </p>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
            {confirmDelete ? (
              <>
                <span className="mr-auto text-sm font-bold text-rose-600">
                  Delete {person.firstName}? This unlinks them from everyone.
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button className="btn-danger" onClick={() => onDelete(person.id)}>
                  Delete forever
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-ghost text-rose-500 ring-rose-200 hover:ring-rose-400"
                  onClick={() => setConfirmDelete(true)}
                >
                  🗑 Delete
                </button>
                <button className="btn-primary" onClick={() => onEdit(person)}>
                  ✏️ Edit
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-slate-700" title={value}>
        {value}
      </p>
    </div>
  );
}
