import hre from "hardhat";

async function main() {
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const CasinoPlatform = await hre.ethers.getContractFactory(
            "CasinoPlatform"
        );
        const casinoPlatform = await CasinoPlatform.deploy();
        // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

        return { casinoPlatform, owner, otherAccount };
    }

    const { casinoPlatform } = await deploy();

    console.log("address = ", await casinoPlatform.getAddress());

    await casinoPlatform.createMatch("Manchester United", "Liverpool");
    await casinoPlatform.createMatch("Arsenal", "Chelsea");
    await casinoPlatform.createMatch("Barcelona", "Real Madrid");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
