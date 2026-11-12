"""F.3.3 Evaluate Analysis Availability.

Function ID: F.3.3 (Innoslate entity 278159), child of F.3 Perform Clinical Analysis.
Performed by: P.3.3 Analysis Status Monitor (asset 297085).
Inputs:  IO.18 Analysis Status
Control: C.3 Analysis Acceptance and Timeout Criteria
Outputs: IO.12 Analysis Unavailable Notice (Unavailable branch only)

This is the OR decision on the F.3 action diagram: Available continues to
F.3.4; Unavailable issues IO.12 so the clinician continues without DeepSee (SR13).
"""

from __future__ import annotations

from .icom import (
    UNAVAILABLE_MESSAGE,
    AnalysisCriteria,
    AnalysisStatus,
    AnalysisUnavailableNotice,
    AvailabilityDecision,
    Clock,
)

FUNCTION_ID = "F.3.3"


def evaluate_analysis_availability(
    analysis_status: AnalysisStatus,
    *,
    criteria: AnalysisCriteria,
    clock: Clock,
) -> AvailabilityDecision:
    """Decide Available or Unavailable from IO.18 and the C.3 timeout."""
    now = clock()
    analysis_status.finished_at = now
    elapsed = max(0.0, now - analysis_status.started_at)

    reason = analysis_status.failure
    if reason is None and elapsed > criteria.timeout_seconds:
        reason = f"No result within {criteria.timeout_seconds:.0f} seconds of image acceptance (C.3 timeout)."

    if reason is not None:
        analysis_status.record(FUNCTION_ID, "unavailable")
        return AvailabilityDecision(
            available=False,
            elapsed_seconds=elapsed,
            notice=AnalysisUnavailableNotice(message=UNAVAILABLE_MESSAGE, reason=reason, elapsed_seconds=elapsed),
        )
    analysis_status.record(FUNCTION_ID, "available")
    return AvailabilityDecision(available=True, elapsed_seconds=elapsed)
