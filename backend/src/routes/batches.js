const express = require("express");
const router = express.Router();
const { getContracts, getContractWithSigner } = require("../blockchain/contracts");
const { walletAuth } = require("../middleware/auth");

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
