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
    
        return { casinoPlatform, owner }
    }

    it("should create match successfully", async function() {
        const { casinoPlatform } = await deploy();

        await expect(casinoPlatform.createMatch("liv", "manu")).not.to.be.reverted;

        expect(await casinoPlatform.nMatch()).to.equals(1);
    });

    it("should revert create betting post when the matchId is not exist", async function() {
        const { casinoPlatform, owner } = await deploy();

        // create post
        const stakeAmount = 100;

        await expect(casinoPlatform.createBettingPost(0, 0, 0, {value: stakeAmount})).to.be.revertedWith("matchId not existed");
        
        expect(await hre.ethers.provider.getBalance(casinoPlatform.target)).to.equals(0);
    });

    it("should create betting post successfully when the matchId existed", async function() {
        const { casinoPlatform, owner } = await deploy();

        // create match
        await casinoPlatform.createMatch("liv", "manu");

        // create post
        const stakeAmount = 100;

        await expect(casinoPlatform.createBettingPost(0, 0, 0, {value: stakeAmount})).not.to.be.reverted;
        
        expect(await casinoPlatform.nBetting()).to.equals(1);
        expect(await casinoPlatform.getStakeInPostByUserAddress(0, owner.address)).to.equals(stakeAmount);
    });
});
