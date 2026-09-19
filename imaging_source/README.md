# imaging_source/

Boundary element: **Chest X-ray image source** — today a file already on the
clinician's workstation; DICOM ingestion and PACS integration are on the roadmap.

What crosses this boundary is defined in [`docs/context.md`](../docs/context.md):
one frontal chest radiograph in, nothing out.

**No code lives here yet.** Ingestion is `frontend/components/ui/ImageUploader.tsx`
and preprocessing is `backend/core/imaging_service/model/model_predict.py`. This
directory is the traceability anchor for the Chapter 7 interface contract for
this boundary.
