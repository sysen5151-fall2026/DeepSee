# DeepSee Product Risk Register

This register tracks potential failures in the DeepSee product and links
each risk to the affected function, component, or interface in Innoslate.
The team will review the candidate risks and assign likelihood and impact ratings.

| Candidate risk | Potential effect | Innoslate reference |
| --- | --- | --- |
| The AI returns a response in the expected format with an incorrect finding. | A clinician reviewing the case may see a misleading AI-generated finding. | TBD |
| The AI model is unavailable or exceeds the request timeout. | The clinician cannot receive AI assistance for the case during review. | TBD |
| Untrusted text from a case record reaches the model prompt. | The text may alter the model's behavior and produce an unrelated or misleading response. | TBD |
| A model update changes the response schema. | The application may reject the result or display incomplete information. | TBD |
| A required software dependency is no longer maintained. | Future compatibility issues may prevent the analysis workflow from running. | TBD |
| Case data is sent to an unintended destination. | Case information may be exposed outside the intended data flow. | TBD |
| A result is linked to the wrong case. | A clinician may see a finding associated with a different patient or study. | TBD |
