# ADR 0002: Workstation-local inference

**Scope:** Chapter 11, Person 3  
**Decision:** Alternative A, workstation-local inference  
**Implementation:** Merged into `main` in [PR #12](https://github.com/sysen5151-fall2026/DeepSee/pull/12), commit [`0debd2a`](https://github.com/sysen5151-fall2026/DeepSee/commit/0debd2a6039bae0515f5712d98fc50fbdb82f236).  
**Document status:** Working draft for team review, prepared with AI assistance. Qianyu Wang confirmed the selection of Alternative A.

## Decision and rationale

DeepSee will run inference on the clinician's workstation for this increment. In the Innoslate model, A.H1 is the local inference host and P.3 is the clinical analysis subsystem. The alternative was to run the same analysis logic on B.H1, a shared inference host on the hospital network.

The trade study weighted response time at 34.78%, valid completion at 43.48%, and three-year ownership cost at 21.74%. The Chapter 10 local prototype recorded 1.661 seconds at the 95th percentile from image acceptance to result display and 30 successful runs out of 30. The reliability score assumes those successes met the valid, case-matched completion definition; 30 runs alone do not establish a production reliability rate. The three-year costs of $1,600 for A and $2,750 for B are planning estimates.

With those inputs, A has a preliminary weighted score of 88.02 out of 100. At its estimated cost, even if B earned full credit on both performance criteria, it could score at most 80.07. B has no comparable measured response time or completion rate, so 80.07 is a conditional upper bound. A avoids depending on a shared network service for this workflow, but the local service and model must be deployed and maintained on each workstation that runs inference.

## Sensitivity analysis

Each test changed one weight by 10 percentage points and rescaled the other two weights proportionally. The table compares A with the optimistic B bound using the same cost and performance assumptions. A stays ahead in all six cases.

| Weight changed | A's lead with weight decreased | A's lead with weight increased |
|---|---:|---:|
| Response time | 9.33 points | 6.55 points |
| Valid completion | 9.35 points | 6.54 points |
| Three-year ownership cost | 4.06 points | 11.83 points |

At the original weights, B would tie at about $1,654 in three-year cost if both of its performance scores were perfect. If B missed either performance target, its break-even cost would be lower. A revised cost estimate in that range, or new evidence that A's valid completion rate is lower than assumed, would justify reopening the trade. The scores should then be recalculated with the revised inputs.

## What Alternative B would require

B would need a shared inference host inside the hospital network, an authenticated workstation-to-host connection, and a way to match every response to the correct case. The workflow would also need to handle timeouts and unavailable responses without showing a stale result. A comparison would use the same workload for A and B and measure the time from image acceptance to result display, the percentage of valid case-matched completions, and the full three-year cost of each deployment.

## Implementation and verification

The workstation profile restricts the configured API origin to loopback and rejects HTTP redirects. The existing browser-only demo remains available separately. The [deployment/build workflow](https://github.com/sysen5151-fall2026/DeepSee/actions/runs/44443616856) and the [functional test workflow](https://github.com/sysen5151-fall2026/DeepSee/actions/runs/44443616841) passed for the PR. Local verification covered four deployment checks, 25 functional checks, and 30 successful requests to the real model over the loopback API. The API round-trip P95 was 141.73 ms; this is separate from the Chapter 10 display-time measurement and does not cover the connected browser workflow.

The connected browser test was not completed. The PR was merged without independent code review; there is no independent review entry to cite in the prompt log.

**Evidence:** [Shared report, Sections 3 and 4](https://docs.google.com/document/d/1CIJ1gGJ94sYzSXsLtzSbpj1XXtBVzKCtNr7AoABTtfc/edit), especially Tables 3-1 through 3-3 and Sections 4.1–4.3.
