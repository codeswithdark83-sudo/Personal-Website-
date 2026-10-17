# Design QA

Last updated with the merged full-stack branch.

**Verified (rendered, Chromium)**
- All public routes load at 320, 375, 768, 1024 and 1440 px with no horizontal overflow.
- Hero uses the real portrait; About uses the real workspace photo; mobile menu opens/closes (button, link, Escape); theme toggle persists across reload; project search filters.
- Anonymous requests to `/admin` redirect to `/admin/login`.

**Not verified**
- Side-by-side comparison against the supplied mockup at matching sizes (only visually spot-checked: hero, project grid).
- Light-theme contrast audit and keyboard-only walkthrough of every page.
- Real mobile devices and slow networks.
- Admin UI and data flows against a live database (the build sandbox could not reach Supabase).

**Open items**
- Project cards still show placeholder artwork until real screenshots are uploaded.
- Inquiry wizard checked at 375 px (no overflow); not checked on other devices.
