const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll } = require("./helpers");

describe("MedBatch", function () {
  let accessControl, medBatch, medTransfer, medAudit;
  let admin, manufacturer, distributor1, distributor2, patient, stranger;

  const NOW = Math.floor(Date.now() / 1000);
  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    ({ accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger } = await deployAll());
  });

  async function registerSample() {
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "Paracetamol", "Chennai", 5000, NOW, NOW + ONE_YEAR, "QmHash123"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    return event.args.batchId;
  }

  it("manufacturer can register batch", async function () {
    const batchId = await registerSample();
    expect(batchId).to.not.equal(ethers.ZeroHash);
  });

  it("non-manufacturer cannot register batch", async function () {
    await expect(
      medBatch.connect(stranger).registerBatch("Drug", "Region", 100, NOW, NOW + ONE_YEAR, "hash")
    ).to.be.revertedWith("MedBatch: caller is not manufacturer");
  });

  it("batchId is unique per registration", async function () {
    const id1 = await registerSample();
    const id2 = await registerSample();
    expect(id1).to.not.equal(id2);
  });

  it("getBatch returns correct struct fields", async function () {
    const batchId = await registerSample();
    const b = await medBatch.getBatch(batchId);
    expect(b.drugName).to.equal("Paracetamol");
    expect(b.region).to.equal("Chennai");
    expect(b.quantity).to.equal(5000n);
    expect(b.registeredBy).to.equal(manufacturer.address);
    expect(b.currentOwner).to.equal(manufacturer.address);
    expect(b.isActive).to.be.true;
    expect(b.status).to.equal(0n); // Manufactured
    expect(b.registeredAt).to.be.gt(0n);
  });

  it("expiry > manufacture enforced", async function () {
    await expect(
      medBatch.connect(manufacturer).registerBatch("Drug", "Region", 100, NOW + ONE_YEAR, NOW, "hash")
    ).to.be.revertedWith("MedBatch: expiry must be after manufacture date");
  });

  it("quantity > 0 enforced", async function () {
    await expect(
      medBatch.connect(manufacturer).registerBatch("Drug", "Region", 0, NOW, NOW + ONE_YEAR, "hash")
    ).to.be.revertedWith("MedBatch: quantity must be > 0");
  });

  it("drugName not empty enforced", async function () {
    await expect(
      medBatch.connect(manufacturer).registerBatch("", "Region", 100, NOW, NOW + ONE_YEAR, "hash")
    ).to.be.revertedWith("MedBatch: drugName empty");
  });

  it("verifyBatch returns isValid = true for active batch", async function () {
    const batchId = await registerSample();
    const result = await medBatch.verifyBatch(batchId);
    expect(result.isValid).to.be.true;
    expect(result.drugName).to.equal("Paracetamol");
    expect(result.region).to.equal("Chennai");
    expect(result.ownerName).to.equal("MedCorp TN");
  });

  it("verifyBatch returns isValid = false for deactivated batch", async function () {
    const batchId = await registerSample();
    await medBatch.deactivateBatch(batchId, "counterfeit detected");
    const result = await medBatch.verifyBatch(batchId);
    expect(result.isValid).to.be.false;
  });

  it("verifyBatch returns isValid = false for expired batch", async function () {
    // Register with past expiry
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "Expired", "Chennai", 100, NOW - ONE_YEAR, NOW - 100, "hash"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    const batchId = event.args.batchId;

    // Mark expired via audit
    await medAudit.checkAndMarkExpired(batchId);
    const result = await medBatch.verifyBatch(batchId);
    expect(result.isValid).to.be.false;
  });

  it("batchesByManufacturer updated on register", async function () {
    await registerSample();
    const ids = await medBatch.getBatchesByManufacturer(manufacturer.address);
    expect(ids.length).to.equal(1);
  });

  it("batchesByOwner updated on register", async function () {
    await registerSample();
    await registerSample();
    const ids = await medBatch.getBatchesByOwner(manufacturer.address);
    expect(ids.length).to.equal(2);
  });

  it("updateOwner moves batch between owner maps", async function () {
    const batchId = await registerSample();
    // Initiate + accept transfer to move ownership
    const tx = await medTransfer.connect(manufacturer).initiateTransfer(batchId, distributor1.address, 5000, "Chennai");
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "TransferInitiated");
    const transferId = event.args.transferId;

    await medTransfer.connect(distributor1).acceptTransfer(transferId);

    const mfgBatches = await medBatch.getBatchesByOwner(manufacturer.address);
    const distBatches = await medBatch.getBatchesByOwner(distributor1.address);
    expect(mfgBatches).to.not.include(batchId);
    expect(distBatches).to.include(batchId);
  });

  it("only MedTransfer can call updateOwner", async function () {
    const batchId = await registerSample();
    await expect(
      medBatch.connect(stranger).updateOwner(batchId, stranger.address)
    ).to.be.revertedWith("MedBatch: caller is not transfer contract");
  });

  it("deactivateBatch sets isActive = false (admin only)", async function () {
    const batchId = await registerSample();
    await medBatch.deactivateBatch(batchId, "recall");
    const b = await medBatch.getBatch(batchId);
    expect(b.isActive).to.be.false;
  });

  it("non-admin cannot deactivate", async function () {
    const batchId = await registerSample();
    await expect(
      medBatch.connect(stranger).deactivateBatch(batchId, "reason")
    ).to.be.revertedWith("MedBatch: caller is not admin");
  });

  it("BatchRegistered event emitted with correct args", async function () {
    await expect(
      medBatch.connect(manufacturer).registerBatch("Paracetamol", "Chennai", 5000, NOW, NOW + ONE_YEAR, "QmHash")
    ).to.emit(medBatch, "BatchRegistered");
  });

  it("audit logAction called on registerBatch", async function () {
    const batchId = await registerSample();
    const trail = await medAudit.getAuditTrail(batchId);
    expect(trail.length).to.be.gte(1);
    expect(trail[0].action).to.equal("REGISTERED");
  });

  it("paused system blocks registerBatch", async function () {
    await accessControl.pause();
    await expect(
      medBatch.connect(manufacturer).registerBatch("Drug", "Region", 100, NOW, NOW + ONE_YEAR, "hash")
    ).to.be.revertedWith("MedBatch: paused");
  });

  it("batchExists returns true for registered batch", async function () {
    const batchId = await registerSample();
    expect(await medBatch.batchExists(batchId)).to.be.true;
  });

  it("batchExists returns false for unknown batch", async function () {
    expect(await medBatch.batchExists(ethers.ZeroHash)).to.be.false;
  });
});
