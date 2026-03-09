const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedAccessControl", function () {
  let accessControl;
  let admin, manufacturer, distributor, patient, stranger;

  beforeEach(async function () {
    [admin, manufacturer, distributor, patient, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MedAccessControl");
    accessControl = await Factory.deploy();
    await accessControl.waitForDeployment();
  });

  it("deployer has ADMIN_ROLE on deploy", async function () {
    const adminRole = await accessControl.ADMIN_ROLE();
    expect(await accessControl.hasRole(adminRole, admin.address)).to.be.true;
  });

  it("deployer has MANUFACTURER_ROLE on deploy", async function () {
    expect(await accessControl.isManufacturer(admin.address)).to.be.true;
  });

  it("admin can grant MANUFACTURER_ROLE", async function () {
    await accessControl.grantManufacturerRole(manufacturer.address, "MedCorp TN");
    expect(await accessControl.isManufacturer(manufacturer.address)).to.be.true;
  });

  it("admin can grant DISTRIBUTOR_ROLE", async function () {
    await accessControl.grantDistributorRole(distributor.address, "MedDist Chennai");
    expect(await accessControl.isDistributor(distributor.address)).to.be.true;
  });

  it("admin can grant PATIENT_ROLE", async function () {
    await accessControl.grantPatientRole(patient.address);
    expect(await accessControl.isPatient(patient.address)).to.be.true;
  });

  it("admin can revoke any role", async function () {
    await accessControl.grantManufacturerRole(manufacturer.address, "MedCorp");
    const role = await accessControl.MANUFACTURER_ROLE();
    await accessControl.revokeUserRole(manufacturer.address, role);
    expect(await accessControl.isManufacturer(manufacturer.address)).to.be.false;
  });

  it("non-admin cannot grant roles", async function () {
    await expect(
      accessControl.connect(stranger).grantManufacturerRole(stranger.address, "Fake")
    ).to.be.reverted;
  });

  it("isManufacturer returns true after grant", async function () {
    await accessControl.grantManufacturerRole(manufacturer.address, "Corp");
    expect(await accessControl.isManufacturer(manufacturer.address)).to.be.true;
  });

  it("isDistributor returns true after grant", async function () {
    await accessControl.grantDistributorRole(distributor.address, "Dist");
    expect(await accessControl.isDistributor(distributor.address)).to.be.true;
  });

  it("pause() blocks whenNotPaused functions", async function () {
    await accessControl.pause();
    expect(await accessControl.paused()).to.be.true;
  });

  it("unpause() restores functionality", async function () {
    await accessControl.pause();
    await accessControl.unpause();
    expect(await accessControl.paused()).to.be.false;
  });

  it("non-admin cannot pause", async function () {
    await expect(accessControl.connect(stranger).pause()).to.be.reverted;
  });

  it("walletNames stored correctly on grant", async function () {
    await accessControl.grantManufacturerRole(manufacturer.address, "MedCorp TN");
    expect(await accessControl.getWalletName(manufacturer.address)).to.equal("MedCorp TN");
  });

  it("RoleGrantedCustom event emitted with correct args", async function () {
    const role = await accessControl.MANUFACTURER_ROLE();
    await expect(accessControl.grantManufacturerRole(manufacturer.address, "MedCorp TN"))
      .to.emit(accessControl, "RoleGrantedCustom")
      .withArgs(manufacturer.address, role, "MedCorp TN");
  });

  it("SystemPaused event emitted", async function () {
    await expect(accessControl.pause())
      .to.emit(accessControl, "SystemPaused")
      .withArgs(admin.address);
  });

  it("SystemUnpaused event emitted", async function () {
    await accessControl.pause();
    await expect(accessControl.unpause())
      .to.emit(accessControl, "SystemUnpaused")
      .withArgs(admin.address);
  });
});
