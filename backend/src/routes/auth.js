const express = require("express");
const router = express.Router();
const { getContracts, getContractWithSigner } = require("../blockchain/contracts");
const { walletAuth } = require("../middleware/auth");

// GET /api/auth/role/:wallet — check all roles for a wallet
router.get("/role/:wallet", async (req, res, next) => {
  try {
    const { accessControl } = getContracts();
    const wallet = req.params.wallet;

    const [isManufacturer, isDistributor, isPatient, name] = await Promise.all([
      accessControl.isManufacturer(wallet),
      accessControl.isDistributor(wallet),
      accessControl.isPatient(wallet),
      accessControl.getWalletName(wallet),
    ]);

    const roles = [];
    if (isManufacturer) roles.push("manufacturer");
    if (isDistributor) roles.push("distributor");
    if (isPatient) roles.push("patient");

    res.json({ wallet, name, roles, isManufacturer, isDistributor, isPatient });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/grant/manufacturer — grant manufacturer role
// Body: { wallet, name }
router.post("/grant/manufacturer", walletAuth, async (req, res, next) => {
  try {
    const { wallet: targetWallet, name } = req.body;
    if (!targetWallet || !name) {
      return res.status(400).json({ error: "wallet and name required" });
    }

    const ac = await getContractWithSigner("accessControl", req.wallet);
    const tx = await ac.grantManufacturerRole(targetWallet, name);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.hash, wallet: targetWallet, role: "manufacturer", name });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/grant/distributor — grant distributor role
// Body: { wallet, name }
router.post("/grant/distributor", walletAuth, async (req, res, next) => {
  try {
    const { wallet: targetWallet, name } = req.body;
    if (!targetWallet || !name) {
      return res.status(400).json({ error: "wallet and name required" });
    }

    const ac = await getContractWithSigner("accessControl", req.wallet);
    const tx = await ac.grantDistributorRole(targetWallet, name);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.hash, wallet: targetWallet, role: "distributor", name });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/grant/patient — grant patient role
// Body: { wallet }
router.post("/grant/patient", walletAuth, async (req, res, next) => {
  try {
    const { wallet: targetWallet } = req.body;
    if (!targetWallet) {
      return res.status(400).json({ error: "wallet required" });
    }

    const ac = await getContractWithSigner("accessControl", req.wallet);
    const tx = await ac.grantPatientRole(targetWallet);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.hash, wallet: targetWallet, role: "patient" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/pause — pause the system (admin only)
router.post("/pause", walletAuth, async (req, res, next) => {
  try {
    const ac = await getContractWithSigner("accessControl", req.wallet);
    const tx = await ac.pause();
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, paused: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/unpause — unpause the system (admin only)
router.post("/unpause", walletAuth, async (req, res, next) => {
  try {
    const ac = await getContractWithSigner("accessControl", req.wallet);
    const tx = await ac.unpause();
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, paused: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
