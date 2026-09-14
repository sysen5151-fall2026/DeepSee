# DeepSee local inference service

Django REST service that runs the chest X-ray CNN and the Bayesian symptom rules on the clinician's own network. The frontend calls it only when `NEXT_PUBLIC_API_URL` points here; otherwise the workspace runs in demo mode with a mock model.

## Requirements

- Python 3.10 to 3.12 (TensorFlow 2.19 does not support 3.13 yet)
- Roughly 1 GB of disk for TensorFlow and its dependencies

## Run

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r core/requirements.txt
cp .env.example core/.env          # optional, defaults work for local development
cd core
python manage.py migrate
python manage.py runserver         # http://localhost:8000
```

Then start the frontend with `NEXT_PUBLIC_API_URL=http://localhost:8000`.

## Endpoints

| Method | Path                | Auth   | Purpose                                              |
| ------ | ------------------- | ------ | ---------------------------------------------------- |
| POST   | `/auth/signup/`     | none   | Create a clinician account                           |
| POST   | `/auth/login/`      | none   | Obtain JWT access and refresh tokens                 |
| POST   | `/auth/logout/`     | bearer | Ends the session (client discards tokens)            |
| GET    | `/auth/profile/`    | bearer | Current user profile                                 |
| POST   | `/api/upload-scan`  | bearer | Multipart image + vitals, returns ranked differential |

### `POST /api/upload-scan`

Multipart form fields: `image`, `birthdate` (YYYY-MM-DD), `gender`, `temperature`, `heartRate`, `systolicBP`, `diastolicBP`, `hasCough`, `hasHeadaches`, `canSmellTaste`.

Response (structured format consumed by the workspace, legacy keys retained):

```json
{
  "Covid-19": 0.31,
  "Pneumonia": 0.95,
  "age": 54,
  "imageModel": { "label": "Pneumonia", "confidence": 0.91, "threshold": 0.5 },
  "topPrediction": { "label": "Pneumonia", "confidence": 0.95 },
  "predictions": [
    { "label": "Pneumonia", "confidence": 0.95 },
    { "label": "Covid-19", "confidence": 0.31 },
    { "label": "Normal", "confidence": 0.09 }
  ],
  "severity": "High",
  "modelVersion": "cnn-pneumonia-v1",
  "processedAt": "2026-09-14T18:20:11Z"
}
```

## Model

`imaging_service/model/pneumonia_model.keras` is a five-block CNN trained on the Kaggle chest X-ray pneumonia dataset (about 5,000 images, binary Pneumonia vs Normal, reported accuracy 89.9%). Images are converted to greyscale and resized to 150 x 150 before inference. `imaging_service/knowledge_base.py` applies Bayesian updates for COVID-19 and pneumonia from vitals, symptoms, age and sex, and treats a positive CNN result as strong evidence for pneumonia.

Limitations: single binary finding, no localisation output, trained on a small and imbalanced dataset, and not clinically validated. See the project report in `docs/`.
