const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll } = require("./helpers");

describe("MedAudit", function () {
  let accessControl, medBatch, medTransfer, medAudit;
  let admin, manufacturer, distributor1, distributor2, patient, stranger;
  let batchId;

  const NOW = Math.floor(Date.now() / 1000);
  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    ({ accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger } = await deployAll());

    // Register a sample batch (this also creates a REGISTERED audit entry)
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "Paracetamol", "Chennai", 5000, NOW, NOW + ONE_YEAR, "QmHash123"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    batchId = event.args.batchId;
  });

  it("logAction stores entry correctly", async function () {
    // The registerBatch already logged a REGISTERED entry
    const trail = await medAudit.getAuditTrail(batchId);
    expect(trail.length).to.be.gte(1);
    expect(trail[0].action).to.equal("REGISTERED");
  });

  it("only authorized contracts can call logAction", async function () {
    await expect(
      medAudit.connect(stranger).logAction(batchId, "HACK", "{}")
    ).to.be.revertedWith("MedAudit: unauthorized caller");
  });

  it("getAuditTrail returns entries in timestamp order", async function () {
    // Initiate transfer (creates TRANSFER_INITIATED audit)
    const tx = await medTransfer.connect(manufacturer).initiateTransfer(
      batchId, distributor1.address, 5000, "Chennai"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "TransferInitiated");
    const transferId = event.args.transferId;

    // Accept transfer (creates TRANSFER_ACCEPTED audit)
    await medTransfer.connect(distributor1).acceptTransfer(transferId);

    const trail = await medAudit.getAuditTrail(batchId);
    expect(trail.length).to.be.gte(3);
    expect(trail[0].action).to.equal("REGISTERED");
    expect(trail[1].action).to.equal("TRANSFER_INITIATED");
    expect(trail[2].action).to.equal("TRANSFER_ACCEPTED");
  });

  it("auditByBatch populated correctly", async function () {
    const trail = await medAudit.getAuditTrail(batchId);
    expect(trail.length).to.be.gte(1);
    expect(trail[0].batchId).to.equal(batchId);
  });

  it("auditByWallet populated correctly", async function () {
    // MedBatch contract called logAction, so the performer is the batch contract
    const batchAddr = await medBatch.getAddress();
    const entries = await medAudit.getAuditByWallet(batchAddr);
    expect(entries.length).to.be.gte(1);
  });

  it("checkAndMarkExpired marks expired batch correctly", async function () {
    // Register a batch with past expiry
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "ExpiredDrug", "Chennai", 100, NOW - ONE_YEAR, NOW - 100, "hash"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    const expiredBatchId = event.args.batchId;

    await medAudit.checkAndMarkExpired(expiredBatchId);

    const b = await medBatch.getBatch(expiredBatchId);
    expect(b.status).to.equal(3n); // Expired
  });

  it("checkAndMarkExpired does nothing for non-expired batch", async function () {
    await expect(
      medAudit.checkAndMarkExpired(batchId)
    ).to.be.revertedWith("MedAudit: not yet expired");
  });

  it("getExpiringBatches returns correct batchIds", async function () {
    // Register a batch expiring in 30 days
    const shortExpiry = NOW + (30 * 24 * 60 * 60);
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "ShortExpiry", "Chennai", 100, NOW, shortExpiry, "hash"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    const shortBatchId = event.args.batchId;

    // Query for batches expiring within 60 days
    const expiring = await medAudit.getExpiringBatches(60);
    expect(expiring).to.include(shortBatchId);
  });

  it("flagAnomaly stores anomaly entry on-chain", async function () {
    await medAudit.connect(manufacturer).flagAnomaly(batchId, "STOCK_DROP", "50% reduction");
    const trail = await medAudit.getAuditTrail(batchId);
    const flagEntry = trail.find(e => e.action === "ANOMALY_FLAGGED");
    expect(flagEntry).to.not.be.undefined;
    expect(flagEntry.metadata).to.contain("STOCK_DROP");
  });

  it("only backend/manufacturer can call flagAnomaly", async function () {
    await expect(
      medAudit.connect(stranger).flagAnomaly(batchId, "HACK", "notes")
    ).to.be.revertedWith("MedAudit: unauthorized caller");
  });

  it("emits AnomalyFlagged event", async function () {
    await expect(
      medAudit.connect(manufacturer).flagAnomaly(batchId, "RAPID_TRANSFER", "notes")
    ).to.emit(medAudit, "AnomalyFlagged")
      .withArgs(batchId, "RAPID_TRANSFER", manufacturer.address);
  });

  it("emits ActionLogged event", async function () {
    // Admin can call logAction
    await expect(
      medAudit.logAction(batchId, "PATIENT_VERIFIED", "{}")
    ).to.emit(medAudit, "ActionLogged");
  });

  it("emits BatchMarkedExpired event", async function () {
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "ExpiredDrug", "Chennai", 100, NOW - ONE_YEAR, NOW - 100, "hash"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    const expiredBatchId = event.args.batchId;

    await expect(medAudit.checkAndMarkExpired(expiredBatchId))
      .to.emit(medAudit, "BatchMarkedExpired");
  });

  it("entryCount increments correctly", async function () {
    const count = await medAudit.entryCount();
    expect(count).to.be.gte(1n); // At least the REGISTERED entry
  });

  it("getLatestAction returns most recent entry", async function () {
    const latest = await medAudit.getLatestAction(batchId);
    expect(latest.action).to.equal("REGISTERED");
  });

  it("getEntryCount returns correct count per batch", async function () {
    const count = await medAudit.getEntryCount(batchId);
    expect(count).to.equal(1n);
  });
});
