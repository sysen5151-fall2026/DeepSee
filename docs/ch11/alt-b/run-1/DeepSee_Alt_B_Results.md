# DeepSee Chapter 11, Alternative B prototype evidence

**Test date** November 18, 2026 (New York time)

## Results

| Measure | Single-host result | Value score using Table 3-2 |
|---|---:|---:|
| C1 responsiveness, nearest-rank P95 | 1.219 s | 99.63 |
| C2 service completion | 30/30 (100%) | 100.00 |

The median was 1.088 s. The run used three warm-ups followed by 30 sequential measured trials, four repository X-rays, and one fixed synthetic patient context. Timing began when the accepted X-ray preview became visible and ended when the **Ranked differential** heading appeared. The browser measured the workflow after it had signed in.

A successful trial required HTTP 201 from the configured inference origin, a valid `cnn-pneumonia-v1` prediction payload, a visible prediction from that response, a new case ID, and a result image matching the input fixture. The test checked the displayed image's SHA-256 against the source file. The Django server logged 33 inference requests, including the warm-ups. The CSV contains all 30 timed trials.

## Test setup

One cloud Linux x86-64 host ran the Next.js production frontend, headless Chromium 153.0.8010.0, and the Django 5.2 / TensorFlow 2.19 inference service. The frontend and backend ran as separate processes at `http://localhost:3000` and `http://127.0.0.2:8000`. Requests used separate HTTP origins over loopback. The backend ran CPU inference using the repository model and clinical logic at commit `0debd2a6039bae0515f5712d98fc50fbdb82f236`. The timing script in this package supports a browser binary override and adds the case-matching checks described above.

For a repeat run, place `shared-browser-timing.cjs` in the repository's `frontend/e2e/` directory and use the deployment and measurement commands in `ALT_B_TEST_GUIDE.md`. Set `E2E_CHROMIUM_PATH` if the run uses a local Chromium executable and set `ALT_B_TOPOLOGY` to describe the actual test setup.

## Suggested wording for Section 3.3

> A single-host prototype verified that the DeepSee browser workflow could send case data to a separate inference service and display the matching result using the existing CNN. After three warm-up runs, 30 of 30 sequential trials completed successfully, with a P95 of 1.219 seconds from accepted-image preview to ranked differential display. This test used separate HTTP origins on one cloud host and therefore provides integration evidence. Two-host private-LAN measurements remain pending for the Alternative B deployment comparison.

Table 3-2 can retain TBD for the two-host C1 and C2 values. The single-host figures above can appear in Section 3.3 with the test setup identified. The current three-year C3 planning estimate for Alternative B is $2,750, with a value score of 8.33.
