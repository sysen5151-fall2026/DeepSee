# Environment

The toolchain, recorded so a new team member or the instructor can reproduce it
without guessing. Lab Manual §1.4.2. Versions below are the ones actually pinned
in `frontend/package.json` and `backend/core/requirements.txt`; update this file
and those manifests together.

## Clinician workspace

| | |
| --- | --- |
| Language / version | TypeScript 5, Node.js 20 (the version CI runs) |
| Framework | Next.js 15.3, React 19 |
| Styling | Tailwind CSS 3 |
| Runtime | local, `npm run dev` on the clinician workstation |

## Local inference service

| | |
| --- | --- |
| Language / version | Python 3.10–3.12 (CI runs 3.12) |
| Framework | Django 5.2, Django REST Framework 3.16, SimpleJWT 5.5 |
| Runtime | local virtual environment, `python manage.py runserver` |
| Database | SQLite by default; PostgreSQL via `DATABASE_URL` |

## In-product model

| | |
| --- | --- |
| Model runner | TensorFlow 2.19, **local** — no hosted inference API |
| Model | `cnn-pneumonia-v1`, five-block CNN, `pneumonia_model.keras`, binary pneumonia classifier |
| Refinement | in-product Bayesian prior/likelihood table (`knowledge_base.py`) |
| Hosting decision | local — see [ADR-0001](adr/0001-initial-toolchain.md) |

No product feature calls a hosted language-model API. This is a deliberate
constraint, not an omission; see ADR-0001.

## Shared tooling

| | |
| --- | --- |
| Version control | Git; GitHub (`sysen5151-fall2026/DeepSee`), `main` protected |
| CI | GitHub Actions — frontend typecheck + build, backend syntax check |
| End-to-end check | `frontend/e2e/smoke.js`, Playwright driving installed Edge |
| License | MIT |

## Editors and assistants in use

The coding assistant is a separate concern from the in-product model above — see
*Two Different AIs* in the Lab Manual front matter.

| Team member | Editor | Coding assistant |
| --- | --- | --- |
| Zhuoran Wang | VS Code | Claude Code (Opus) |
| _(teammate 2)_ | _(fill in)_ | _(fill in)_ |
| _(teammate 3)_ | _(fill in)_ | _(fill in)_ |
| _(teammate 4)_ | _(fill in)_ | _(fill in)_ |

> **Before submission:** complete the table above. Every team member's editor and
> assistant must be named here — the prompt log's entries are checked against it.
