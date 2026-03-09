const { ethers } = require("ethers");

let provider = null;

function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
}

async function getAdminSigner() {
  const p = getProvider();
  const signers = await p.listAccounts();
  return signers[0];
}

async function getSignerByAddress(address) {
  const p = getProvider();
  return p.getSigner(address);
}

module.exports = { getProvider, getAdminSigner, getSignerByAddress };
