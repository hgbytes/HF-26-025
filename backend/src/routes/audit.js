const express = require("express");
const router = express.Router();
const { getContracts, getContractWithSigner } = require("../blockchain/contracts");
const { walletAuth } = require("../middleware/auth");

function formatEntry(e) {
  return {
    entryId: e.entryId,
    batchId: e.batchId,
    action: e.action,
    performedBy: e.performedBy,
    timestamp: Number(e.timestamp),
    metadata: e.metadata,
  };
}

// GET /api/audit/trail/:batchId — full audit trail for a batch
router.get("/trail/:batchId", async (req, res, next) => {
  try {
    const { medAudit } = getContracts();
    const trail = await medAudit.getAuditTrail(req.params.batchId);
    res.json({ batchId: req.params.batchId, count: trail.length, entries: trail.map(formatEntry) });
  } catch (err) {
    next(err);
  }
});

// GET /api/audit/wallet/:wallet — audit entries for a wallet
router.get("/wallet/:wallet", async (req, res, next) => {
  try {
    const { medAudit } = getContracts();
    const entries = await medAudit.getAuditByWallet(req.params.wallet);
    res.json({ wallet: req.params.wallet, count: entries.length, entries: entries.map(formatEntry) });
  } catch (err) {
    next(err);
  }
});

// GET /api/audit/expiring?days=30 — batches expiring within N days
router.get("/expiring", async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const { medAudit } = getContracts();
    const batchIds = await medAudit.getExpiringBatches(days);
    res.json({ withinDays: days, count: batchIds.length, batchIds });
  } catch (err) {
    next(err);
  }
});

// GET /api/audit/latest/:batchId — latest audit entry for a batch
router.get("/latest/:batchId", async (req, res, next) => {
  try {
    const { medAudit } = getContracts();
    const entry = await medAudit.getLatestAction(req.params.batchId);
    res.json(formatEntry(entry));
  } catch (err) {
    next(err);
  }
});

// GET /api/audit/count/:batchId — number of audit entries for a batch
router.get("/count/:batchId", async (req, res, next) => {
  try {
    const { medAudit } = getContracts();
    const count = await medAudit.getEntryCount(req.params.batchId);
    res.json({ batchId: req.params.batchId, count: Number(count) });
  } catch (err) {
    next(err);
  }
});

// POST /api/audit/check-expired/:batchId — mark batch as expired if past expiry
router.post("/check-expired/:batchId", walletAuth, async (req, res, next) => {
  try {
    const audit = await getContractWithSigner("medAudit", req.wallet);
    const tx = await audit.checkAndMarkExpired(req.params.batchId);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, batchId: req.params.batchId, expired: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/audit/flag — flag an anomaly on a batch
// Body: { batchId, anomalyType, notes }
router.post("/flag", walletAuth, async (req, res, next) => {
  try {
    const { batchId, anomalyType, notes } = req.body;
    if (!batchId || !anomalyType) {
      return res.status(400).json({ error: "batchId and anomalyType required" });
    }

    const audit = await getContractWithSigner("medAudit", req.wallet);
    const tx = await audit.flagAnomaly(batchId, anomalyType, notes || "");
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, batchId, anomalyType });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
