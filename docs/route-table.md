# Route table: product entry points to use case steps

Lab Manual Chapter 6. Each entry point a user or client can reach is mapped to
the Innoslate use case step it serves and the function that performs it.
Use cases: UC.1 Clinician Reviews a Chest X-ray Case, UC.5 Authenticate User,
UC.6 Handle Analysis Unavailable.

## Frontend pages (Next.js, `frontend/app/`)

| Route | File | Use case step | Function |
| --- | --- | --- | --- |
| `/login` | `login/page.tsx` | UC.5 Authenticate User | F.0.1 Authenticate Users |
| `/register` | `register/page.tsx` | UC.5 (account creation; see SR12 note in SPEC.md) | F.0.1 |
| `/analyze` | `analyze/page.tsx` | UC.1.1 Select Chest X-ray Case, UC.1.8 Submit Case for Analysis | F.1, F.2, then calls F.3 |
| `/analyze` (error state) | `analyze/page.tsx` | UC.1.10 Result Available? = No, UC.1.13 Notify Clinician Analysis Unavailable, UC.1.16 Continue Unassisted Clinical Review (UC.6) | F.3.3 to IO.12, F.0.4 |
| `/result` | `result/page.tsx` | UC.1.12 Present Explainable Results, UC.1.15 Review Clinical Results, UC.1.17 Record Clinician Decision | F.4, F.5 |
| `/cases` | `cases/page.tsx` | UC.1.18 Store Review Record, UC.2 Reopen or Export a Saved Review | F.6 |
| `/about` | `about/page.tsx` | Intended use and limitations (SR17) | none |

## Backend API (Django, `backend/core/`)

| Method and path | View | Use case step | Function |
| --- | --- | --- | --- |
| `POST /auth/login/` | `auth_service.views.login_view` | UC.5 | F.0.1 |
| `POST /auth/signup/` | `auth_service.views.signup_view` | UC.5 | F.0.1 |
| `POST /auth/logout/` | `auth_service.views.logout_view` | UC.5 | F.0.1 |
| `GET /auth/profile/` | `auth_service.views.profile_view` | UC.5 | F.0.1 |
| `POST /api/upload-scan` (201) | `imaging_service.views.upload_scan` | UC.1.9 Perform Clinical Analysis, UC.1.10 = Yes, UC.1.11 Generate Clinical Explanation | F.3 (F.3.1 to F.3.4) |
| `POST /api/upload-scan` (503) | `imaging_service.views.upload_scan` | UC.1.10 = No, UC.1.13 (UC.6) | F.3.3 to IO.12 |

## Not routed yet

UC.3 Administer Local Deployment and Access and UC.4 Update and Revalidate
Model and Knowledge Rules have no product route; they are operational
procedures today (Django admin at `/admin/` covers part of UC.3).
