import io
import time
from dataclasses import asdict
from datetime import datetime, timezone

from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .clinical_analysis import (
    AnalysisCriteria,
    AnalysisSubmission,
    ConfirmedInputs,
    perform_clinical_analysis,
)
from .knowledge_base import calculate
from .model.model_predict import MODEL_VERSION, PNEUMONIA_THRESHOLD, predict_pneumonia

# C.3 Analysis Acceptance and Timeout Criteria (see SPEC.md SR2, SR13).
ANALYSIS_CRITERIA = AnalysisCriteria(pneumonia_threshold=PNEUMONIA_THRESHOLD, timeout_seconds=60.0)


class KerasChestXrayClassifier:
    """Adapter that lets the Keras CNN act as mechanism P.3.1 for F.3.1."""

    model_version = MODEL_VERSION

    def __call__(self, image_bytes: bytes) -> float:
        _, probability = predict_pneumonia(io.BytesIO(image_bytes))
        return probability


def _image_size(image_bytes: bytes) -> tuple[int, int]:
    from PIL import Image

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            return img.size
    except Exception:
        return (0, 0)


def _parse_birthdate(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.strptime(value, "%m/%d/%Y")


def _as_bool(value, default: bool) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_scan(request):
    """
    Run the chest X-ray classifier on the uploaded image, refine the result
    with vitals and symptoms through the knowledge base, and return a ranked
    differential for the clinician workspace.
    """
    if "image" not in request.FILES:
        return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

    birthdate_raw = request.data.get("birthdate")
    if not birthdate_raw:
        return Response({"error": "Birthdate is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        birthdate = _parse_birthdate(str(birthdate_raw))
    except ValueError:
        return Response(
            {"error": "Invalid birthdate format. Use YYYY-MM-DD or MM/DD/YYYY"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    age = relativedelta(datetime.now(), birthdate.replace(tzinfo=None)).years

    try:
        vitals = {
            "systolic_pressure": int(request.data.get("systolicBP", 120)),
            "diastolic_pressure": int(request.data.get("diastolicBP", 80)),
            "temperature": float(request.data.get("temperature", 37.0)),
            "heart_rate": int(request.data.get("heartRate", 75)),
            "has_cough": _as_bool(request.data.get("hasCough"), False),
            "has_headache": _as_bool(request.data.get("hasHeadaches"), False),
            "can_smell": _as_bool(request.data.get("canSmellTaste"), True),
            "age": float(age),
            "gender": str(request.data.get("gender", "female")),
        }
    except (TypeError, ValueError) as exc:
        return Response({"error": f"Invalid parameter value: {exc}"}, status=status.HTTP_400_BAD_REQUEST)

    # IO.5 Confirmed Inputs and I.3 Analysis submission for F.3 Perform Clinical Analysis.
    submitted_at = time.monotonic()
    image_bytes = request.FILES["image"].read()
    width, height = _image_size(image_bytes)
    confirmed_inputs = ConfirmedInputs(
        image_bytes=image_bytes,
        image_width=width,
        image_height=height,
        age=vitals["age"],
        gender=vitals["gender"],
        temperature=vitals["temperature"],
        heart_rate=vitals["heart_rate"],
        systolic_bp=vitals["systolic_pressure"],
        diastolic_bp=vitals["diastolic_pressure"],
        has_cough=vitals["has_cough"],
        has_headache=vitals["has_headache"],
        can_smell=vitals["can_smell"],
        exam_id=str(request.data.get("examId", "")),
    )
    submission = AnalysisSubmission(user_id=str(request.user.pk), submitted_at=submitted_at)

    outcome = perform_clinical_analysis(
        confirmed_inputs,
        submission,
        criteria=ANALYSIS_CRITERIA,
        classifier=KerasChestXrayClassifier(),
        knowledge_layer=calculate,
    )

    # F.3.3 Unavailable branch: IO.12 Analysis Unavailable Notice, no result shown (SR13).
    if not outcome.decision.available:
        notice = outcome.decision.notice
        return Response(
            {
                "error": notice.message,
                "analysisUnavailable": {
                    "message": notice.message,
                    "reason": notice.reason,
                    "elapsedSeconds": round(notice.elapsed_seconds, 2),
                },
                "analysisStatus": outcome.status.steps,
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # F.3.3 Available branch: IO.8 Clinical Analysis Result and IO.9 Clinical Explanation.
    result = outcome.result
    scores = result.image_model
    predictions = [{"label": p.label, "confidence": p.confidence} for p in result.predictions]
    by_label = {p.label: p.confidence for p in result.predictions}

    payload = {
        # Legacy flat keys kept for older clients.
        "Covid-19": by_label["Covid-19"],
        "Pneumonia": by_label["Pneumonia"],
        "age": age,
        # Structured result consumed by the DeepSee workspace.
        "imageModel": {
            "label": "Pneumonia" if scores.has_pneumonia else "Normal",
            "confidence": round(
                scores.pneumonia_probability if scores.has_pneumonia else 1 - scores.pneumonia_probability, 4
            ),
            "threshold": scores.threshold,
        },
        "topPrediction": predictions[0],
        "predictions": predictions,
        "severity": result.severity,
        "explanation": asdict(outcome.explanation),
        "analysisStatus": outcome.status.steps,
        "modelVersion": scores.model_version,
        "processedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    return Response(payload, status=status.HTTP_201_CREATED)
