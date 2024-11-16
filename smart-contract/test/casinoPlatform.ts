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

        const promise = casinoPlatform.createBettingPost(0, 0, 0);
        expect(promise).not.to.be.reverted;

        await promise;
        
        expect(await casinoPlatform.nBetting()).to.equals(1);
    });

    it("should create match successfully", async function() {
        const casinoPlatform = await deploy();

        const promise = casinoPlatform.createMatch("liv", "manu");
        expect(promise).not.to.be.reverted;

        await promise;
        
        expect(await casinoPlatform.nMatch()).to.equals(1);
    });
});
