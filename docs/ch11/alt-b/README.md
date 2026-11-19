# Alternative B shared inference prototype

Both runs used one cloud Linux host. The production frontend and Django inference service ran as separate processes on distinct HTTP origins over loopback. The browser submitted four repository test images and fixed synthetic patient data to the existing CNN. Each run included three warm-ups and 30 sequential measured trials.

| Evidence | P95 from visible X-ray preview to ranked differential | Successful case-matched trials |
| --- | ---: | ---: |
| [Run 1](run-1/DeepSee_Alt_B_Results.md) | 1.219 s | 30/30 |
| [Run 2](run-2/DeepSee_Alt_B_Results.md) | 1.226 s | 30/30 |

Each run directory contains the timing CSV and JSON summary. P95 uses the 29th observation after sorting the 30 measured times. The browser checked the returned model version and predictions, displayed prediction, new case ID, and displayed image against the input fixture.

These measurements support the single-host integration evidence in Section 3.3. Two-host private-LAN measurements for Table 3-2 are pending.

- [Two-host test guide](ALT_B_TEST_GUIDE.md)
- [Browser timing script](../../../frontend/e2e/shared-browser-timing.cjs)
