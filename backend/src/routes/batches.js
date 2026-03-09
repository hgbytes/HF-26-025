const express = require("express");
const router = express.Router();
const { getContracts, getContractWithSigner } = require("../blockchain/contracts");
const { walletAuth } = require("../middleware/auth");

// GET /api/batches/alerts/:wallet — get alerts for a manufacturer/distributor
router.get("/alerts/:wallet", async (req, res, next) => {
  try {
    const { getDb } = require("../db/database");
    const db = getDb();
    const wallet = req.params.wallet;
    const rows = db.prepare(
      "SELECT * FROM alerts WHERE target_wallet = ? ORDER BY created_at DESC LIMIT 50"
    ).all(wallet);

    const unreadCount = db.prepare(
      "SELECT COUNT(*) as c FROM alerts WHERE target_wallet = ? AND read = 0"
    ).get(wallet).c;

    res.json({
      alerts: rows.map((r) => ({
        id: String(r.id),
        type: r.type,
        severity: r.severity,
        title: r.title,
        description: r.description,
        batchId: r.batch_id,
        drug: r.drug,
        region: r.region,
        read: Boolean(r.read),
        createdAt: r.created_at,
      })),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batches/:batchId — get batch details
router.get("/:batchId", async (req, res, next) => {
  try {
    const { medBatch } = getContracts();
    const batch = await medBatch.getBatch(req.params.batchId);

    res.json({
      batchId: batch.batchId,
      drugName: batch.drugName,
      region: batch.region,
      quantity: Number(batch.quantity),
      manufactureDate: Number(batch.manufactureDate),
      expiryDate: Number(batch.expiryDate),
      qrCodeHash: batch.qrCodeHash,
      registeredBy: batch.registeredBy,
      currentOwner: batch.currentOwner,
      status: Number(batch.status),
      isActive: batch.isActive,
      registeredAt: Number(batch.registeredAt),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batches/:batchId/verify — verify batch authenticity
router.get("/:batchId/verify", async (req, res, next) => {
  try {
    const { medBatch } = getContracts();
    const [isValid, drugName, region, expiryDate, currentOwner, ownerName, status] =
      await medBatch.verifyBatch(req.params.batchId);

    res.json({
      isValid,
      drugName,
      region,
      expiryDate: Number(expiryDate),
      currentOwner,
      ownerName,
      status: Number(status),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batches/by/owner/:wallet — batches owned by wallet
router.get("/by/owner/:wallet", async (req, res, next) => {
  try {
    const { medBatch } = getContracts();
    const batchIds = await medBatch.getBatchesByOwner(req.params.wallet);

    const batches = await Promise.all(
      batchIds.map(async (id) => {
        const b = await medBatch.getBatch(id);
        return {
          batchId: b.batchId,
          drugName: b.drugName,
          region: b.region,
          quantity: Number(b.quantity),
          expiryDate: Number(b.expiryDate),
          status: Number(b.status),
          isActive: b.isActive,
        };
      })
    );

    res.json({ wallet: req.params.wallet, count: batches.length, batches });
  } catch (err) {
    next(err);
  }
});

// GET /api/batches/by/manufacturer/:wallet — batches registered by manufacturer
router.get("/by/manufacturer/:wallet", async (req, res, next) => {
  try {
    const { medBatch } = getContracts();
    const batchIds = await medBatch.getBatchesByManufacturer(req.params.wallet);

    const batches = await Promise.all(
      batchIds.map(async (id) => {
        const b = await medBatch.getBatch(id);
        return {
          batchId: b.batchId,
          drugName: b.drugName,
          region: b.region,
          quantity: Number(b.quantity),
          expiryDate: Number(b.expiryDate),
          currentOwner: b.currentOwner,
          status: Number(b.status),
          isActive: b.isActive,
          registeredAt: Number(b.registeredAt),
        };
      })
    );

    res.json({ manufacturer: req.params.wallet, count: batches.length, batches });
  } catch (err) {
    next(err);
  }
});

// POST /api/batches — register a new batch (manufacturer only)
// Body: { drugName, region, quantity, manufactureDate, expiryDate, qrCodeHash }
router.post("/", walletAuth, async (req, res, next) => {
  try {
    const { drugName, region, quantity, manufactureDate, expiryDate, qrCodeHash } = req.body;

    if (!drugName || !region || !quantity || !manufactureDate || !expiryDate || !qrCodeHash) {
      return res.status(400).json({ error: "All fields required: drugName, region, quantity, manufactureDate, expiryDate, qrCodeHash" });
    }

    const batch = await getContractWithSigner("medBatch", req.wallet);
    const tx = await batch.registerBatch(drugName, region, quantity, manufactureDate, expiryDate, qrCodeHash);
    const receipt = await tx.wait();

    // Parse BatchRegistered event
    const { medBatch } = getContracts();
    let batchId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = medBatch.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === "BatchRegistered") {
          batchId = parsed.args.batchId;
          break;
        }
      } catch (_) {}
    }

    res.status(201).json({ txHash: receipt.hash, batchId });
  } catch (err) {
    next(err);
  }
});

// POST /api/batches/:batchId/report-expired — patient reports expired batch
router.post("/:batchId/report-expired", async (req, res, next) => {
  try {
    const { medBatch } = getContracts();
    const batch = await medBatch.getBatch(req.params.batchId);
    const drugName = batch.drugName;
    const region = batch.region;
    const manufacturer = batch.registeredBy;
    const owner = batch.currentOwner;
    const expiryDate = Number(batch.expiryDate);
    const fmtExpiry = new Date(expiryDate * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const batchId = req.params.batchId;

    const { getDb } = require("../db/database");
    const db = getDb();

    // Avoid duplicate alerts for same batch
    const existing = db.prepare("SELECT id FROM alerts WHERE batch_id = ? AND type = 'expired_batch' LIMIT 1").get(batchId);
    if (existing) {
      return res.json({ alerted: false, reason: 'Already reported' });
    }

    const title = `Expired Batch Detected: ${drugName}`;
    const desc = `A patient scanned batch ${batchId.slice(0, 10)}... and found it expired (${fmtExpiry}). Drug: ${drugName}, Region: ${region}.`;

    // Alert manufacturer
    db.prepare(
      "INSERT INTO alerts (target_wallet, target_role, type, severity, title, description, batch_id, drug, region, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(manufacturer, 'manufacturer', 'expired_batch', 'high', title, desc, batchId, drugName, region, req.body.reporterWallet || 'patient');

    // Alert all distributors from deployed.json
    try {
      const fs = require("fs");
      const path = require("path");
      const deployed = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "contracts", "deployed.json"), "utf8"));
      const distributors = Object.entries(deployed.wallets)
        .filter(([key]) => key.startsWith("distributor"))
        .map(([, addr]) => addr);
      for (const addr of distributors) {
        db.prepare(
          "INSERT INTO alerts (target_wallet, target_role, type, severity, title, description, batch_id, drug, region, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(addr, 'distributor', 'expired_batch', 'high', title, desc, batchId, drugName, region, req.body.reporterWallet || 'patient');
      }
    } catch { /* deployed.json not available */ }

    res.json({ alerted: true, manufacturer, owner, batchId });
  } catch (err) {
    next(err);
  }
});

// POST /api/batches/:batchId/deactivate — deactivate a batch (admin only)
// Body: { reason }
router.post("/:batchId/deactivate", walletAuth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const batch = await getContractWithSigner("medBatch", req.wallet);
    const tx = await batch.deactivateBatch(req.params.batchId, reason || "Deactivated by admin");
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, batchId: req.params.batchId, deactivated: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
