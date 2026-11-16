# DeepSee Product Risk Register

This register covers product risks in the DeepSee chest X-ray review
workflow, from case input through clinical analysis and presentation of
results. The Innoslate references identify the functions, interfaces,
and components affected by each risk. The register draws on the F.0
and F.3 Action Diagrams and the P.3 Clinical Analysis Subsystem
Hierarchy Diagram.

| ID | Category | Risk scenario | Potential consequence | Innoslate reference | Likelihood | Impact |
| --- | --- | --- | --- | --- | --- | --- |
| PR-01 | AI output correctness | The analysis returns a well-formed response with an incorrect image finding, differential ranking, or explanation. | The clinician may see a misleading result during case review. | F.3.1 Analyze Chest X-ray Image, F.3.2 Refine and Rank Differential, F.3.4 Generate Clinical Explanation, and F.4 presentation. Affected components include P.3.1 Chest X-ray CNN, P.3.2 Knowledge Layer, and P.3.4 Explanation Generator. | Pending team rating | Pending team rating |
| PR-02 | Availability and latency | The inference or analysis process fails or takes longer than the request timeout. | The clinician may receive no AI result during review. If the failure status does not reach the interface, the clinician may be left waiting for a result. | F.3.3 Evaluate Analysis Availability, its Unavailable branch, and the Analysis Unavailability Notification output in F.0. Affected components include P.3.1 Chest X-ray CNN and P.3.3 Analysis Status Monitor. | Pending team rating | Pending team rating |
| PR-03 | Untrusted input to a prompt | If a prompt-based model consumes case text or retrieved content, embedded instructions could alter the analysis or explanation. | The system could produce an unrelated or misleading ranking or explanation. | F.3.2 Refine and Rank Differential and F.3.4 Generate Clinical Explanation. Review P.3.2 Knowledge Layer and P.3.4 Explanation Generator to confirm whether either component passes untrusted text into a prompt. | Pending applicability check | Pending team rating if applicable |
| PR-04 | Response schema drift | A model or service update changes a required response field, its type, or its meaning. | The presentation layer may reject the result or display incomplete or misinterpreted information. | F.3 to F.4 Clinical Analysis Result exchange. Review the output interfaces of P.3.1 Chest X-ray CNN and P.3.2 Knowledge Layer. | Pending team rating | Pending team rating |
| PR-05 | Dependency maintenance | A required runtime, inference, or knowledge-layer dependency stops receiving maintenance and becomes incompatible with a later upgrade. | The team may be unable to reproduce the build or run the analysis workflow after an environment change. | P.3 Clinical Analysis Subsystem, especially P.3.1 Chest X-ray CNN and P.3.2 Knowledge Layer. Confirm the affected dependencies against the repository. | Pending team rating | Pending team rating |
| PR-06 | Unintended data egress | Case information is sent to an unintended service or written to a log or storage destination outside the intended data flow. | Case information may be exposed to an unauthorized recipient or destination. | F.1 Collect Case Information, F.2 Review and Confirm Inputs, and the Confirmed Inputs exchange into F.3 Perform Clinical Analysis. Review the runtime destinations used by P.3. | Pending team rating | Pending team rating |
| PR-07 | Case and result integrity | An image, confirmed input, or analysis result is associated with the wrong case during processing or presentation. | A clinician may review another case's result under the current case. | F.1 Collect Case Information, F.2 Review and Confirm Inputs, and the F.3 to F.4 Clinical Analysis Result exchange. | Pending team rating | Pending team rating |

## Risk Review and Verification

The team will assign likelihood and impact ratings using its agreed
scales and cross-reference overlapping entries to the Chapter 12 system
risk table. PR-03 remains conditional until the team verifies whether
the current product passes untrusted text into a model prompt.

After the team selects the highest-priority risk, record its risk ID,
the guardrail or fallback implemented, why it was selected, and the
failure-path test used to verify it. Include the test result and a
reference to the implementation commit or pull request.
