# Aegis — AI Compliance Coworker (React)

A React rebuild of the original HTML/CSS/JS Aegis prototype, with a new UI and every original feature carried over.

## Run it

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Vite opens http://localhost:5173 automatically.

Production build:

```bash
npm run build     # outputs to dist/
npm run preview   # serves the built app
```

## Project structure

```
src/
  main.jsx                 entry point
  App.jsx                  shell: sidebar, top bar, page header, active view
  state/AppContext.jsx     all app state + actions (persisted to localStorage)
  data/
    demoData.js            demo dataset, packs, requirement options, page titles
    metrics.js             live KPI calculations and filters
    exporters.js           CSV / report downloads
  components/
    Sidebar.jsx            navigation with live badges + coverage meter
    Topbar.jsx             global search, quick actions, user menu
    Chrome.jsx             page header + principle banner, AI chat drawer, toasts
    ui.jsx                 Button, Status, Panel, Modal, Field, Avatar, etc.
    Icon.jsx               inline SVG icon set (no icon library needed)
  views/                   one file per section
    Overview.jsx  Cases.jsx  Workers.jsx  Evidence.jsx  Packs.jsx
    Controls.jsx  Integrations.jsx  Audit.jsx  Reports.jsx
  modals/Modals.jsx        add worker, intake evidence, import roster, worker
                           profile, case details, KPI drill-downs, pack rules,
                           audit record
  styles/
    tokens.css             colours, type, radii
    app.css                all component styles + responsive rules
```

## Features (all from the original, plus a few upgrades)

| Section | What it does |
| --- | --- |
| Overview & health | Verified-coverage ledger (one square per automated check), clickable KPI cards with drill-downs, compliance packs table with search/filter, urgent gaps queue with follow-up, live orchestrator feed |
| Remediation inbox | All cases with priority filter, per-case Slack follow-up, mark resolved, auto-chase all |
| Worker register | Roster with per-pack status, search + segments (clinical / corporate / with gaps), worker profile modal, Slack follow-up |
| Evidence & AI intake | Intake queue and OCR field inspector, confirm verification to close |
| Compliance packs | Four versioned packs with rules, verified %, open gaps |
| Custom controls | Plain-language rule drafter with pack selection, control registry, pause / activate |
| HRMS & connectors | HRMS sync, Slack/Teams assistant, CSV/Excel import |
| Audit trail | Signed event log, filter by event type, CSV export, record details with copy-proof |
| Reports | Downloadable print-ready reports (healthcare, I-9, tax) built from live data |
| Everywhere | Global search (press `/`), AI coworker chat drawer with quick prompts, toasts, add worker, sync HRMS, import roster, reload demo data |

State is saved to `localStorage`, so changes survive a refresh. Use **⋯ → Reload demo data** in the top bar to reset.

Sections are deep-linkable via the URL hash, e.g. `http://localhost:5173/#evidence`.

## Connecting a real backend

All mutations live in `src/state/AppContext.jsx` (`addWorker`, `submitEvidence`, `syncHrms`, `sendChat`, …). Replace the simulated `sleep()` calls there with API requests and the UI keeps working unchanged.
