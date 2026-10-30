<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Architecture

- The app's data lives in the user's own external Supabase project, not a Lovable-managed database. Treat that connected project as the single source of truth for schema and credentials, and read its live schema before writing queries or migrations.
- After the backend connection changes, resync the stored credentials and `.env` with the Supabase rebind-secrets action instead of hand-editing `.env`; hand-edited values go stale and silently point the app at the wrong project.
- Application data access is gated by row-level-security policies written per table; a table with RLS enabled but no policies is unreachable from the app, so ship the policies in the same change that wires a screen to that table.
