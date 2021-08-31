const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ", deployer.address
  );

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Fallback = await ethers.getContractFactory("Fallback");
  const fallback = await Fallback.deploy();
  console.log("Fallback address: ", await fallback.address);
  console.log("Account balance after Fallback deploy: ", (await deployer.getBalance()).toString());

  const FallbackAttack = await ethers.getContractFactory("FallbackAttack");
  const fallbackAttack = await FallbackAttack.deploy();
  console.log("FallbackAttack address: ", await fallbackAttack.address);
  console.log("Account balance after FallbackAttack deploy: ", (await deployer.getBalance()).toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
