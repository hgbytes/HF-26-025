const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll } = require("./helpers");

describe("Integration", function () {
  let accessControl, medBatch, medTransfer, medAudit;
  let admin, manufacturer, distributor1, distributor2, patient, stranger;

  const NOW = Math.floor(Date.now() / 1000);
  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    ({ accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger } = await deployAll());
  });

  async function registerBatch(drug, region, qty, expiryOffset) {
    const tx = await medBatch.connect(manufacturer).registerBatch(
      drug, region, qty, NOW, NOW + expiryOffset, `QmHash_${drug}`
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    return event.args.batchId;
  }

  async function initiateTransfer(batchId, to, qty, region) {
    const tx = await medTransfer.connect(manufacturer).initiateTransfer(batchId, to, qty, region);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "TransferInitiated");
    return event.args.transferId;
  }

  // ── Scenario 1: Full Batch Lifecycle ────────────────────────────

  describe("Scenario 1 — Full Batch Lifecycle", function () {
    let batchId, transferId;

    it("deploy all 4 contracts", async function () {
      expect(await accessControl.getAddress()).to.be.properAddress;
      expect(await medBatch.getAddress()).to.be.properAddress;
      expect(await medTransfer.getAddress()).to.be.properAddress;
      expect(await medAudit.getAddress()).to.be.properAddress;
    });

    it("grant manufacturer + distributor roles", async function () {
      expect(await accessControl.isManufacturer(manufacturer.address)).to.be.true;
      expect(await accessControl.isDistributor(distributor1.address)).to.be.true;
    });

    it("full lifecycle: register → transfer → accept → verify", async function () {
      // Register batch
      batchId = await registerBatch("Paracetamol", "Chennai", 5000, ONE_YEAR);
      let b = await medBatch.getBatch(batchId);
      expect(b.status).to.equal(0n); // Manufactured

      // Audit trail has REGISTERED
      let trail = await medAudit.getAuditTrail(batchId);
      expect(trail[0].action).to.equal("REGISTERED");

      // Initiate transfer
      transferId = await initiateTransfer(batchId, distributor1.address, 5000, "Chennai");
      b = await medBatch.getBatch(batchId);
      expect(b.status).to.equal(1n); // InTransit

      // Audit trail has TRANSFER_INITIATED
      trail = await medAudit.getAuditTrail(batchId);
      expect(trail.map(e => e.action)).to.include("TRANSFER_INITIATED");

      // Distributor accepts
      await medTransfer.connect(distributor1).acceptTransfer(transferId);
      b = await medBatch.getBatch(batchId);
      expect(b.currentOwner).to.equal(distributor1.address);
      expect(b.status).to.equal(2n); // Delivered

      // Audit trail has TRANSFER_ACCEPTED
      trail = await medAudit.getAuditTrail(batchId);
      expect(trail.map(e => e.action)).to.include("TRANSFER_ACCEPTED");

      // Patient verifies batch
      const result = await medBatch.verifyBatch(batchId);
      expect(result.isValid).to.be.true;
      expect(result.drugName).to.equal("Paracetamol");
      expect(result.ownerName).to.equal("MedDist Chennai");

      // Full audit trail has correct entries in order
      trail = await medAudit.getAuditTrail(batchId);
      const actions = trail.map(e => e.action);
      expect(actions[0]).to.equal("REGISTERED");
      expect(actions[1]).to.equal("TRANSFER_INITIATED");
      expect(actions[2]).to.equal("TRANSFER_ACCEPTED");
    });
  });

  // ── Scenario 2: Transfer Rejection ─────────────────────────────

  describe("Scenario 2 — Transfer Rejection", function () {
    it("reject flow: register → initiate → reject", async function () {
      const batchId = await registerBatch("Insulin", "Coimbatore", 1200, ONE_YEAR);
      const transferId = await initiateTransfer(batchId, distributor1.address, 1200, "Coimbatore");

      // Distributor rejects
      await medTransfer.connect(distributor1).rejectTransfer(transferId, "damaged packaging");

      // Ownership stays with manufacturer
      const b = await medBatch.getBatch(batchId);
      expect(b.currentOwner).to.equal(manufacturer.address);
      expect(b.status).to.equal(0n); // Manufactured (reverted)

      // Audit trail has TRANSFER_REJECTED
      const trail = await medAudit.getAuditTrail(batchId);
      expect(trail.map(e => e.action)).to.include("TRANSFER_REJECTED");
    });
  });

  // ── Scenario 3: Expiry Flow ────────────────────────────────────

  describe("Scenario 3 — Expiry Flow", function () {
    it("expiry flow: register expired → mark expired → verify false", async function () {
      // Register batch with already-past expiry
      const tx = await medBatch.connect(manufacturer).registerBatch(
        "Artemether", "Madurai", 800, NOW - ONE_YEAR, NOW - 100, "QmExpired"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
      const batchId = event.args.batchId;

      // Mark expired
      await medAudit.checkAndMarkExpired(batchId);

      // Verify returns false
      const result = await medBatch.verifyBatch(batchId);
      expect(result.isValid).to.be.false;
      expect(result.status).to.equal(3n); // Expired

      // Audit trail has BATCH_EXPIRED
      const trail = await medAudit.getAuditTrail(batchId);
      expect(trail.map(e => e.action)).to.include("BATCH_EXPIRED");
    });
  });

  // ── Scenario 4: Anomaly Escalation ─────────────────────────────

  describe("Scenario 4 — Anomaly Escalation", function () {
    it("anomaly flow: flag → event → audit", async function () {
      const batchId = await registerBatch("Amoxicillin", "Trichy", 3000, ONE_YEAR);

      // Manufacturer flags anomaly
      await expect(
        medAudit.connect(manufacturer).flagAnomaly(batchId, "STOCK_DROP", "50% unexpected reduction")
      ).to.emit(medAudit, "AnomalyFlagged")
        .withArgs(batchId, "STOCK_DROP", manufacturer.address);

      // Audit trail has ANOMALY_FLAGGED
      const trail = await medAudit.getAuditTrail(batchId);
      expect(trail.map(e => e.action)).to.include("ANOMALY_FLAGGED");
    });

    it("unauthorized wallet cannot call flagAnomaly", async function () {
      const batchId = await registerBatch("Salbutamol", "Vellore", 600, ONE_YEAR);
      await expect(
        medAudit.connect(stranger).flagAnomaly(batchId, "HACK", "test")
      ).to.be.revertedWith("MedAudit: unauthorized caller");
    });
  });

  // ── Scenario 5: Paused System ──────────────────────────────────

  describe("Scenario 5 — Paused System", function () {
    it("paused system blocks operations, unpause resumes", async function () {
      // Admin pauses
      await accessControl.pause();

      // registerBatch reverts
      await expect(
        medBatch.connect(manufacturer).registerBatch("Drug", "Region", 100, NOW, NOW + ONE_YEAR, "hash")
      ).to.be.revertedWith("MedBatch: paused");

      // Pre-register a batch before pause by unpausing temporarily
      await accessControl.unpause();
      const batchId = await registerBatch("TestDrug", "Chennai", 100, ONE_YEAR);
      await accessControl.pause();

      // initiateTransfer reverts
      await expect(
        medTransfer.connect(manufacturer).initiateTransfer(batchId, distributor1.address, 100, "Chennai")
      ).to.be.revertedWith("MedTransfer: paused");

      // Admin unpauses
      await accessControl.unpause();

      // Operations resume normally
      const transferId = await initiateTransfer(batchId, distributor1.address, 100, "Chennai");
      expect(transferId).to.not.equal(ethers.ZeroHash);
    });
  });
});
