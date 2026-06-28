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
  onAdd,
  onSignIn,
  onSignOut,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl">
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
        <div className="ml-auto flex rounded-full bg-white/70 p-1 ring-1 ring-grape/15">
          {(['tree', 'grid'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${
                view === v
                  ? 'bg-gradient-to-r from-grape to-bubble text-white shadow'
                  : 'text-slate-500 hover:text-grape'
              }`}
            >
              {v === 'tree' ? '🌳 Tree' : '🗂 Grid'}
            </button>
          ))}
        </div>

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
