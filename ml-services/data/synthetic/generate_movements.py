"""
generate_movements.py  —  Dataset 2: Stock Movement & Transfer Log  (~5,000 rows)
Module 2: Anomaly Detection
Target: ~10,000 rows
Columns produced
────────────────
event_id, batch_id, drug_name, region, facility_id, event_type,
quantity_before, quantity_change, quantity_after, sender_facility_id,
receiver_facility_id, timestamp, transfer_duration_hrs, off_hours_flag,
new_recipient_flag, cumulative_transfers, quantity_vs_forecast_delta,
is_anomaly, anomaly_type

Anomaly injection  (~15 % of rows)
──────────────────
  Type 1 — Unexplained stock drop >40 % with no dispensing record
  Type 2 — Same batch transferred 3+ times within 24 hours
  Type 3 — Transfer logged between 11 PM – 4 AM
  Type 4 — Receiver facility ID not in master facility list
  Type 5 — Closing stock doesn't reconcile with opening ± movements
"""

import os
import random

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from constants import (
    FACILITY_REGISTRY,
    ALL_FACILITY_IDS,
    PROCESSED_DIR,
)

TARGET_BATCHES = 400
ANOMALY_RATE   = 0.15

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _work_ts(base, span_days=0):
    """Return a random Mon–Fri 08:00–17:59 timestamp near *base*."""
    for _ in range(60):
        d = base + timedelta(
            days=random.randint(0, max(0, span_days)),
            hours=random.randint(8, 17),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59),
        )
        if d.weekday() < 5:          # Mon-Fri
            return d
    # safety fallback
    return base.replace(hour=10, minute=0, second=0)


def _evt(bid, drug, region, fid, etype,
         qb, qc, qa, sender, receiver, ts,
         dur=0.0, cum_tr=0, new_r=0, delta=0,
         anom=0, anom_type=None):
    """Build a single event dict."""
    h = ts.hour
    return {
        "batch_id":                    bid,
        "drug_name":                   drug,
        "region":                      region,
        "facility_id":                 fid,
        "event_type":                  etype,
        "quantity_before":             qb,
        "quantity_change":             qc,
        "quantity_after":              qa,
        "sender_facility_id":          sender,
        "receiver_facility_id":        receiver,
        "timestamp":                   ts.strftime("%Y-%m-%d %H:%M:%S"),
        "transfer_duration_hrs":       dur,
        "off_hours_flag":              1 if (h < 8 or h >= 18) else 0,
        "new_recipient_flag":          new_r,
        "cumulative_transfers":        cum_tr,
        "quantity_vs_forecast_delta":  delta,
        "is_anomaly":                  anom,
        "anomaly_type":                anom_type,
    }

# ---------------------------------------------------------------------------
# Main generator
# ---------------------------------------------------------------------------

def generate(expiry_df=None):
    """Generate Dataset 2 and write to *stock_movements.csv*.  Returns the DataFrame."""
    np.random.seed(44)
    random.seed(44)

    # ── load batch catalogue ─────────────────────────────────────────────
    if expiry_df is None:
        expiry_df = pd.read_csv(os.path.join(PROCESSED_DIR, "batch_expiry.csv"))

    sample = (
        expiry_df
        .sample(n=min(TARGET_BATCHES, len(expiry_df)), random_state=44)
        .reset_index(drop=True)
    )

    # pre-select ~30 batches for Type-2 anomaly (rapid transfers)
    type2_set = set(
        sample["batch_id"]
        .sample(n=min(30, len(sample)), random_state=45)
    )

    events          = []
    batch_receivers = {}          # batch_id → set(facility_ids that received)

    for _, row in sample.iterrows():
        bid      = row["batch_id"]
        drug     = row["drug_name"]
        region   = row["region"]
        ftype    = row["facility_type"]
        init_qty = int(row["initial_quantity"])
        arr_dt   = datetime.strptime(str(row["arrival_date"]), "%Y-%m-%d")
        exp_dt   = datetime.strptime(str(row["expiry_date"]),  "%Y-%m-%d")
        daily_r  = float(row["avg_daily_consumption"])

        fid  = FACILITY_REGISTRY.get((region, ftype), "FAC_001")
        life = max(1, (exp_dt - arr_dt).days)
        cur  = 0
        tr   = 0                                      # cumulative transfer counter
        batch_receivers[bid] = set()

        # ── 1. Received ──────────────────────────────────────────────────
        ts  = _work_ts(arr_dt)
        cur = init_qty
        events.append(_evt(
            bid, drug, region, fid, "received",
            0, init_qty, cur,
            "WAREHOUSE_TN_01", fid, ts,
            dur=round(random.uniform(2, 48), 1),
        ))

        # ── 2. Dispensed  ×(20-24) ──────────────────────────────────────
        n_disp = random.randint(20, 24)
        for i in range(n_disp):
            if cur <= 0:
                break
            share = max(1, cur // max(1, n_disp - i))
            amt   = min(cur, random.randint(1, max(1, share)))
            bef   = cur
            cur  -= amt
            ts    = _work_ts(arr_dt + timedelta(days=random.randint(1, life)))
            exp_amt = int(daily_r * random.uniform(0.9, 1.1))
            events.append(_evt(
                bid, drug, region, fid, "dispensed",
                bef, -amt, cur,
                fid, None, ts,
                delta=-amt + exp_amt,
            ))

        # ── 3. Transferred  ×(0-3) ─────────────────────────────────────
        n_tr = random.randint(0, 3)
        valid_targets = [f for f in ALL_FACILITY_IDS[:40] if f != fid]
        for _ in range(n_tr):
            if cur < 30:
                break
            amt   = min(cur, random.randint(30, max(31, cur // 3)))
            bef   = cur
            cur  -= amt
            tr   += 1
            tgt   = random.choice(valid_targets)
            is_new = int(tgt not in batch_receivers[bid])
            batch_receivers[bid].add(tgt)
            ts  = _work_ts(arr_dt + timedelta(days=random.randint(1, life)))
            dur = round(random.uniform(1, 24), 1)
            events.append(_evt(
                bid, drug, region, fid, "transferred",
                bef, -amt, cur,
                fid, tgt, ts,
                dur=dur, cum_tr=tr, new_r=is_new,
            ))

        # ── 3b. Type-2 rapid transfers (anomaly batches) ───────────────
        if bid in type2_set and cur > 30:
            base_ts = _work_ts(arr_dt + timedelta(days=random.randint(1, life)))
            for k in range(random.randint(3, 5)):
                amt  = min(cur, random.randint(20, max(21, cur // 4)))
                bef  = cur
                cur -= amt
                tr  += 1
                tgt  = random.choice(ALL_FACILITY_IDS[:40])
                ts_k = base_ts + timedelta(
                    hours=random.randint(1, 6) * (k + 1),
                    minutes=random.randint(0, 59),
                )
                events.append(_evt(
                    bid, drug, region, fid, "transferred",
                    bef, -amt, cur,
                    fid, tgt, ts_k,
                    dur=round(random.uniform(0.5, 3), 1),
                    cum_tr=tr, new_r=1,
                    anom=1, anom_type="Type 2",
                ))
                if cur < 20:
                    break

        # ── 4. Adjusted  (30 % chance) ──────────────────────────────────
        if random.random() < 0.30 and cur > 0:
            adj = random.randint(-min(50, cur), 50)
            bef = cur
            cur = max(0, cur + adj)
            ts  = _work_ts(arr_dt + timedelta(days=random.randint(1, life)))
            events.append(_evt(
                bid, drug, region, fid, "adjusted",
                bef, adj, cur,
                fid, fid, ts,
                delta=adj,
            ))

        # ── 5. Disposed  (25 % if stock remains) ───────────────────────
        if cur > 0 and random.random() < 0.25:
            bef = cur
            dispose_dt = exp_dt - timedelta(days=random.randint(1, min(10, life)))
            ts  = _work_ts(max(arr_dt, dispose_dt))
            events.append(_evt(
                bid, drug, region, fid, "disposed",
                bef, -bef, 0,
                fid, None, ts,
                delta=-bef,
            ))
            cur = 0

    # ── build DataFrame & sort ───────────────────────────────────────────
    df = pd.DataFrame(events)
    df.sort_values("timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # ── inject remaining anomaly types (1, 3, 4, 5) ─────────────────────
    _inject_post(df)

    # ── assign sequential event IDs ──────────────────────────────────────
    df.insert(0, "event_id", [f"EVT_{i+1:06d}" for i in range(len(df))])

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out = os.path.join(PROCESSED_DIR, "stock_movements.csv")
    df.to_csv(out, index=False)
    print(f"    stock_movements.csv    : {len(df):>6,} rows")
    return df

# ---------------------------------------------------------------------------
# Post-hoc anomaly injection  (Types 1, 3, 4, 5)
# ---------------------------------------------------------------------------

def _inject_post(df):
    """Mutate existing rows to add Type 1/3/4/5 anomalies.

    Combined with the Type 2 events added during generation, the total
    anomalous fraction targets ~15 %.
    """
    n = len(df)
    already = int(df["is_anomaly"].sum())
    remaining = int(n * ANOMALY_RATE) - already
    if remaining <= 0:
        return
    per_type = remaining // 4
    used = set(df.index[df["is_anomaly"] == 1].tolist())

    # ── Type 1: unexplained stock drop > 40 % ───────────────────────────
    cands = df.index[
        (df["event_type"] == "dispensed") &
        (df["quantity_before"] >= 50) &
        (~df.index.isin(used))
    ].tolist()
    random.shuffle(cands)
    for idx in cands[:per_type]:
        bef  = df.at[idx, "quantity_before"]
        drop = int(bef * random.uniform(0.40, 0.70))
        df.at[idx, "event_type"]     = "adjusted"
        df.at[idx, "quantity_change"] = -drop
        df.at[idx, "quantity_after"]  = bef - drop
        df.at[idx, "is_anomaly"]     = 1
        df.at[idx, "anomaly_type"]   = "Type 1"
        used.add(idx)

    # ── Type 3: transfer between 23:00 – 03:59 ──────────────────────────
    cands = df.index[
        (df["event_type"] == "transferred") &
        (~df.index.isin(used))
    ].tolist()
    random.shuffle(cands)
    for idx in cands[:per_type]:
        ts    = datetime.strptime(df.at[idx, "timestamp"], "%Y-%m-%d %H:%M:%S")
        new_h = random.choice([23, 0, 1, 2, 3])
        ts    = ts.replace(hour=new_h, minute=random.randint(0, 59))
        df.at[idx, "timestamp"]      = ts.strftime("%Y-%m-%d %H:%M:%S")
        df.at[idx, "off_hours_flag"] = 1
        df.at[idx, "is_anomaly"]     = 1
        df.at[idx, "anomaly_type"]   = "Type 3"
        used.add(idx)

    # ── Type 4: receiver not in master facility list ─────────────────────
    cands = df.index[
        df["event_type"].isin(["transferred", "received"]) &
        (~df.index.isin(used))
    ].tolist()
    random.shuffle(cands)
    for idx in cands[:per_type]:
        fake_id = f"FAC_UNKNOWN_{random.randint(900, 999)}"
        df.at[idx, "receiver_facility_id"] = fake_id
        df.at[idx, "new_recipient_flag"]   = 1
        df.at[idx, "is_anomaly"]           = 1
        df.at[idx, "anomaly_type"]         = "Type 4"
        used.add(idx)

    # ── Type 5: quantity_after ≠ quantity_before + quantity_change ────────
    cands = df.index[~df.index.isin(used)].tolist()
    random.shuffle(cands)
    for idx in cands[:per_type]:
        err     = random.choice([-1, 1]) * random.randint(10, 200)
        correct = int(df.at[idx, "quantity_before"]) + int(df.at[idx, "quantity_change"])
        df.at[idx, "quantity_after"] = correct + err
        df.at[idx, "is_anomaly"]     = 1
        df.at[idx, "anomaly_type"]   = "Type 5"
        used.add(idx)


if __name__ == "__main__":
    generate()
