# Margin — Learn with evidence

A private, source-first living study guide. Turn notes into review drafts, compare each draft with its original evidence, and build a library you can actually trust.

## The workflow

1. Paste notes or import a UTF-8 `.txt` or `.md` file (up to 30,000 characters).
2. Generate AI drafts, or use a free extractive mode that copies source sentences exactly.
3. Read the original excerpt beside every draft. Approve, edit, tag, merge, or discard it.
4. Search approved cards, browse source-linked notebook concept pages, practice flashcards, take short-answer quizzes, and complete focused review sessions.
5. Track self-assessed recall and export a complete JSON backup.

New source material is **never automatically approved**. The explicitly labeled demo includes four pre-approved examples and six pending drafts so all study tools can be explored immediately. Demo data is browser-local and separate from authenticated notebooks.

## Run locally

Node.js 22 or newer:

```sh
npm ci
cp .env.example .env
npm run dev
```

Without environment variables, the app shows a setup screen and an interactive demo. `npm run dev` serves the frontend only; use `vercel dev` or a Vercel deployment to test `/api/extract`.

```sh
npm test
npm run build
```

## Deploy to Vercel

### 1. Create the database and authentication

Create a Supabase project. Run **supabase/schema.sql** in its SQL editor once. It creates private notebooks, row-level security policies, and the atomic AI usage budget. Enable email/password authentication. Keep email confirmation enabled and configure an SMTP provider before wider use.

In Supabase Authentication → URL Configuration, set your Vercel URL as Site URL and add your exact application URL to allowed redirects. Never use a service-role key in this app.

### 2. Import the GitHub repository

In Vercel, choose Add New → Project → import this repository. Framework: **Vite**. Build: `npm run build`. Output: `dist`. Vercel automatically deploys the `api/extract.js` server function.

Add these environment variables:

| Variable | Where | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase anon/publishable client key |
| `SUPABASE_URL` | Server | Same project URL |
| `SUPABASE_ANON_KEY` | Server | Same client key |
| `OPENAI_API_KEY` | Server only | Your OpenAI API key |
| `OPENAI_MODEL` | Server only, optional | Defaults to `gpt-4.1-mini` |

Redeploy after changing environment variables. Only the two `VITE_` variables are public. Never prefix the OpenAI key with `VITE_`. AI generation incurs provider usage charges. Extractive generation works without an OpenAI key.

### 3. Verify the deployed app

- Create an account, confirm your email, and sign in.
- Add notes, review evidence, edit a draft, approve one, discard another, and test merging related drafts.
- Verify only approved cards appear in the library, notebook, flashcards, and quizzes.
- Complete a session, close the tab, reopen, and verify saved data.
- Sign out and open the deployment in a private window. No private notebook content should appear before login. The sample demo remains intentionally available.
- Use a second account and verify its notebook is empty and cannot read the first account’s notebook. Database RLS enforces this independently of the UI.
- Download a backup using the header download icon or Export notebook.

## Privacy and grounding

Authenticated notebooks persist in Supabase PostgreSQL, scoped by `auth.uid()` using RLS. The browser only fetches a notebook after authentication. Auth session tokens are managed by Supabase. Logging out clears the private notebook from application state. The demo uses a separate localStorage key and contains only sample material.

AI requests require a valid Supabase bearer token. The server validates the token, applies an atomic ten-generations-per-account-per-hour budget, and validates each exact source excerpt before returning drafts. AI content is clearly labeled as interpretation. Matching evidence does **not** prove the answer is accurate: human review is required. AI requests transmit supplied notes to OpenAI; extractive mode does not. Notes and provider errors are not logged by application code.

Merging preserves both excerpts verbatim, displayed together with a blank line between them. Merged excerpts may be noncontiguous and always remain linked to the original source. Source text itself is never changed by card editing.

This is a small single-notebook application per account. Updates are serialized within one tab; simultaneous edits in multiple tabs/devices use last-write-wins. There is a 5 MB notebook limit. Use one editing tab and export backups regularly.

## Backups

Exports include sources, excerpts, pending/approved/discarded cards, tags, recall history, next review dates, and session summaries. Keep backups private. The JSON is portable and readable; there is currently no in-app restore UI. It can be restored by writing its `sources`, `cards`, and `sessions` fields to the authenticated user’s `notebooks.data` record through the Supabase dashboard.

## Study model

Flashcards and short-answer quizzes use honest self-assessment. “Got it” schedules the next review after 1, 2, 4, 8, 16, then at most 30 days. “Again” resets the streak and returns the card in ten minutes. Focused sessions include up to ten currently due cards. Other study modes include up to twenty approved cards. Accuracy is self-reported recall, not independently verified mastery.

Notebook pages collect approved answers and their evidence by source. Process and how-to drafts are supported when present in the material; the application does not invent procedures absent from the notes. Sources accept plain text and Markdown; PDF/DOCX parsing and OCR are not included.

## Architecture

- React 19 + Vite, responsive CSS, Lucide icons
- Supabase email/password auth + PostgreSQL with RLS
- Vercel Node server function for authenticated AI extraction
- OpenAI Chat Completions, JSON output and server-side quote validation
- Node built-in test runner for grounding, approval state, and review scheduling

## Validation

Production build and five domain tests pass. Live Supabase authentication, cross-account RLS, AI provider calls, and Vercel deployment require your configured external services and must be verified after setup. No external credentials are bundled in this repository.

Built by Pedro Marques Correa Domingues as a human-in-the-loop study application.
