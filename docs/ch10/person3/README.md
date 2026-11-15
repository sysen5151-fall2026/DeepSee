# Chapter 10, Person 3: alternative scenario data

Supporting files for the ALT.1 (early image analysis) section. The model itself
is action ALT.1 in the shared Innoslate project.

- `innoslate_mc_alt1_results.json`: summary statistics and the 1,000 run
  completion times from the Innoslate Monte Carlo run (saved in Innoslate as the
  artifact "ALT1_MonteCarlo_1000 - Monte Carlo Simulation"). Times are in seconds.
- `replica.py`: Python replica of the ALT.1 logic and the matching baseline flow,
  used to cross-check the Innoslate totals and to compute clinician wait and the
  CNN sensitivity. Run `python replica.py out.json` (needs numpy).

See `../person4-measurement-guide.md` for how to run the CNN version for the
measured behavior comparison.
