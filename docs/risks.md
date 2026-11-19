DeepSee Product Risk Register
This register covers the workstation-local DeepSee prototype. The model
references come from the F.0 and F.3 action diagrams, the P.3 hierarchy,
and the Chapter 12 system risk assessment. Likelihood and overall
impact use the team's 1–5 scales. Ratings copied from the system
assessment describe the overlapping scenario before verification of the
new guardrail. Product risks without a team rating remain open for review.
Product risk	Scenario and effect	Innoslate trace	System risk	Likelihood	Overall impact	Status or planned response
PR-01 — Incorrect or ambiguous result presented as valid	A well-formed but incorrect or ambiguous differential can bias the clinician's review if it is shown as a clear leading suggestion.	F.3.1–F.3.4, P.3.1–P.3.4, F.4, P.4, IO.17, IO.8, IO.9	R.1 (318687), High	4	4	A1 guardrail implemented and tested locally. Keep the system risk Open pending residual-risk review.
PR-02 — Late or failed analysis not signaled	An inference failure or timeout can leave the workspace waiting if the unavailable status does not reach it.	C.3, F.3.3, P.3.3, IO.18, IO.12, F.4	R.2 (318688), Medium	3	3	Verify the unavailable notice in the integrated workstation build with a real delay.
PR-03 — Untrusted input to a model prompt	A future prompt-based component could treat case text or retrieved material as instructions and generate misleading content.	F.3.2, P.3.2, F.3.4, P.3.4	—	Not applicable to current implementation	Not applicable to current implementation	The current knowledge layer uses structured inputs and deterministic rules, and the explanation is generated from a template. Review this risk if a prompt-based path is introduced.
PR-04 — Response schema drift	An update changes a response field or its meaning, which can cause the workspace to reject or misread a result.	F.3, F.4, P.3, P.4, IO.8, IO.9	—	Pending team rating	Pending team rating	Maintain the API contract and check the producer and consumer when fields change. The contract now documents a nullable leading prediction for indeterminate results.
PR-05 — Dependency maintenance	A runtime, inference, or application dependency loses support or becomes incompatible, which can disrupt reproducibility or analysis.	P.3, P.3.1, P.3.2, Model and Rule Updates conduit	—	Pending team rating	Pending team rating	Review dependency changes and run verification before upgrading the deployment.
PR-06 — Unintended data egress	A service address, dependency, log, or storage destination could send or expose case data outside the hospital-controlled boundary.	C.0, X.C.1.2, X.C.1.3, Clinical Data Input and On-Premise Network Interface conduits, SR11	R.4 (318690), Medium	2	5	Verify egress and logging on the integrated workstation build.
PR-07 — Result associated with the wrong case	Early analysis or a shared service could attach a result to the wrong radiograph or case.	F.2, P.2, F.3, P.3, F.4, P.4, IO.5, IO.7, IO.17, IO.8, IO.19	R.3 (318689), Medium	2	5	The current on-demand workflow uses workstation-local inference. Require case and image matching checks if the deployment changes.


R.5 remains in the system assessment because it concerns the schedule and
cost consequences of a potential model replacement.
A1 Guardrail for PR-01
F.3.2 sets the IO.8 indeterminate flag when the two highest scores tie
or when the leading disease score reaches the configured cap. The Normal
score is calculated as a complement and remains subject to the tie rule.
F.3.4 produces an indeterminate explanation, and the upload API returns
topPrediction: null for this state. The result view, exported PDF and
saved review show the indeterminate status and withhold the leading
suggestion. The clinician can still review the original image and add
a review note.

The regression test
test_CR3_2_tied_scores_produce_an_indeterminate_explanation uses a stub
classifier score of 0.12 with synthetic context and the real knowledge
layer. The two highest scores are 0.95 and 0.95. The test checks that
analysis completed and that the result and explanation both communicate
the indeterminate state. The local pytest suite passed all 25 tests.
Local UI checks with synthetic responses verified the result view, PDF
export, saved-case reopening, and the display of a clear result.

The guardrail addresses presentation of tied or capped results.
Work remains on context-driven rankings and the separate SR3/SR4
evaluation. Section 5.7 defines the evidence needed before rerating R.1.

Implementation references
- [F.3.2 ranking and F.3.4 explanation modules](../backend/core/imaging_service/clinical_analysis/)
- [Upload API](../backend/core/imaging_service/views.py) and [API contract](../contracts/api-v1.yaml)
- [Result view](../frontend/app/result/page.tsx) and [saved reviews](../frontend/app/cases/page.tsx)
- [F.3 regression test](../tests/test_functional_requirements.py)
