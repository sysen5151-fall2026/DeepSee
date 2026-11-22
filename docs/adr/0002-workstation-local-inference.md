# ADR 0002 — Workstation-local inference

**Status:** Accepted

## Decision and context

Select Alternative A for this increment. Run the P.3 Clinical Analysis Subsystem on the clinician’s workstation (A.H1). It can complete an analysis without depending on a shared inference server.

Chapter 11 compares two placements for the same P.3 subsystem. Both use the same CNN and clinical workflow and keep patient data within the hospital-controlled environment. Under Alternative B, the workstation sends each case to a shared inference host (B.H1) on the hospital network. That deployment depends on a secure network connection, matching each response to its case, and handling a timeout without displaying a stale result.

## Swing-weight results

Chapter 11, Tables 3-1 through 3-3, ranks valid case completion first, responsiveness second and three-year ownership cost third. The report calculates totals with the unrounded weights. Both costs are course-project planning estimates.

| Criterion | Swing points | Weight | A evidence and value score | B deployment evidence and value score |
| --- | ---: | ---: | --- | --- |
| C1 · P95 from accepted image to displayed result | 80 | 34.78% | 1.661 s · 98.88 | Two-host measurement pending |
| C2 · Valid, case-matched completions | 100 | 43.48% | 30/30 completed · 100.00, assuming all results matched their cases | Two-host measurement pending |
| C3 · Three-year ownership cost | 50 | 21.74% | $1,600 · 46.67 | $2,750 · 8.33 |

**A’s preliminary score is 88.02/100. B’s maximum sensitivity-bound score is 80.07/100** at its estimated cost, even granting B perfect scores of 100 on C1 and C2. B’s measured deployment total remains open. Its higher estimated cost outweighs any possible performance gain under the current weights.

## Sensitivity and reconsideration

A remained preferred in all six sensitivity tests in Section 4.1. Each test raised or lowered one weight by 10 percentage points and redistributed the remaining weight proportionally. Even with perfect performance scores for B, the smallest lead for A was 4.06 points, when the cost weight was reduced.

Reopen the decision if a revised three-year estimate brings B near **$1,654**, its break-even cost at the original weights assuming perfect C1 and C2 scores. Also revisit B if fresh case-matching tests undermine A’s assumed completion rate. At the original weights and costs, the report places the tie near **99.09%** valid completion for A under the same best-case assumption for B. For a new comparison, run the same workload across two hosts on a private LAN, measure B’s end-to-end P95 and valid case completions, and update the cost estimates.

## Implementation and prototype evidence

**Alternative A.** The merged workstation profile restricts the API origin to loopback and rejects redirects. Four deployment checks and 25 functional tests passed. The real CNN answered 30/30 local API requests with a P95 round trip of 141.73 ms. This API timing excludes browser interaction and rendering. The 1.661 s C1 value above covers image acceptance through result display. [PR #12](https://github.com/sysen5151-fall2026/DeepSee/pull/12)

**Alternative B.** Two runs exercised the browser and inference service as separate processes on one host over loopback. Each completed 30/30 case-matched trials after three warm-ups. Preview-to-display P95 was 1.219 s in run 1 and 1.226 s in run 2. These results establish repeatable integration on one host. The network hop between the workstation and a separate inference host remains unmeasured. [PR #13](https://github.com/sysen5151-fall2026/DeepSee/pull/13) · [Run evidence](../ch11/alt-b/README.md)

**Decision source:** *DeepSee — Systems Analysis and Risk Assessment*, Chapter 11, Sections 3.2–3.5 and 4.1–4.3.
