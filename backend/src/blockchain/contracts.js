const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { getProvider, getAdminSigner, getSignerByAddress } = require("./provider");

const ARTIFACTS_DIR = path.join(__dirname, "..", "..", "..", "contracts", "artifacts", "contracts");

function loadABI(contractName) {
  const abiPath = path.join(ARTIFACTS_DIR, `${contractName}.sol`, `${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return artifact.abi;
}

function getAddresses() {
  // Prefer env vars; fall back to deployments/deployed.json
  if (process.env.ACCESS_CONTROL_ADDRESS) {
    return {
      MedAccessControl: process.env.ACCESS_CONTROL_ADDRESS,
      MedBatch: process.env.MED_BATCH_ADDRESS,
      MedTransfer: process.env.MED_TRANSFER_ADDRESS,
      MedAudit: process.env.MED_AUDIT_ADDRESS,
    };
  }

  const deployedPath = path.join(__dirname, "..", "..", "..", "contracts", "deployments", "deployed.json");
  if (fs.existsSync(deployedPath)) {
    const data = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
    return data.contracts;
  }

  throw new Error("No contract addresses found. Set env vars or deploy contracts first.");
}

let contracts = null;

function getContracts() {
  if (contracts) return contracts;

  const provider = getProvider();
  const addrs = getAddresses();

  contracts = {
    accessControl: new ethers.Contract(addrs.MedAccessControl, loadABI("MedAccessControl"), provider),
    medBatch: new ethers.Contract(addrs.MedBatch, loadABI("MedBatch"), provider),
    medTransfer: new ethers.Contract(addrs.MedTransfer, loadABI("MedTransfer"), provider),
    medAudit: new ethers.Contract(addrs.MedAudit, loadABI("MedAudit"), provider),
  };

  return contracts;
}

async function getContractWithSigner(contractName, signerAddress) {
  const c = getContracts();
  const signer = await getSignerByAddress(signerAddress);
  return c[contractName].connect(signer);
}

module.exports = { getContracts, getContractWithSigner, getAddresses };
