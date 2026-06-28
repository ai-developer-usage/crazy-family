import type { Person } from '../types';
import { genderTheme } from '../utils/theme';
import { initials } from '../utils/format';

interface Props {
  person: Person;
  size?: number;
  className?: string;
}

/** Round portrait: shows the photo when present, else a colourful monogram. */
export default function Avatar({ person, size = 64, className = '' }: Props) {
  const theme = genderTheme(person.gender);
  const style = { width: size, height: size };

  return (
    <div
      style={style}
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${theme.gradient} ring-2 ring-white shadow-card ${className}`}
    >
      {person.photoUrl ? (
        <img
          src={person.photoUrl}
          alt={`${person.firstName} ${person.lastName}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-display font-extrabold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initials(person)}
        </span>
      )}
    </div>
  );
}
