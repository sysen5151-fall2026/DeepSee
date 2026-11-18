# Demonstration script: primary use case

Five minute walk through of UC.1 Clinician Reviews a Chest X-ray Case, run from this
repository in connected mode (real CNN, no mock model). Written for the Lab 13 product demo
and kept as the demonstration script for the integrated build.

## Before the demo

1. Start the analysis service (Python 3.10 to 3.12):

   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r core/requirements.txt
   cd core && python manage.py migrate && python manage.py runserver
   ```

2. Create `frontend/.env.local` with one line, then start the workspace:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:3000. The workspace must be on port 3000, because the service
   only accepts requests from that origin. The header must read **Connected**. If it reads
   **Demo mode**, the `.env.local` file was not picked up: restart `npm run dev`.
4. Register a clinician account once, so the demo only needs a sign in.
5. Run one complete review as a warm up. The first analysis after the service starts loads
   the model and is slower than the rest.
6. Record that warm up run on screen as a backup.
7. Open three tabs: this repository (README showing), the workspace, and the Innoslate
   Asset Diagram for the Universe context.
8. Keep `backend/core/.env` and any terminal showing environment variables off screen.

## Part 1: repository and run (about 2 minutes)

1. Show the README: the Operational Concept section and the status colored context diagram.
2. Show how the code is organized:
   * `frontend/` is the clinician workspace.
   * `backend/core/imaging_service/clinical_analysis/` holds F.3 Perform Clinical Analysis,
     one module per function F.3.1 to F.3.4.
   * `tests/` holds 25 requirement tests named by requirement ID; `contracts/api-v1.yaml`
     is the interface contract.
3. Run UC.1 in the workspace:
   1. Sign in.
   2. Upload `frontend/assets/x-ray-images/00000001_001.png`.
   3. Enter the patient context and save it.
   4. Review the inputs and press **Run clinical analysis**.
   5. Read the result: finding, ranked differential, explanation, and the notice that the
      clinician remains responsible.
   6. Record a decision and show it under **Recent reviews**.

## Part 2: OpsCon to as built (about 2 minutes)

Show the Asset Diagram for the Universe context in Innoslate. Colors: green is working,
yellow is partial, red is not yet built. Click an element to read its status and where it
lives in the repository.

| Element | Say |
| --- | --- |
| C.0 DeepSee | Working. `frontend/` and `backend/core/`. Result presentation, decision capture and review records are partial. |
| X.C.1.1 Clinician | Working. `frontend/app/` with sign in from `backend/core/auth_service/`. |
| X.C.1.3 Clinical Data Source | Partial. The clinician picks an image file and types the context. No PACS or EHR connection. |
| X.C.1.2 Hospital IT / Local Network | Partial. Everything runs on one local machine and no public AI endpoint is called. No hospital deployment. |
| X.C.1.5 Development and Maintenance Team | Partial. CI and requirement tests on every push. No update or rollback procedure. |
| X.C.1.6 Privacy and Compliance Reviewers | Not yet built. No audit records. |
| X.C.1.7 Hospital Leadership | Not yet built. No performance report. |

Name one thing that changed from the concept. Example: the model retired the clinician
workstation store and moved saved reviews inside the system, but the code still keeps them
in browser storage. The change is modeled and not yet built.

## Part 3: what is left (about 1 minute)

Show the open GitHub issues. They cover audit records and reviewer access, the performance
report, PACS and EHR intake, the model update procedure, and the context documents that
predate the current model.

## If something fails

* The analysis does not return: show the analysis unavailable notice. That is the SR13
  path working as designed. Then play the backup recording.
* The header reads Demo mode: say so. Demo mode uses a mock model in the browser and is
  not the CNN.
