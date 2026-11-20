# Hume City FC Girls Program — temporary prototype pack

Draft website and coach tools prepared for **Hume City Football Club** (Broadmeadows / Hume, Melbourne’s north) by Trump Technology & Engineering.

This pack is a **temporary local prototype**. It is **not deployed** and must not be published until the club supplies real copy, photos and a proper production setup. **Do not enter real player data.**

## Open it right now

**Important:** right-click the zip and choose Extract All (or unzip) *before* opening any page. Opening an HTML file from inside a zip, or in OneDrive’s web preview, often hides the styling and can make the coach dashboard look empty or unstyled.

The coach dashboard (`coach/index.html`), the start page (`index.html`) and the Girls Program page are now **self-contained** (CSS and scripts are inside the HTML). You can double-click them after extracting. No passphrase is required, and sample players load automatically if the browser has no saved data.

Optional: from the extracted folder, run `python3 -m http.server` and open http://localhost:8000/ — useful if a browser is strict about `file://`.

1. Unzip the folder if needed.
2. Double-click **`index.html`**. No web server, no internet connection, and no password are required.
3. Use the three cards:
   - **Girls Program** — public landing page (`girls/index.html`)
   - **Coach Dashboard** — opens with sample data, no password
   - **Excel mock-up** — `Hume_City_FC_Girls_Coach_Dashboard_Mockup.xlsx`

There is also a public-style home at `site/index.html` and a Boys Program “coming soon” stub at `boys/index.html`.

Everything uses **relative links**, bundled CSS/JS and system fonts, so it works from `file://` after unzipping.

## Club colours and crest

Hume City FC’s colours are **red and white** (confirmed from Football Victoria strip lists and public club listings), not blue and white. This pack uses a red/white palette.

The shield in the header is a **placeholder crest only**. The official club logo has not been supplied and has not been copied.

## Public site structure

```
index.html              Prototype hub (this is the start page)
site/index.html         Public-style club home (programs intro)
girls/index.html        Girls Program public landing page
boys/index.html         Boys Program coming-soon stub
css/styles.css          Shared stylesheet
js/main.js              Mobile nav only
assets/crest.svg        Placeholder crest
robots.txt              Disallows /coach/
coach/                  Coach dashboard (not in the public nav)
```

### Public Girls page sections

1. Hero / banner with placeholder photo block and calls to action  
2. Pathway / Divisions  
3. Coaching staff and technical director profile cards (placeholder names)  
4. Training behind the scenes (session planning, development pathway, weekly rhythm)  
5. Matchday behind the scenes (pre-match, timeline, post-match review)  
6. Register interest / volunteer call to action (mailto placeholder)  
7. Footer  

**Pathway names used**

- MiniRoo U8 - U12 (mixed)  
- Girls U8 - U18  
- U16 Girls (listed on the club’s Team App; confirm with the club before publishing)  
- Senior Women (State League North-West 4)  

Individual year groups are to be confirmed by the club. Source: [humecityfc.com/join](https://humecityfc.com/join/).

### How to add a Boys section later

1. The stub already exists at `boys/index.html`, using these Join-page names only:
   - MiniRoo U8 - U12  
   - Community U12 - U16  
   - NPL U13 - U18  
   - Senior Development Phase (U20, U23, Seniors)  
2. Copy `girls/index.html` as a starting point and replace the content. Keep the shared stylesheet.  
3. In the header on `site/index.html`, `girls/index.html` and `boys/index.html`, change the disabled “Boys Program — Coming soon” item into a real link: `href="../boys/index.html"` (or `boys/index.html` from the hub).  
4. On `site/index.html`, turn the Boys program card into a live link.  
5. Do not invent further team names until the club confirms them.

The Coach Dashboard is **not** linked from the public navigation. Coaches open `coach/index.html` from this hub, or by typing the path.

## Coach Dashboard

Location: `coach/index.html` (self-contained; CSS and JS are also kept as sources under `coach/css/` and `coach/js/`).

- Hidden from the public nav  
- `<meta name="robots" content="noindex, nofollow">` and `robots.txt` Disallow for `/coach/`  
- No sign-in gate. The dashboard opens straight onto sample data. If the browser cannot use localStorage, the sample set is kept in memory for that session.  
- “Signed in as coach” selector (prototype scoping only, not real security): Selena sees U9 Girls, David Crisp and assistant coach Hakan Dogan see the Under 14s, Ozzi (Technical Director) can view every team. Other sample coaches are placeholders.  
- Team switcher: U9 Girls, Girls U8 - U18, Under 14s, U16 Girls, Senior Women, MiniRoo U8 - U12  
- Tabs (usable on a phone): Roster, Tracking, Assessment, Fitness, Tasks, Medical, Matches, Fixtures, Sessions, Equipment, Comms, Reports, Settings  

### Features

- Rosters with player emails, parent/guardian contacts (name, relationship, email, phone, second contact), add/edit/delete, CSV import/export  
- Attendance (Training or Match, present/absent, percentage)  
- Membership fees (Unpaid / Part paid / Paid, amount, date)  
- Uniform order, collection and configurable size, with summary counts and filters  
- Quarterly fitness tracker: configurable periods (default Previous plus Q1–Q4) and metrics, values per player per period, SVG sparkline, % change vs first and previous period (green = improvement, red = decline, using each metric’s “better” direction)  
- Fitness tests & assessment: a 7-test fitness battery (sit-ups, star jumps, squats, over barrier, 20m sprint, beep test, plank) and 4 ball-skill tests (juggling, passing accuracy, dribbling, first touch). Enter results for the whole squad, carry forward a previous result if a player was injured, and auto-calculate squad rankings per test and overall across Previous / Q1 / Q2 / Q3 / Q4 (green ▲ improved, red ▼ dropped). Attendance % auto-fills from training and game-day records. Coaches add status, feedback and “even better” notes against the six report-card criteria. A printable, confidential report card matches the club’s layout. Fitness reports open as a mailto draft or a printable view only — nothing is sent automatically. Sample results are seeded for two periods (Interim and Mid Season) on the U9 Girls, Under 14s and Girls U8–U18 squads.  
- Email report: preview modal, mailto (BCC for bulk), copy, download HTML; option to add a communication log entry after send  
- Injury/medical notes (date, type, description, Active / Recovering / Cleared, follow-up flag and date), team alert count and flagged filter, plus a sensitivity warning  
- Match results and stats (P, W, D, L, GF, GA, GD, goals, assists, minutes, top scorers)  
- Weekly session plan (theme, warm-up, activity blocks, game, cool-down, equipment, notes; save, duplicate, print)  
- Equipment inventory checklist  
- Dated development notes  
- Family communication log (Email / Phone / In person / SMS); “Last contacted” on the roster, highlight at 30+ days  
- Fixtures: upcoming list, next-match highlight and countdown, link through to match results, Add to calendar (.ics), manual add/edit, **Import Dribl fixtures (CSV)** with a column mapper that is saved after first use  
- Player tasks: coaches can create task sets per team (for example Summer Break Tasks). Each task has a title, category (fitness / skills / knowledge / team), description, frequency or target, and an optional due date. A checkbox grid tracks completion, with a % complete per player and per team. A sample U11 / Girls U8–U18 set is seeded from a 2024–25 summer break sheet issued by the U11 Girls coaching staff (real player names removed). It includes fitness, ball skills, soccer-knowledge clips, a goalkeepers-only session, the extra task to learn new teammates' names and faces, a note that training was due to restart on Tuesday 28 January 2025 (Tue & Thu, 5:45–6:50pm), and a reminder for parents to join the team's Team App. Task progress is included in the email report.
  

A sample Dribl-style CSV is at `coach/sample/dribl-fixtures-sample.csv`.

### Dribl fixtures

The club uses **Dribl** (Football Victoria’s competition platform; app.dribl.com). There is **no documented public API** for third-party automatic sync.

Coaches and admins can export Events (fixtures) from Dribl: **Events → Filter → Export → Exports → Download**, then use **Import Dribl fixtures (CSV)** in the dashboard. Likely columns include date, time, round, home team, away team, venue/ground, field, league/competition and age group; headers can vary, so the coach maps them once.

**Do not scrape** Dribl or fv.dribl.com. Real automatic sync would need official API access requested from Dribl or Football Victoria.

### Data model (localStorage)

Key: `hcfc-coach-dashboard-v1`. Export/Import JSON and “Reset sample data” / “Clear all data” are in Settings. Seed data uses obviously fake names (`Sample Player 01`) and `@example.com` addresses.

```
{
  version, currentTeamId, currentCoachId,
  teams: [{ id, name }],
  players: [{ id, teamId, name, email, guardian1, guardian2, feeStatus, feeAmount, feeDate, uniformOrder, uniformCollection, uniformSize }],
  sessions: [{ id, teamId, date, type }],          // type: Training | Match
  attendance: [{ sessionId, playerId, present }],
  periods: [{ id, name, start, end }],
  metrics: [{ id, name, unit, lowerIsBetter }],
  assessments: [{ playerId, periodId, metricId, value }],
  tests: [{ id, group, name, unit, lowerIsBetter }],
  testResults: [{ playerId, periodId, testId, value, carriedForward }],
  reportCards: [{ id, playerId, periodId, overallRating, notes, criteria }],
  medical: [{ id, playerId, date, type, description, status, needsFollowUp, followUpDate }],
  matches: [{ id, teamId, date, opponent, homeAway, scoreFor, scoreAgainst, result }],
  matchStats: [{ matchId, playerId, goals, assists, minutes }],
  fixtures: [{ id, teamId, date, time, round, homeTeam, awayTeam, venue, field, competition, ageGroup, isSample, matchId }],
  sessionPlans: [{ id, teamId, week, date, theme, warmup, activities, game, cooldown, equipment, notes }],
  equipment: [{ id, teamId, item, quantity, condition, location, checked, lastChecked }],
  developmentNotes: [{ id, playerId, date, text }],
  comms: [{ id, playerId, date, method, summary, followUpNeeded }],
  taskSets: [{ id, teamId, name, source, createdDate, dueDate, notes }],
  tasks: [{ id, setId, title, category, description, frequency, target, dueDate, url }],
  taskProgress: [{ setId, taskId, playerId, complete, completedDate }],
  settings: { uniformSizes, driblFixtureMap, technicalDirector, policiesNote, coaches }  // coaches include teamId and canViewAll
}
```

Data stays in the browser that opened the file. It is not stored on a server.

## Excel mock-up

`Hume_City_FC_Girls_Coach_Dashboard_Mockup.xlsx` mirrors the dashboard with sample players only. Sheets include roster (with contacts), attendance, fees, uniforms, fitness (improvement and decline), player report, medical, matches and stats, session plan, equipment, development notes, communication log, fixtures, and **Assessment & Report Card** (test entry by quarter, RANK formulas, and a Player ID-driven report card layout).


## Club contacts in the coach area

These appear only in the coach dashboard (not on the public pages):

- **Ozzi (Technical Director)** — td@humecityfc.com — for concerns or feedback
- **David Crisp** — Under 14s coach — email and phone are placeholders (`coach.u14s@example.com`)
- **Hakan Dogan** — Under 14s assistant coach (with David Crisp) — email and phone are placeholders (`assistant.u14s@example.com`)
- **Selena** — Under 9 girls coach — email and phone are placeholders (`coach.u9girls@example.com`)
- Club policies are on the club's Team App, under the Documents tab

Player records in this prototype remain sample-only (Sample Player 01, @example.com). Do not add real player names, teammate lists, or personal coach email addresses.

## Privacy

The players in a real girls’ program include **minors**. This prototype is not a safe place for real names, emails, phone numbers or medical notes.

A production version needs:

- Real authentication and role-based access (medical notes restricted to the head coach, and encrypted)  
- A hosted database, not browser localStorage  
- Parent or guardian consent for collecting and emailing reports  
- Consideration of the **Australian Privacy Act** (and any club / Football Victoria child-safety rules)  
- A real email service if reports are to be sent automatically (for example Resend, SendGrid or Microsoft 365)  
- Official Dribl or Football Victoria API access if fixtures are to sync automatically  

## Next steps to productionise

1. Replace all placeholder copy, staff names and photo blocks; confirm year groups and the U16 Girls listing with the club.  
2. Use the official crest only with club permission.  
3. Add real hosting, HTTPS, authentication and a database.  
4. Replace the mailto form and report “send” with a server-side mail service.  
5. Request official Dribl API access rather than scraping.  
6. Complete a privacy and child-safety review before any live data is entered.

## Licence / status

Draft only. Not for public release in this form.
