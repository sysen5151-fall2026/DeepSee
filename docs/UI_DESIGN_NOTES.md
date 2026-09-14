# DeepSee UI redesign

This redesign turns the existing chest X-ray prototype into a clinician-first interface aligned with the SYSEN 5151 DeepSee product direction.

## Design principles

- **Clinical hierarchy over marketing UI:** patient context, imaging, ranked differential, evidence, and clinician action are visually prioritized.
- **Human-in-the-loop:** the interface repeatedly distinguishes model suggestions from clinician decisions.
- **Privacy made visible:** local processing and PHI-local status are persistent UI elements rather than buried in copy.
- **Calm medical visual system:** off-white surfaces, deep teal, restrained amber for priority review, minimal gradients, and high-contrast typography.
- **Explainability:** the result screen includes an evidence trail and clearly marks the biomedical citation layer as not connected in the current X-ray prototype rather than fabricating references.

## Updated screens

### Home / overview
- Rebranded the product as **DeepSee**.
- Added a clinician-workspace preview with X-ray, ranked differential, evidence, and local-model status.
- Added workflow and system-boundary messaging.

### Clinician sign-in
- Replaced the full-screen stock-background treatment with a clean secure-workspace layout.
- Added local-processing, differential-first, and traceability explanations.

### New clinical review
- Replaced the centered consumer-style stepper with a desktop clinician workflow.
- Added a persistent left progress rail.
- Added privacy and human-control status.
- Preserved the existing X-ray upload, vitals/symptoms collection, and analysis API flow.

### Results / case interpretation
- Added a high-level clinical summary and compact case metrics.
- Redesigned imaging review and heatmap presentation.
- Replaced chart-heavy output with a scan-friendly ranked differential list.
- Added an evidence trail that distinguishes actual prototype inputs from the future ontology/citation layer.
- Added clinician next-step prompts and a persistent human-in-the-loop safeguard.
- Updated the exported PDF report branding and disclaimer.

## Security cleanup

The uploaded project contained large obfuscated JavaScript payloads appended to `tailwind.config.js` and `postcss.config.mjs`. The payloads referenced network requests, process spawning, and dynamic evaluation. These were unrelated to the UI project and unsafe to execute. Both configuration files were replaced with clean minimal versions, and `next.config.js` was simplified.

## Files changed

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/analyze/page.tsx`
- `app/result/page.tsx`
- `components/ui/Navbar.tsx`
- `components/ui/Footer.tsx`
- `components/ui/LoginForm.tsx`
- `components/ui/ImageUploader.tsx`
- `components/ui/PatientVitalsForm.tsx`
- `tailwind.config.js`
- `postcss.config.mjs`
- `next.config.js`
- `public/demo-xray.png`

## Validation performed

The modified TS/TSX files were parsed using the TypeScript compiler's `transpileModule` API and passed syntax diagnostics. A full Next.js build was not run because dependencies could not be completely installed in this sandbox environment.
