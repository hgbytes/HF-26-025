const { ethers } = require("ethers");

/**
 * Extracts wallet address from x-wallet-address header.
 * Attaches req.wallet (checksummed) if valid.
 */
function walletAuth(req, res, next) {
  const raw = req.headers["x-wallet-address"];
  if (!raw) {
    return res.status(401).json({ error: "Missing x-wallet-address header" });
  }
  if (!ethers.isAddress(raw)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }
  req.wallet = ethers.getAddress(raw); // checksum
  next();
}

/**
 * Optional wallet — attaches req.wallet if present, but doesn't block.
 */
function optionalWallet(req, _res, next) {
  const raw = req.headers["x-wallet-address"];
  if (raw && ethers.isAddress(raw)) {
    req.wallet = ethers.getAddress(raw);
  }
  next();
}

module.exports = { walletAuth, optionalWallet };
