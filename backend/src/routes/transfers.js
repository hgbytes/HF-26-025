const express = require("express");
const router = express.Router();
const { getContracts, getContractWithSigner } = require("../blockchain/contracts");
const { walletAuth } = require("../middleware/auth");

function formatTransfer(t) {
  return {
    transferId: t.transferId,
    batchId: t.batchId,
    from: t.from,
    to: t.to,
    quantity: Number(t.quantity),
    fromRegion: t.fromRegion,
    toRegion: t.toRegion,
    initiatedAt: Number(t.initiatedAt),
    completedAt: Number(t.completedAt),
    status: Number(t.status),
    rejectionReason: t.rejectionReason,
  };
}

// GET /api/transfers/history/:batchId — transfer history for a batch
router.get("/history/:batchId", async (req, res, next) => {
  try {
    const { medTransfer } = getContracts();
    const history = await medTransfer.getTransferHistory(req.params.batchId);
    res.json({ batchId: req.params.batchId, count: history.length, transfers: history.map(formatTransfer) });
  } catch (err) {
    next(err);
  }
});

// GET /api/transfers/pending/:wallet — pending transfers for wallet
router.get("/pending/:wallet", async (req, res, next) => {
  try {
    const { medTransfer } = getContracts();
    const pending = await medTransfer.getPendingTransfers(req.params.wallet);
    res.json({ wallet: req.params.wallet, count: pending.length, transfers: pending.map(formatTransfer) });
  } catch (err) {
    next(err);
  }
});

// GET /api/transfers/owner/:batchId — current owner of batch
router.get("/owner/:batchId", async (req, res, next) => {
  try {
    const { medTransfer } = getContracts();
    const owner = await medTransfer.getCurrentOwner(req.params.batchId);
    res.json({ batchId: req.params.batchId, currentOwner: owner });
  } catch (err) {
    next(err);
  }
});

// GET /api/transfers/:transferId — get single transfer details
router.get("/:transferId", async (req, res, next) => {
  try {
    const { medTransfer } = getContracts();
    const t = await medTransfer.getTransfer(req.params.transferId);
    res.json(formatTransfer(t));
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers — initiate a transfer
// Body: { batchId, to, quantity, toRegion }
router.post("/", walletAuth, async (req, res, next) => {
  try {
    const { batchId, to, quantity, toRegion } = req.body;
    if (!batchId || !to || !quantity || !toRegion) {
      return res.status(400).json({ error: "batchId, to, quantity, toRegion required" });
    }

    const transfer = await getContractWithSigner("medTransfer", req.wallet);
    const tx = await transfer.initiateTransfer(batchId, to, quantity, toRegion);
    const receipt = await tx.wait();

    // Parse event for transferId
    const { medTransfer } = getContracts();
    let transferId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = medTransfer.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === "TransferInitiated") {
          transferId = parsed.args.transferId;
          break;
        }
      } catch (_) {}
    }

    res.status(201).json({ txHash: receipt.hash, transferId });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers/:transferId/accept — accept a transfer
router.post("/:transferId/accept", walletAuth, async (req, res, next) => {
  try {
    const transfer = await getContractWithSigner("medTransfer", req.wallet);
    const tx = await transfer.acceptTransfer(req.params.transferId);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, transferId: req.params.transferId, status: "accepted" });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers/:transferId/reject — reject a transfer
// Body: { reason }
router.post("/:transferId/reject", walletAuth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transfer = await getContractWithSigner("medTransfer", req.wallet);
    const tx = await transfer.rejectTransfer(req.params.transferId, reason || "");
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, transferId: req.params.transferId, status: "rejected" });
  } catch (err) {
    next(err);
  }
});

// POST /api/transfers/:transferId/cancel — cancel a transfer
router.post("/:transferId/cancel", walletAuth, async (req, res, next) => {
  try {
    const transfer = await getContractWithSigner("medTransfer", req.wallet);
    const tx = await transfer.cancelTransfer(req.params.transferId);
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, transferId: req.params.transferId, status: "cancelled" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
