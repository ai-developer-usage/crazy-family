import { useState, type FormEvent } from 'react';

interface Props {
  onClose: () => void;
  signIn: (email: string, password: string) => Promise<void>;
}

/** Email/password sign-in for editors (viewers don't need an account). */
export default function LoginModal({ onClose, signIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="rounded-t-3xl bg-gradient-to-r from-grape via-bubble to-tangerine px-6 py-5 text-center">
        <h2 className="font-display text-2xl font-extrabold text-white">
          Welcome back 👋
        </h2>
        <p className="text-sm font-semibold text-white/80">
          Sign in to edit the family.
        </p>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@family.com"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        <p className="text-center text-xs font-semibold text-slate-400">
          Accounts are created in your Supabase dashboard (Authentication → Users).
        </p>
      </div>
    </form>
  );
}
