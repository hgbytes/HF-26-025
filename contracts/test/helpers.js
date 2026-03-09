const { ethers } = require("hardhat");

/**
 * Deploys all 4 contracts in correct dependency order with cross-authorizations.
 * Returns { accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger }
 */
async function deployAll() {
  const [admin, manufacturer, distributor1, distributor2, patient, stranger] = await ethers.getSigners();

  // 1. MedAccessControl
  const ACFactory = await ethers.getContractFactory("MedAccessControl");
  const accessControl = await ACFactory.deploy();
  await accessControl.waitForDeployment();

  // 2. MedAudit (with ZeroAddress for batch — set later)
  const AuditFactory = await ethers.getContractFactory("MedAudit");
  const medAudit = await AuditFactory.deploy(await accessControl.getAddress(), ethers.ZeroAddress);
  await medAudit.waitForDeployment();

  // 3. MedBatch (needs AccessControl + Audit)
  const BatchFactory = await ethers.getContractFactory("MedBatch");
  const medBatch = await BatchFactory.deploy(await accessControl.getAddress(), await medAudit.getAddress());
  await medBatch.waitForDeployment();

  // 4. Set Batch address in Audit
  await medAudit.setBatchContract(await medBatch.getAddress());

  // 5. MedTransfer (needs AccessControl + Batch + Audit)
  const TransferFactory = await ethers.getContractFactory("MedTransfer");
  const medTransfer = await TransferFactory.deploy(
    await accessControl.getAddress(),
    await medBatch.getAddress(),
    await medAudit.getAddress()
  );
  await medTransfer.waitForDeployment();

  // 6. Authorize contracts
  await medBatch.setTransferContract(await medTransfer.getAddress());
  await medAudit.authorizeContract(await medBatch.getAddress());
  await medAudit.authorizeContract(await medTransfer.getAddress());

  // 7. Grant roles
  await accessControl.grantManufacturerRole(manufacturer.address, "MedCorp TN");
  await accessControl.grantDistributorRole(distributor1.address, "MedDist Chennai");
  await accessControl.grantDistributorRole(distributor2.address, "PharmaLink Madurai");
  await accessControl.grantPatientRole(patient.address);

  return { accessControl, medBatch, medTransfer, medAudit, admin, manufacturer, distributor1, distributor2, patient, stranger };
}

module.exports = { deployAll };
