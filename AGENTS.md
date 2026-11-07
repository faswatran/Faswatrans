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

- Company contact details, routes and fares live in src/lib/company.ts; the AI assistant prompt reads from it, so edit there only.
- Public bookings use browser publishable-client RPCs with database validation, fixed pending status and no customer-row read access; staff read/approve via RLS using has_role. Keep the dashboard unlinked and sign-in only.
- Short booking requests and shared customer-message builders live in src/lib/booking.ts; validated full names map to existing records, pickup time and journey type use notes, and uncollected destinations stay explicitly marked so no customer details are invented.
- Public tracking uses a code-scoped database RPC returning only progress fields, never customer contact details or addresses; new booking codes have 12 random hexadecimal characters.
