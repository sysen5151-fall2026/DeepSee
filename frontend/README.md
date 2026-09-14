# DeepSee clinician workspace (frontend)

Next.js 15 / React 19 / TypeScript / Tailwind CSS application for the DeepSee clinical review flow: imaging upload, patient context, ranked differential, evidence trail, clinician decision, local case history, and PDF export.

## Run in demo mode (no backend)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, sign in with any username and password, and start a review. The demo mode uses a mock model that derives a differential from the entered vitals and symptoms.

## Run against the local inference service

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

See `../backend/README.md` for starting the service.

## Scripts

| Script              | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Development server               |
| `npm run typecheck` | TypeScript check without emit    |
| `npm run build`     | Production build                 |
| `npm run start`     | Serve the production build       |

## Layout

```
app/            Routes: / (overview), /login, /register, /analyze, /result, /cases, /about, /contact
components/     Navbar, Footer, ImageUploader, PatientVitalsForm, HeatmapViewer, forms, ProtectedRoute
hooks/          useAuth (JWT in connected mode, mock auth in demo mode)
utils/          apiClient, xrayAnalysisService, mockService, predictions, caseHistory
lib/config.ts   Demo/connected mode detection
public/         Manifest, icons, offline fallback, demo X-ray
```

## Privacy boundary

The workspace never calls a public AI endpoint. In demo mode everything runs in the browser. In connected mode it calls only the URL in `NEXT_PUBLIC_API_URL`. Saved reviews live in the browser's localStorage on the clinician's workstation.
