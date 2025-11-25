const hre = require("hardhat");

async function main() {
  console.log("Deploying PokerGame contract...");

  const PokerGame = await hre.ethers.getContractFactory("PokerGame");
  const pokerGame = await PokerGame.deploy();

  await pokerGame.deployed();

  console.log("PokerGame deployed to:", pokerGame.address);
  console.log("Contract owner:", await pokerGame.owner());

  console.log("\nPlease update your .env file with:");
  console.log(`VITE_CONTRACT_ADDRESS=${pokerGame.address}`);

  console.log("\nWaiting for block confirmations...");
  await pokerGame.deployTransaction.wait(5);

  console.log("\nVerifying contract on BSCScan...");
  try {
    await hre.run("verify:verify", {
      address: pokerGame.address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
