import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("casino platform", function() {
    async function deploy() {
    
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();
    
        const CasinoPlatform = await hre.ethers.getContractFactory("CasinoPlatform");
        const casinoPlatform = await CasinoPlatform.deploy();
        // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
    
        return casinoPlatform
    }

    it("should create betting post successfully", async function() {
        const casinoPlatform = await deploy();

        expect(casinoPlatform.createBettingPost(0, 0, 0)).not.to.be.reverted;

        expect(casinoPlatform.nBetting).to.equals(1);
    })
});
