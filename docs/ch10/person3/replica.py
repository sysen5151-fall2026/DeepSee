"""Replica of the Innoslate ALT.1 model (and a matching baseline) used to
cross-check the Innoslate Monte Carlo totals and to compute stage-level
metrics that Innoslate's Monte Carlo panel does not report (clinician wait)."""
import numpy as np, json, sys

rng = np.random.default_rng(5151)
def tri(a, c, b, n):  # min, mode, max
    return rng.triangular(a, c, b, n)
def uni(a, b, n):
    return rng.uniform(a, b, n)

def draw(n, cnn=(5, 12, 30), review=(30, 90, 240)):
    d = {}
    d['select'] = tri(5, 10, 30, n)
    d['supply'] = tri(2, 5, 20, n)
    d['load'] = tri(1, 2, 5, n)
    d['validate'] = uni(0.2, 1.0, n)
    d['display'] = uni(0.5, 1.5, n)
    d['cnn'] = tri(cnn[0], cnn[1], cnn[2], n)
    d['review_inputs'] = tri(20, 45, 120, n)
    d['dec_inputs'] = uni(0.5, 2, n)
    d['correct'] = tri(15, 30, 90, n)
    d['is_correct'] = rng.random(n) < 0.9
    d['confirm'] = uni(1, 3, n)
    d['submit'] = uni(1, 3, n)
    d['check'] = uni(0.05, 0.2, n)
    d['dec_changed'] = uni(0.01, 0.05, n)
    d['changed'] = rng.random(n) >= 0.97
    d['recnn'] = tri(cnn[0], cnn[1], cnn[2], n)
    d['refine'] = uni(0.1, 0.5, n)
    d['explain'] = tri(2, 4, 10, n)
    d['present'] = uni(0.5, 1.5, n)
    d['review_results'] = tri(review[0], review[1], review[2], n)
    d['record'] = tri(10, 20, 60, n)
    d['store'] = uni(0.2, 1.0, n)
    d['ack'] = uni(1, 3, n)
    d['dec_avail'] = uni(0.01, 0.05, n)
    return d

def alt(d):
    e1 = d['select']
    e2 = e1 + d['supply']
    e3 = e2 + d['load']; e4 = e3 + d['validate']; e5 = e4 + d['display']
    e6 = e4 + d['cnn']
    s7 = np.maximum(e1, e5); e7 = s7 + d['review_inputs']; e8 = e7 + d['dec_inputs']
    e9 = np.where(d['is_correct'], e8, e8 + d['correct'])
    e10 = e9 + d['confirm']
    s11 = np.maximum(e6, e10); e11 = s11 + d['check']; e12 = e11 + d['dec_changed']
    e13 = np.where(d['changed'], e12 + d['recnn'], e12)
    e14 = e13 + d['refine']; e15 = e14 + d['explain']
    s16 = np.maximum(e5, e15); e16 = s16 + d['present']
    s17 = np.maximum(e10, e16); e17 = s17 + d['review_results']; e18 = e17 + d['record']
    s19 = np.maximum(e16, e18); e19 = s19 + d['store']
    s20 = np.maximum(e18, e19); e20 = s20 + d['ack']
    total = np.maximum.reduce([e2, e15, e19, e20])
    wait = s17 - e10                      # clinician idle between confirming and seeing results
    cnn_idle_after = np.maximum(0, e10 - e6)  # how long the early result sat ready
    hidden = (e6 <= e10)                  # CNN finished before clinician confirmed
    return dict(total=total, wait=wait, ready_before_confirm=hidden, results_at=s17, confirm_at=e10)

def base(d):
    e1 = d['select']; e2 = e1 + d['supply']
    e3 = e2 + d['load']; e4 = e3 + d['display']
    s5 = np.maximum(e1, e4); e5 = s5 + d['review_inputs']; e6 = e5 + d['dec_inputs']
    e7 = np.where(d['is_correct'], e6, e6 + d['correct'])
    e8 = e7 + d['submit']                    # UC.1.8 Submit Case for Analysis
    s9 = np.maximum(e4, e8); e9 = s9 + d['cnn'] + d['refine']   # UC.1.9 = F.3.1 + F.3.2
    e10 = e9 + d['dec_avail']; e11 = e10 + d['explain']; e12 = e11 + d['present']
    s15 = np.maximum(e8, e12); e15 = s15 + d['review_results']; e17 = e15 + d['record']
    s18 = np.maximum(e12, e17); e18 = s18 + d['store']
    s19 = np.maximum(e17, e18); e19 = s19 + d['ack']
    total = np.maximum.reduce([e2, e18, e19])
    wait = s15 - e8
    return dict(total=total, wait=wait, results_at=s15, confirm_at=e8)

def stats(x):
    x = np.asarray(x)
    return dict(n=len(x), min=float(x.min()), max=float(x.max()), mean=float(x.mean()),
                sd=float(x.std(ddof=1)), p50=float(np.percentile(x, 50)), p95=float(np.percentile(x, 95)))

if __name__ == '__main__':
    N = 100000
    out = {}
    d = draw(N)
    a = alt(d); b = base(d)   # common random numbers: same draws for both scenarios
    out['alt'] = {k: stats(a[k]) for k in ('total', 'wait')}
    out['alt']['ready_before_confirm_pct'] = float(a['ready_before_confirm'].mean() * 100)
    out['base'] = {k: stats(b[k]) for k in ('total', 'wait')}
    out['diff_total'] = stats(b['total'] - a['total'])
    out['diff_wait'] = stats(b['wait'] - a['wait'])
    sens = []
    for label, cnn in [('Prototype CNN, TRI(0.2, 0.5, 1.5) s', (0.2, 0.5, 1.5)),
                       ('Baseline assumption, TRI(5, 12, 30) s', (5, 12, 30)),
                       ('Slow CPU, TRI(15, 30, 60) s', (15, 30, 60)),
                       ('Very slow, TRI(30, 60, 120) s', (30, 60, 120))]:
        dd = draw(N, cnn=cnn); aa = alt(dd); bb = base(dd)
        sens.append(dict(label=label, base_wait=float(bb['wait'].mean()), alt_wait=float(aa['wait'].mean()),
                         saved=float((bb['wait'] - aa['wait']).mean()),
                         base_total=float(bb['total'].mean()), alt_total=float(aa['total'].mean()),
                         hidden_pct=float(aa['ready_before_confirm'].mean() * 100),
                         base_sr2_violation_pct=float(((bb['results_at'] - bb['confirm_at']) > 60).mean() * 100),
                         alt_sr2_violation_pct=float(((aa['results_at'] - aa['confirm_at']) > 60).mean() * 100)))
    out['sensitivity'] = sens
    # 1000 run replica with the same settings as Innoslate for a like for like check
    rng2 = np.random.default_rng(1)
    globals()['rng'] = rng2
    d1k = draw(1000); out['replica_1000_alt_total'] = stats(alt(d1k)['total'])
    json.dump(out, open(sys.argv[1], 'w'), indent=1)
    print(json.dumps({k: out[k] for k in ('alt', 'base', 'diff_wait', 'diff_total', 'replica_1000_alt_total')}, indent=1))
    for s in sens: print(s)
