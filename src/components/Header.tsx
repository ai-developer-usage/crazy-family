import type { Theme } from '../hooks/useTheme';

type View = 'tree' | 'grid';

interface Props {
  view: View;
  onView: (v: View) => void;
  search: string;
  onSearch: (s: string) => void;
  count: number;
  canEdit: boolean;
  isDemo: boolean;
  userEmail: string | null;
  theme: Theme;
  onToggleTheme: () => void;
  onAdd: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({
  view,
  onView,
  search,
  onSearch,
  count,
  canEdit,
  isDemo,
  userEmail,
  theme,
  onToggleTheme,
  onAdd,
  onSignIn,
  onSignOut,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌳</span>
          <div>
            <h1 className="bg-gradient-to-r from-grape via-bubble to-tangerine bg-clip-text font-display text-2xl font-extrabold leading-none text-transparent">
              Crazy Family
            </h1>
            <p className="text-xs font-bold text-slate-400">
              {count} {count === 1 ? 'member' : 'members'} & counting
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div className="ml-auto flex rounded-full bg-white/70 p-1 ring-1 ring-grape/15 dark:bg-slate-800/70 dark:ring-violet-400/20">
          {(['tree', 'grid'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${
                view === v
                  ? 'bg-gradient-to-r from-grape to-bubble text-white shadow'
                  : 'text-slate-500 hover:text-grape dark:text-slate-400 dark:hover:text-violet-300'
              }`}
            >
              {v === 'tree' ? '🌳 Tree' : '🗂 Grid'}
            </button>
          ))}
        </div>

        {/* Light / dark toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-lg ring-1 ring-grape/15 transition hover:scale-105 dark:bg-slate-800/70 dark:ring-violet-400/20"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="🔍 Search family…"
          className="field max-w-[200px] !py-2 !text-sm"
        />

        {canEdit && (
          <button className="btn-primary !px-4 !py-2 text-sm" onClick={onAdd}>
            ＋ Add person
          </button>
        )}

        {isDemo ? (
          <span className="chip bg-amber-100 text-amber-700" title="No backend connected — changes are not saved.">
            🧪 Demo mode
          </span>
        ) : userEmail ? (
          <button
            className="btn-ghost !px-4 !py-2 text-sm"
            onClick={onSignOut}
            title={userEmail}
          >
            Sign out
          </button>
        ) : (
          <button className="btn-ghost !px-4 !py-2 text-sm" onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
