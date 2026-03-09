const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll } = require("./helpers");

describe("MedTransfer", function () {
  let accessControl, medBatch, medTransfer, medAudit;
  let admin, manufacturer, distributor1, distributor2, patient, stranger;
  let batchId;

  const NOW = Math.floor(Date.now() / 1000);
  const ONE_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    ({ accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger } = await deployAll());

    // Register a sample batch
    const tx = await medBatch.connect(manufacturer).registerBatch(
      "Paracetamol", "Chennai", 5000, NOW, NOW + ONE_YEAR, "QmHash123"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "BatchRegistered");
    batchId = event.args.batchId;
  });

  async function initiateHelper() {
    const tx = await medTransfer.connect(manufacturer).initiateTransfer(
      batchId, distributor1.address, 5000, "Chennai"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "TransferInitiated");
    return event.args.transferId;
  }

  it("manufacturer can initiate transfer", async function () {
    const transferId = await initiateHelper();
    expect(transferId).to.not.equal(ethers.ZeroHash);
  });

  it("non-owner cannot initiate transfer", async function () {
    await expect(
      medTransfer.connect(stranger).initiateTransfer(batchId, distributor1.address, 5000, "Chennai")
    ).to.be.reverted;
  });

  it("can only transfer to a registered distributor", async function () {
    await expect(
      medTransfer.connect(manufacturer).initiateTransfer(batchId, stranger.address, 5000, "Chennai")
    ).to.be.revertedWith("MedTransfer: receiver is not distributor");
  });

  it("quantity must be > 0", async function () {
    await expect(
      medTransfer.connect(manufacturer).initiateTransfer(batchId, distributor1.address, 0, "Chennai")
    ).to.be.revertedWith("MedTransfer: quantity must be > 0");
  });

  it("quantity cannot exceed batch quantity", async function () {
    await expect(
      medTransfer.connect(manufacturer).initiateTransfer(batchId, distributor1.address, 10000, "Chennai")
    ).to.be.revertedWith("MedTransfer: quantity exceeds batch");
  });

  it("batch status → InTransit on initiate", async function () {
    await initiateHelper();
    const b = await medBatch.getBatch(batchId);
    expect(b.status).to.equal(1n); // InTransit
  });

  it("distributor can accept pending transfer", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);
    const t = await medTransfer.getTransfer(transferId);
    expect(t.status).to.equal(1n); // Accepted
  });

  it("only receiver can accept transfer", async function () {
    const transferId = await initiateHelper();
    await expect(
      medTransfer.connect(stranger).acceptTransfer(transferId)
    ).to.be.reverted;
  });

  it("ownership updates after acceptance", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);
    const b = await medBatch.getBatch(batchId);
    expect(b.currentOwner).to.equal(distributor1.address);
  });

  it("batch status → Delivered after accept", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);
    const b = await medBatch.getBatch(batchId);
    expect(b.status).to.equal(2n); // Delivered
  });

  it("distributor can reject transfer with reason", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).rejectTransfer(transferId, "damaged goods");
    const t = await medTransfer.getTransfer(transferId);
    expect(t.status).to.equal(2n); // Rejected
    expect(t.rejectionReason).to.equal("damaged goods");
  });

  it("rejected transfer does not change ownership", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).rejectTransfer(transferId, "damaged");
    const b = await medBatch.getBatch(batchId);
    expect(b.currentOwner).to.equal(manufacturer.address);
  });

  it("batch status reverts to Manufactured on reject", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).rejectTransfer(transferId, "damaged");
    const b = await medBatch.getBatch(batchId);
    expect(b.status).to.equal(0n); // Manufactured
  });

  it("sender can cancel pending transfer", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(manufacturer).cancelTransfer(transferId);
    const t = await medTransfer.getTransfer(transferId);
    expect(t.status).to.equal(3n); // Cancelled
  });

  it("cancelled transfer does not change ownership", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(manufacturer).cancelTransfer(transferId);
    const b = await medBatch.getBatch(batchId);
    expect(b.currentOwner).to.equal(manufacturer.address);
  });

  it("full transfer history retrievable per batch", async function () {
    await initiateHelper();
    const history = await medTransfer.getTransferHistory(batchId);
    expect(history.length).to.be.gte(1);
  });

  it("getPendingTransfers returns correct list", async function () {
    await initiateHelper();
    const pending = await medTransfer.getPendingTransfers(distributor1.address);
    expect(pending.length).to.equal(1);
    expect(pending[0].batchId).to.equal(batchId);
  });

  it("pendingByWallet cleared after accept", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);
    const pending = await medTransfer.getPendingTransfers(distributor1.address);
    expect(pending.length).to.equal(0);
  });

  it("pendingByWallet cleared after reject", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).rejectTransfer(transferId, "bad");
    const pending = await medTransfer.getPendingTransfers(distributor1.address);
    expect(pending.length).to.equal(0);
  });

  it("pendingByWallet cleared after cancel", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(manufacturer).cancelTransfer(transferId);
    const pending = await medTransfer.getPendingTransfers(distributor1.address);
    expect(pending.length).to.equal(0);
  });

  it("emits TransferInitiated event", async function () {
    await expect(
      medTransfer.connect(manufacturer).initiateTransfer(batchId, distributor1.address, 5000, "Chennai")
    ).to.emit(medTransfer, "TransferInitiated");
  });

  it("emits TransferAccepted event", async function () {
    const transferId = await initiateHelper();
    await expect(
      medTransfer.connect(distributor1).acceptTransfer(transferId)
    ).to.emit(medTransfer, "TransferAccepted");
  });

  it("emits TransferRejected event", async function () {
    const transferId = await initiateHelper();
    await expect(
      medTransfer.connect(distributor1).rejectTransfer(transferId, "bad quality")
    ).to.emit(medTransfer, "TransferRejected");
  });

  it("emits TransferCancelled event", async function () {
    const transferId = await initiateHelper();
    await expect(
      medTransfer.connect(manufacturer).cancelTransfer(transferId)
    ).to.emit(medTransfer, "TransferCancelled");
  });

  it("audit logAction called for initiate", async function () {
    await initiateHelper();
    const trail = await medAudit.getAuditTrail(batchId);
    const actions = trail.map(e => e.action);
    expect(actions).to.include("TRANSFER_INITIATED");
  });

  it("audit logAction called for accept", async function () {
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);
    const trail = await medAudit.getAuditTrail(batchId);
    const actions = trail.map(e => e.action);
    expect(actions).to.include("TRANSFER_ACCEPTED");
  });

  it("getCurrentOwner returns correct address", async function () {
    const owner = await medTransfer.getCurrentOwner(batchId);
    expect(owner).to.equal(manufacturer.address);
  });

  it("distributor who owns batch can initiate transfer", async function () {
    // Transfer to distributor1 first
    const transferId = await initiateHelper();
    await medTransfer.connect(distributor1).acceptTransfer(transferId);

    // Now distributor1 owns the batch, can transfer to distributor2
    const tx = await medTransfer.connect(distributor1).initiateTransfer(
      batchId, distributor2.address, 5000, "Madurai"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === "TransferInitiated");
    expect(event.args.transferId).to.not.equal(ethers.ZeroHash);
  });
});
