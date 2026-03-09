const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: __dirname + "/.." });
}

const network = process.env.NETWORK || "localhost";

console.log(`🔄 Resetting chain data on network: ${network}\n`);

run(`npx hardhat run scripts/deploy.js --network ${network}`);
run(`npx hardhat run scripts/seed.js --network ${network}`);

console.log("\n✅ Reset complete — contracts deployed and seeded.");
