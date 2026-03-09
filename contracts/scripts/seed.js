const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployed addresses
  const deployedPath = path.join(__dirname, "..", "deployments", "deployed.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("deployments/deployed.json not found — run deploy.js first");
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));

  const signers = await hre.ethers.getSigners();
  const admin = signers[0];
  const manufacturer = signers[1];
  const distributor1 = signers[2];
  const distributor2 = signers[3];

  console.log("Admin:          ", admin.address);
  console.log("Manufacturer:   ", manufacturer.address);
  console.log("Distributor 1:  ", distributor1.address);
  console.log("Distributor 2:  ", distributor2.address);

  // Attach to deployed contracts
  const medBatch = await hre.ethers.getContractAt(
    "MedBatch", deployed.contracts.MedBatch
  );
  const medTransfer = await hre.ethers.getContractAt(
    "MedTransfer", deployed.contracts.MedTransfer
  );

  // ── 1. Register 5 seed batches ──────────────────────────────────
  console.log("\n— Registering seed batches …");
  const now = Math.floor(Date.now() / 1000);
  const DAY = 24 * 60 * 60;

  const seedBatches = [
    { drug: "Paracetamol",  region: "Chennai",    qty: 5000, mfgDaysAgo: 30, expiryDays: 400, transferTo: distributor1 },
    { drug: "Insulin",      region: "Coimbatore",  qty: 1200, mfgDaysAgo: 10, expiryDays: 180, transferTo: distributor1 },
    { drug: "Amoxicillin",  region: "Trichy",      qty: 3000, mfgDaysAgo: 5,  expiryDays: 300, transferTo: distributor2, accept: true },
    { drug: "Artemether",   region: "Madurai",     qty: 800,  mfgDaysAgo: 45, expiryDays: 60,  transferTo: null },
    { drug: "Salbutamol",   region: "Vellore",     qty: 600,  mfgDaysAgo: 15, expiryDays: 120, transferTo: null },
  ];

  const batchIds = [];

  for (const s of seedBatches) {
    const mfgDate = now - s.mfgDaysAgo * DAY;
    const expiryDate = now + s.expiryDays * DAY;

    const tx = await medBatch.connect(manufacturer).registerBatch(
      s.drug, s.region, s.qty, mfgDate, expiryDate, `QmSeed_${s.drug}`
    );
    const receipt = await tx.wait();

    let batchId;
    for (const log of receipt.logs) {
      try {
        const parsed = medBatch.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === "BatchRegistered") {
          batchId = parsed.args.batchId;
          break;
        }
      } catch (_) {}
    }
    if (!batchId) throw new Error(`BatchRegistered event not found for ${s.drug}`);
    batchIds.push({ ...s, batchId });
    console.log(`  Registered ${s.drug} → ${batchId.slice(0, 18)}…`);
  }

  // ── 2. Initiate transfers (Paracetamol + Insulin → D1 pending) ──
  console.log("\n— Initiating transfers …");
  for (const entry of batchIds) {
    if (!entry.transferTo) continue;

    const tx = await medTransfer.connect(manufacturer).initiateTransfer(
      entry.batchId, entry.transferTo.address, entry.qty, entry.region
    );
    const receipt = await tx.wait();

    let transferId;
    for (const log of receipt.logs) {
      try {
        const parsed = medTransfer.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === "TransferInitiated") {
          transferId = parsed.args.transferId;
          break;
        }
      } catch (_) {}
    }
    console.log(`  Transfer initiated: ${entry.drug} → ${entry.transferTo.address.slice(0, 10)}… (id=${transferId})`);

    // Accept transfer for Amoxicillin
    if (entry.accept && transferId !== undefined) {
      await (await medTransfer.connect(entry.transferTo).acceptTransfer(transferId)).wait();
      console.log(`  Transfer accepted: ${entry.drug} → delivered`);
    }
  }

  console.log("\n✅ Seed complete: 5 batches, 2 pending transfers, 1 accepted transfer.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
