from datetime import datetime, timezone

from dateutil.relativedelta import relativedelta
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .knowledge_base import calculate
from .model.model_predict import MODEL_VERSION, PNEUMONIA_THRESHOLD, predict_pneumonia


def _parse_birthdate(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.strptime(value, "%m/%d/%Y")


def _as_bool(value, default: bool) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _severity(probability: float) -> str:
    if probability >= 0.7:
        return "High"
    if probability >= 0.4:
        return "Moderate"
    return "Low"


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

    try:
        has_pneumonia, pneumonia_probability = predict_pneumonia(request.FILES["image"])
    except Exception as exc:  # model or image failure
        return Response({"error": f"Image analysis failed: {exc}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    posteriors = calculate(has_pneumonia=has_pneumonia, **vitals)

    covid = float(posteriors["Covid-19"])
    pneumonia = float(posteriors["Pneumonia"])
    normal = round(max(0.0, 1.0 - max(covid, pneumonia)), 2)

    predictions = sorted(
        [
            {"label": "Pneumonia", "confidence": pneumonia},
            {"label": "Covid-19", "confidence": covid},
            {"label": "Normal", "confidence": normal},
        ],
        key=lambda item: item["confidence"],
        reverse=True,
    )

    payload = {
        # Legacy flat keys kept for older clients.
        "Covid-19": covid,
        "Pneumonia": pneumonia,
        "age": age,
        # Structured result consumed by the DeepSee workspace.
        "imageModel": {
            "label": "Pneumonia" if has_pneumonia else "Normal",
            "confidence": round(pneumonia_probability if has_pneumonia else 1 - pneumonia_probability, 4),
            "threshold": PNEUMONIA_THRESHOLD,
        },
        "topPrediction": predictions[0],
        "predictions": predictions,
        "severity": _severity(max(covid, pneumonia)),
        "modelVersion": MODEL_VERSION,
        "processedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    return Response(payload, status=status.HTTP_201_CREATED)
