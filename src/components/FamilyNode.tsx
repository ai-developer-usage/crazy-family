import type { CSSProperties } from 'react';
import type { Person } from '../types';
import Avatar from './Avatar';
import { genderTheme } from '../utils/theme';
import { lifespan, isLiving } from '../utils/format';

interface Props {
  person: Person;
  isRoot: boolean;
  style: CSSProperties;
  onSelect: (id: string) => void;
}

/** A single positioned card inside the family tree canvas. */
export default function FamilyNode({ person, isRoot, style, onSelect }: Props) {
  const theme = genderTheme(person.gender);
  const span = lifespan(person);

  return (
    <div
      style={style}
      className="absolute flex items-center justify-center p-2"
    >
      <button
        onClick={() => onSelect(person.id)}
        title="View profile"
        className={`group flex w-[140px] flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 py-3 text-center shadow-card ring-2 backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-pop dark:bg-slate-800/90 ${
          isRoot ? 'ring-grape ring-4' : theme.ring
        }`}
      >
        <Avatar person={person} size={56} />
        <div className="mt-1 w-full">
          <p className="truncate font-display text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
            {person.firstName}
          </p>
          <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            {person.lastName}
          </p>
        </div>
        {span && (
          <span className={`chip ${theme.badge} px-2 py-0.5`}>
            {isLiving(person) && (
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            )}
            {span}
          </span>
        )}
      </button>
    </div>
  );
}
