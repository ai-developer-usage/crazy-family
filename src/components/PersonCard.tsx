import type { Person } from '../types';
import Avatar from './Avatar';
import { genderTheme } from '../utils/theme';
import { lifespan, isLiving, ageYears } from '../utils/format';

interface Props {
  person: Person;
  onSelect: (id: string) => void;
}

export default function PersonCard({ person, onSelect }: Props) {
  const theme = genderTheme(person.gender);
  const span = lifespan(person);
  const age = ageYears(person);

  return (
    <button
      onClick={() => onSelect(person.id)}
      className={`group flex w-full items-center gap-4 rounded-2xl bg-white/85 p-4 text-left shadow-card ring-2 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-pop ${theme.ring}`}
    >
      <Avatar person={person} size={72} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-bold text-slate-800">
          {person.firstName} {person.lastName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${theme.badge}`}>{theme.emoji} {person.gender}</span>
          {isLiving(person) && (
            <span className="chip bg-emerald-100 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> living
            </span>
          )}
        </div>
        {span && (
          <p className="mt-1.5 text-sm font-semibold text-slate-500">
            {span}
            {age != null && (
              <span className="text-slate-400">
                {' '}· {age} yr{age === 1 ? '' : 's'}
              </span>
            )}
          </p>
        )}
        {person.birthPlace && (
          <p className="truncate text-xs font-semibold text-slate-400">
            📍 {person.birthPlace}
          </p>
        )}
      </div>
    </button>
  );
}
