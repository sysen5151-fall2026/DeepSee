"""ICOM types for F.3 Perform Clinical Analysis.

Each class is one arrow on the F.3 second-level IDEF0 in the Innoslate model
(DeepSee project, Figure 2 of the Architecture Definition Form). Inputs and
outputs become parameters and return values; the control becomes a settings
object; mechanisms (P.3.1 to P.3.4) are handed to the code as tools.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional, Protocol


@dataclass(frozen=True)
class ConfirmedInputs:
    """IO.5 Confirmed Inputs: the chest X-ray and patient context the clinician confirmed in F.2."""

    image_bytes: bytes
    image_width: int
    image_height: int
    age: float
    gender: str
    temperature: float
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    has_cough: bool
    has_headache: bool
    can_smell: bool
    exam_id: str = ""


@dataclass(frozen=True)
class AnalysisSubmission:
    """I.3 Analysis submission: the clinician's request that starts F.3."""

    user_id: str
    submitted_at: float  # seconds, from the injected clock


@dataclass(frozen=True)
class AnalysisCriteria:
    """C.3 Analysis Acceptance and Timeout Criteria (controls F.3.1 to F.3.4)."""

    pneumonia_threshold: float = 0.5   # model_predict.PNEUMONIA_THRESHOLD
    timeout_seconds: float = 60.0      # SR2, SR13
    min_image_side_px: int = 64        # smallest image side accepted for analysis
    score_cap: float = 0.95            # knowledge layer cap; scores are not probabilities


@dataclass(frozen=True)
class ImageFindingScores:
    """IO.17 Image Finding Scores: F.3.1 to F.3.2."""

    pneumonia_probability: float
    has_pneumonia: bool
    threshold: float
    model_version: str


@dataclass
class AnalysisStatus:
    """IO.18 Analysis Status: progress, failure and elapsed time, F.3.1 and F.3.2 to F.3.3."""

    started_at: float
    steps: list = field(default_factory=list)   # [(function_id, outcome)]
    failure: Optional[str] = None
    finished_at: Optional[float] = None

    def record(self, function_id: str, outcome: str) -> None:
        self.steps.append((function_id, outcome))

    def fail(self, function_id: str, reason: str) -> None:
        self.steps.append((function_id, "failed"))
        self.failure = reason


@dataclass(frozen=True)
class Prediction:
    label: str
    confidence: float


@dataclass(frozen=True)
class ClinicalAnalysisResult:
    """IO.8 Clinical Analysis Result: ranked differential and severity from F.3.2."""

    predictions: tuple
    top_prediction: Prediction
    severity: str
    image_model: ImageFindingScores
    observed: dict


@dataclass(frozen=True)
class ClinicalExplanation:
    """IO.9 Clinical Explanation from F.3.4 (SR1)."""

    summary: str
    image_finding: str
    contributing_factors: tuple
    caveat: str


@dataclass(frozen=True)
class AnalysisUnavailableNotice:
    """IO.12 Analysis Unavailable Notice from F.3.3 (SR13)."""

    message: str
    reason: str
    elapsed_seconds: float


@dataclass(frozen=True)
class AvailabilityDecision:
    """Result of the F.3.3 OR decision: Available, or Unavailable with IO.12."""

    available: bool
    elapsed_seconds: float
    notice: Optional[AnalysisUnavailableNotice] = None


@dataclass(frozen=True)
class F3Outcome:
    """Everything F.3 hands to F.4: IO.8 and IO.9 when available, IO.12 when not."""

    decision: AvailabilityDecision
    result: Optional[ClinicalAnalysisResult] = None
    explanation: Optional[ClinicalExplanation] = None
    status: Optional[AnalysisStatus] = None


class ChestXrayClassifier(Protocol):
    """P.3.1 Chest X-ray CNN, the mechanism of F.3.1. Returns the pneumonia probability."""

    model_version: str

    def __call__(self, image_bytes: bytes) -> float: ...


KnowledgeLayer = Callable[..., dict]
"""P.3.2 Knowledge Layer, the mechanism of F.3.2 (knowledge_base.calculate)."""

Clock = Callable[[], float]
"""Time source used by P.3.3 Analysis Status Monitor (time.monotonic in production)."""

UNAVAILABLE_MESSAGE = (
    "No analysis result is available. Continue the established review without DeepSee assistance."
)
