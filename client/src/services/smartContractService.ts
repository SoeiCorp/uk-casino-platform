import { ethers } from "ethers";
import { PaginatedResponse, Match, Post, } from "@/types/betting";

class SmartContractService {
  private contractOwner: string | null = null;
  private contract: ethers.Contract | null = null;

  // Ensure the contract is initialized before making any calls to it
  private async initialize(): Promise<void> {
    if (this.contract) return; // If already initialized, skip re-initialization
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(
        "0x0793C3C32Ae8bBEfF73348117de9EEF87018484c", // Contract address
        [
          "function getOwner() view returns (address)",
          "function createMatch(string memory home, string memory away) external",
          "function placeBet(uint256 matchId) external payable",
          "function getMatches() external view returns (tuple(uint256 id, string home, string away, uint256 startTime, bool isActive)[])",
          "function getBetsByAddress(address better) external view returns (tuple(uint256 matchId, uint256 amount, uint256 timestamp)[])",
          "function claimBettingReward(uint256 postId) external",
          "function makeABet(uint256 postId, bool isHomeBet) external payable",
          "function getPostsIBetInWithPagination(uint256 nData, uint256 pageNumber) view returns (tuple(uint256,uint256,uint32,uint32,uint256,uint256,tuple(uint256,uint256,bool,bool),tuple(uint256,uint256,bool,bool),bool,bool, bool, bool, bool, string, string)[] memory posts, bool success, bool haveMorePageAvailable)",
          "function getMyBettingPostsAsBankerWithPagination(uint256 nData, uint256 pageNumber) view returns (tuple(uint256,uint256,uint32,uint32,uint256,uint256,tuple(uint256,uint256,bool,bool),tuple(uint256,uint256,bool,bool),bool,bool,bool, bool, bool, string, string)[] memory posts, bool success, bool haveMorePageAvailable)",
          "function getPostsByMatchIdSortByLatestWithPagination(uint256 matchId, uint256 nData, uint256 pageNumber) view returns (tuple(uint256,uint256,uint32,uint32,uint256,uint256,tuple(uint256,uint256,bool,bool),tuple(uint256,uint256,bool,bool),bool,bool,bool, bool, bool, string, string)[] memory posts, bool success, bool haveMorePageAvailable)",
          "function getActiveMatchSortByLatestWithPagination(uint256 nData, uint256 pageNumber) view returns (tuple(uint256,string,string,uint32,uint32,bool,bool,uint256)[] memory activeMatches, bool success, bool haveMorePageAvailable)",
          "function getStakeInPostByUserAddress(uint256 postId, address user) view returns (uint256)",
          "function finishMatch(uint256 matchId, uint32 homeScore, uint32 awayScore) external returns (bool)",
          "function playerClaimBettingReward(uint256 postId) external returns (bool)",
          "function createBettingPost(uint256 matchId, uint32 homeHandicapScore, uint32 awayHandicapScore) external payable returns (uint256 newPostId)",
          "function contributeToBettingPost(uint256 postId) external payable returns (bool)",
          "function bankerClaimReward(uint256 postId) external returns (bool)",
        ],
        signer,
      );
      console.log("Contract initialized successfully");
    } catch (error) {
      console.error("Error initializing contract:", error);
      throw error;
    }
  }

  // Fetch the contract owner
  async getContractOwner(): Promise<string> {
    if (this.contractOwner) return this.contractOwner;

    try {
      await this.initialize(); // Ensure contract is initialized
      const owner = await this.contract?.getOwner();
      this.contractOwner = owner;
      console.log("Contract owner fetched:", this.contractOwner);
      return this.contractOwner;
    } catch (error) {
      console.error("Error getting contract owner:", error);
      throw error;
    }
  }

  // Fetch active matches with pagination
  async getActiveMatches(
    pageSize: number,
    pageNumber: number,
  ): Promise<PaginatedResponse<Match>> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const result =
        await this.contract?.getActiveMatchSortByLatestWithPagination(
          pageSize,
          pageNumber,
        );
      return {
        data: result.activeMatches,
        success: result.success,
        haveMorePageAvailable: result.haveMorePageAvailable,
      };
    } catch (error) {
      console.error("Error fetching active matches:", error);
      throw error;
    }
  }

  // Fetch posts by match ID with pagination
  async getPostsByMatchId(
    matchId: number,
    pageSize: number,
    pageNumber: number,
  ): Promise<PaginatedResponse<Post>> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const result =
        await this.contract?.getPostsByMatchIdSortByLatestWithPagination(
          matchId,
          pageSize,
          pageNumber,
        );
      return {
        data: result.posts,
        success: result.success,
        haveMorePageAvailable: result.haveMorePageAvailable,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }

  // Create a betting post
  async createBettingPost(
    matchId: number,
    homeHandicap: number,
    awayHandicap: number,
    amount: string,
  ): Promise<number> {
    try {
      await this.initialize(); // Ensure contract is initialized

      const tx = await this.contract?.createBettingPost(
        matchId,
        homeHandicap,
        awayHandicap,
        { value: ethers.parseEther(amount) },
      );

      const receipt = await tx.wait();
      console.log("Betting post created:", receipt);
      return receipt.status; // You can return any relevant value from receipt
    } catch (error) {
      console.error("Error creating betting post:", error);
      throw error;
    }
  }

  // Claim betting reward
  async claimBettingReward(postId: number): Promise<boolean> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const tx = await this.contract?.playerClaimBettingReward(postId);
      const receipt = await tx.wait();
      return receipt.status === 1; // Return success status
    } catch (error) {
      console.error("Error claiming reward:", error);
      throw error;
    }
  }

  // Make a bet
  async makeABet(
    postId: number,
    isHomeBet: boolean,
    amount: string,
  ): Promise<boolean> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const tx = await this.contract?.makeABet(postId, isHomeBet, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt.status === 1; // Return success status
    } catch (error) {
      console.error("Error making bet:", error);
      throw error;
    }
  }

  // Check if the user is an admin
  async isAdmin(address: string): Promise<boolean> {
    try {
      const owner = await this.getContractOwner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Create a match
  async createMatch(home: string, away: string): Promise<void> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const tx = await this.contract?.createMatch(home, away);
      await tx.wait();
      console.log("Match created successfully");
    } catch (error) {
      console.error("Error creating match:", error);
      throw error;
    }
  }

  // Place a bet
  async placeBet(matchId: string, amount: string): Promise<void> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const tx = await this.contract?.placeBet(matchId, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      console.log("Bet placed successfully");
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  }

  // Get matches
  async getMatches(): Promise<any[]> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const matches = await this.contract?.getMatches();
      return matches;
    } catch (error) {
      console.error("Error getting matches:", error);
      throw error;
    }
  }

  // Get bets by address
  async getBets(address: string): Promise<any[]> {
    try {
      await this.initialize(); // Ensure contract is initialized
      const bets = await this.contract?.getBetsByAddress(address);
      return bets;
    } catch (error) {
      console.error("Error getting bets:", error);
      throw error;
    }
  }

  async contributeToBettingPost(
    postId: number,
    amount: string,
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const tx = await this.contract.contributeToBettingPost(postId, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt.status === 1;
    } catch (error) {
      console.error("Error contributing to betting post:", error);
      throw error;
    }
  }

  async getStakeInPost(postId: number, userAddress: string): Promise<string> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const stake = await this.contract.getStakeInPostByUserAddress(
        postId,
        userAddress,
      );
      return ethers.formatEther(stake.toString());
    } catch (error) {
      console.error("Error getting stake:", error);
      throw error;
    }
  }

  async finishMatch(
    matchId: number,
    homeScore: number,
    awayScore: number,
  ): Promise<boolean> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const tx = await this.contract.finishMatch(matchId, homeScore, awayScore);
      const receipt = await tx.wait();
      return receipt.status === 1;
    } catch (error) {
      console.error("Error finishing match:", error);
      throw error;
    }
  }

  async getMyBettingPostsAsBanker(
    pageSize: number,
    pageNumber: number,
  ): Promise<PaginatedResponse<Post>> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const result =
        await this.contract.getMyBettingPostsAsBankerWithPagination(
          pageSize,
          pageNumber,
        );
      return {
        data: result.posts,
        success: result.success,
        haveMorePageAvailable: result.haveMorePageAvailable,
      };
    } catch (error) {
      console.error("Error fetching betting posts as banker:", error);
      throw error;
    }
  }

  async getPostsIBetIn(
    pageSize: number,
    pageNumber: number,
  ): Promise<PaginatedResponse<Post>> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const result = await this.contract.getPostsIBetInWithPagination(
        pageSize,
        pageNumber,
      );
      return {
        data: result.posts,
        success: result.success,
        haveMorePageAvailable: result.haveMorePageAvailable,
      };
    } catch (error) {
      console.error("Error fetching posts I bet in:", error);
      throw error;
    }
  }

  async bankerClaimReward(postId: number): Promise<boolean> {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const tx = await this.contract.bankerClaimReward(postId);
      const receipt = await tx.wait();
      return receipt.status === 1;
    } catch (error) {
      console.error("Error claiming banker reward:", error);
      throw error;
    }
  }
}

export const smartContractService = new SmartContractService();
