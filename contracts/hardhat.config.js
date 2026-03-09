require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {},
    ganache: {
      url: process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: {
        mnemonic: process.env.GANACHE_MNEMONIC || "test test test test test test test test test test test junk"
      }
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  },
  gasReporter: {
    enabled: true,
    currency: "INR"
  }
};
