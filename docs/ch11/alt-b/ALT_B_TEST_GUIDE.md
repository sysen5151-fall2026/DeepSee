# DeepSee Chapter 11 — Alternative B Prototype Spike

## Purpose
Create measurable evidence for **Alternative B — Hospital-Network Shared Inference** without changing the CNN or clinical-analysis logic.

The clinician workspace runs on one workstation. The existing Django/TensorFlow inference service runs on a second machine on the same trusted private LAN. The browser sends the same repository chest X-rays and the same fixed synthetic patient context to the shared inference host.

Do **not** use real patient data.

## 1. Shared inference host (Machine B)

Use a second computer on the same private network.

Find its LAN IPv4 address. Example: `192.168.1.50`.

In the DeepSee repository, set `backend/core/.env`:

```env
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=192.168.1.50,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Replace `192.168.1.50` with the actual address of the inference host.

Start the backend on that specific LAN interface:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r core/requirements.txt
cd core
python manage.py migrate
python manage.py runserver 192.168.1.50:8000
```

If the OS firewall asks, allow access only on the trusted/private network.

## 2. Clinician workstation (Machine A)

In `frontend/.env.local`:

```env
NEXT_PUBLIC_DEPLOYMENT_PROFILE=hospital-network-shared
NEXT_PUBLIC_API_URL=http://192.168.1.50:8000
```

Then rebuild/start the frontend:

```bash
cd frontend
npm install
npm run build
npm run start
```

Open `http://localhost:3000` and confirm the workspace can register/login and run one real analysis.

## 3. Add the measurement script

Copy:

`frontend/e2e/shared-browser-timing.cjs`

from this package into the same path in your DeepSee checkout.

The script uses the existing Playwright dependency and the four repository-supplied sample chest X-rays. It performs 3 warm-ups and then 30 sequential measured browser runs.

Timing boundary:

**image accepted / X-ray preview visible -> Ranked differential displayed**

This matches the Chapter 11 C1 definition used in the report and automates the patient-context/review steps between those two points.

## 4. Run the 30-trial measurement

From `frontend/` on the clinician workstation:

### macOS/Linux

```bash
SHARED_API_URL=http://192.168.1.50:8000 ALT_B_RUNS=30 node e2e/shared-browser-timing.cjs
```

### Windows PowerShell

```powershell
$env:SHARED_API_URL="http://192.168.1.50:8000"
$env:ALT_B_RUNS="30"
node e2e/shared-browser-timing.cjs
```

The script creates:

- `deepsee_alt_b_measured_timings.csv`
- `deepsee_alt_b_summary.json`

The JSON summary reports:

- P95 acceptance-to-display time (nearest-rank)
- successful runs / total runs
- completion percentage
- model version
- test images and test conditions

## 5. Put the results into Table 3-2

For Alternative B:

- **C1 Raw Measure** = `P95 = <summary value> s`
- **C1 Value Score** = `100 × clip((60 - t) / 59)`
- **C2 Raw Measure** = `<successful>/30 = <rate>%`
- **C2 Value Score** = `100 × clip((r - 95) / 5)`

Keep C3 at the planning estimate already used in the report unless the team replaces it with verified cost evidence.

## Notes / limitations

This is a course-project **prototype spike**, not a production hospital deployment. It adds a real network hop and separates the clinician workstation from the inference host, but it does not reproduce a managed hospital LAN, production TLS, enterprise identity, concurrent load, or high availability. Record those limitations in the report.
