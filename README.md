# uk-casino-platform
This is UK web3 casino platform PoC, it's a part of blockchain class final project

How deploy smart contract
run
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/CasinoPlatform.ts --network sepolia

To force a compilation you can use the --force argument, or run npx hardhat clean to clear the cache and delete the artifacts.