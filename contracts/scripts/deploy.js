const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. MedAccessControl
  const AccessControl = await hre.ethers.getContractFactory("MedAccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessControlAddr = await accessControl.getAddress();
  console.log("MedAccessControl deployed to:", accessControlAddr);

  // 2. MedAudit (with ZeroAddress for Batch — set after Batch deploy)
  const MedAudit = await hre.ethers.getContractFactory("MedAudit");
  const medAudit = await MedAudit.deploy(accessControlAddr, hre.ethers.ZeroAddress);
  await medAudit.waitForDeployment();
  const medAuditAddr = await medAudit.getAddress();
  console.log("MedAudit deployed to:", medAuditAddr);

  // 3. MedBatch (needs AccessControl + Audit)
  const MedBatch = await hre.ethers.getContractFactory("MedBatch");
  const medBatch = await MedBatch.deploy(accessControlAddr, medAuditAddr);
  await medBatch.waitForDeployment();
  const medBatchAddr = await medBatch.getAddress();
  console.log("MedBatch deployed to:", medBatchAddr);

  // 4. Set Batch address in Audit
  await (await medAudit.setBatchContract(medBatchAddr)).wait();
  console.log("MedAudit → setBatchContract done");

  // 5. MedTransfer (needs AccessControl + Batch + Audit)
  const MedTransfer = await hre.ethers.getContractFactory("MedTransfer");
  const medTransfer = await MedTransfer.deploy(accessControlAddr, medBatchAddr, medAuditAddr);
  await medTransfer.waitForDeployment();
  const medTransferAddr = await medTransfer.getAddress();
  console.log("MedTransfer deployed to:", medTransferAddr);

  // 6. Authorize MedTransfer to call MedBatch + MedAudit
  await (await medBatch.setTransferContract(medTransferAddr)).wait();
  await (await medAudit.authorizeContract(medTransferAddr)).wait();
  await (await medAudit.authorizeContract(medBatchAddr)).wait();
  console.log("Cross-contract authorizations set");

  // 7. Grant roles to wallets (from env or use signers[1], signers[2])
  const signers = await hre.ethers.getSigners();
  const mfgWallet = process.env.MANUFACTURER_WALLET || signers[1]?.address;
  const dist1Wallet = process.env.DISTRIBUTOR_1_WALLET || signers[2]?.address;
  const dist2Wallet = process.env.DISTRIBUTOR_2_WALLET || signers[3]?.address;

  if (mfgWallet) {
    await (await accessControl.grantManufacturerRole(mfgWallet, "MedCorp TN")).wait();
    console.log("Manufacturer role granted to:", mfgWallet);
  }
  if (dist1Wallet) {
    await (await accessControl.grantDistributorRole(dist1Wallet, "MedDist Chennai")).wait();
    console.log("Distributor 1 role granted to:", dist1Wallet);
  }
  if (dist2Wallet) {
    await (await accessControl.grantDistributorRole(dist2Wallet, "PharmaLink Madurai")).wait();
    console.log("Distributor 2 role granted to:", dist2Wallet);
  }

  // 8. Save deployed addresses
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const deployed = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      MedAccessControl: accessControlAddr,
      MedBatch: medBatchAddr,
      MedTransfer: medTransferAddr,
      MedAudit: medAuditAddr,
    },
    wallets: {
      manufacturer: mfgWallet || "",
      distributor1: dist1Wallet || "",
      distributor2: dist2Wallet || "",
    }
  };

  const outPath = path.join(deploymentsDir, "deployed.json");
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));
  console.log("\n✅ All contracts deployed. Addresses saved to deployments/deployed.json");

  return deployed;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
