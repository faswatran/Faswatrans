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
- Bookings are inserted via a server function with the admin client; staff read/approve via RLS using has_role. The staff dashboard lives at an unlinked route (src/routes/admin-Lgn73.tsx) with sign-in only, no public sign-up, so it is not discoverable from the site.
- Short booking requests are validated and adapted in src/lib/booking.ts to existing records; pickup time and journey type use notes, and uncollected names/destinations are explicitly marked so no customer details are invented.
- Public delivery tracking goes through a server function that returns only progress fields (never contact details or addresses); booking progress is stored on the booking row as a tracking list.
