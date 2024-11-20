# FAQ

Q1: Why we use map instead of array for storing match and post?
A1: Because struct with map cant be store in array

Q2: Why the casino is ownable and only owner can create and finish matches?
A2: Because we are currently not connecting to chainlink. We're planned to use chainlink (highly secure and trusted link between off-chain and on-chain data) for matches information.

Q3: Why use View struct for getting data?
A3: Because it is to avoid sending dynamic size data such as array and map to users to breaking gas limit.


# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
