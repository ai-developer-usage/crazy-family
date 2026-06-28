# 🌳 Crazy Family

A vibrant, interactive family-tree website. Store each person's photo, dates,
birthplace and story, link them by **father / mother / spouse**, and the app
draws the whole multi-generation tree — automatically working out siblings and
children so the data is **always consistent**.

- ⚛️ **Frontend:** React + Vite + TypeScript + Tailwind — deploys free to **GitHub Pages**
- 🗄️ **Backend:** **Supabase** — Postgres database + photo storage + login
- 🧪 **Demo mode:** runs instantly with sample data before any backend is set up

---

## How relationships stay consistent

Every person stores **only** their canonical links: `fatherId`, `motherId`, and
`spouseIds`. Everything else — siblings, children, who is a brother vs sister,
husband vs wife — is **computed on the fly** (`src/utils/relations.ts`). There is
exactly one source of truth for each connection, so two records can never
disagree. Spouse links are kept bidirectional automatically, and deleting a
person scrubs every reference to them.

---

## 1. Run it locally (demo mode — no setup)

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173). You'll see the demo
"Bloom" family. Editing works in-session but isn't saved — connect Supabase
below to make it real.

---

## 2. Connect Supabase (real, saved data)

1. Create a free project at **https://supabase.com**.
2. In the dashboard go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. (Optionally
   also run [`supabase/seed.sql`](supabase/seed.sql) to load the demo family.)
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** API key
4. Create a `.env` file in the project root (copy from `.env.example`):

   ```bash
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Restart `npm run dev`. The "🧪 Demo mode" badge disappears — data now lives in
   Supabase and syncs across every device.

### Create an editor account

Anyone can **view** the tree. To **edit**, create a login:
**Authentication → Users → Add user** in the Supabase dashboard. Then use the
**Sign in** button on the site. (Row-Level Security enforces this server-side
too — visitors can read, only signed-in users can write.)

> The anon key is **safe to expose** publicly — it only grants what your RLS
> policies allow. Never commit the `service_role` key.

---

## 3. Deploy to GitHub Pages

1. Create a new GitHub repository and push this project to it:

   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. In the repo, add your Supabase keys as secrets
   (**Settings → Secrets and variables → Actions → New repository secret**):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (Skip this to deploy in demo mode.)

3. Enable Pages: **Settings → Pages → Build and deployment → Source:
   “GitHub Actions”**.

4. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
   which builds the site and publishes it. Your URL will be
   `https://<you>.github.io/<repo>/`.

> The app uses relative asset paths + hash routing, so it works at any
> subpath with no extra configuration.

---

## Project structure

```
src/
  components/      UI: TreeView, FamilyNode, PersonCard, PersonProfile,
                   PersonForm, Header, Modal, LoginModal, Avatar
  context/         DataContext — loading, auth, and consistency-preserving CRUD
  services/        repo.ts (Supabase + in-memory demo), row mapping
  utils/           relations.ts (the consistency engine), format.ts, theme.ts
  data/            sampleData.ts (demo family)
  lib/             supabase.ts (client + demo detection)
supabase/          schema.sql, seed.sql
.github/workflows/ deploy.yml (GitHub Pages CI)
```

## Commands

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the dev server                  |
| `npm run build`   | Type-check and build to `dist/`       |
| `npm run preview` | Preview the production build locally  |

---

Made with 💜 for the Crazy Family.
