import type { Person } from '../types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** 'YYYY-MM-DD' -> '12 Apr 1940'. Returns '' for empty/invalid input. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y) return '';
  if (!m) return String(y);
  const month = MONTHS[m - 1] ?? '';
  return d ? `${d} ${month} ${y}` : `${month} ${y}`;
}

const year = (iso?: string | null) => (iso ? iso.slice(0, 4) : '');

/** '1940 – 2018', 'b. 1998', or '' when no dates are known. */
export function lifespan(person: Person): string {
  const b = year(person.birthDate);
  const d = year(person.deathDate);
  if (b && d) return `${b} – ${d}`;
  if (b) return `b. ${b}`;
  if (d) return `d. ${d}`;
  return '';
}

export function isLiving(person: Person): boolean {
  return Boolean(person.birthDate) && !person.deathDate;
}

/** Whole-number age, computed at death if deceased, else today. */
export function ageYears(person: Person): number | null {
  if (!person.birthDate) return null;
  const start = new Date(person.birthDate);
  const end = person.deathDate ? new Date(person.deathDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  let age = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age--;
  return age >= 0 ? age : null;
}

export function initials(person: Person): string {
  return `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase();
}
