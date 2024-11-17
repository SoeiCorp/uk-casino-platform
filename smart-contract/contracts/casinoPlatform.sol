// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./ownable.sol";

struct Match {
	uint256 id;
	string home;
	string away;
	uint32 homeScore;
	uint32 awayScore;
	bool isFinished;
	bool isInitialized;
	uint256[] bettingPostIds;
}

struct Bet {
	uint256 homeBet;
	uint256 awayBet;
}

struct Post {
	uint256 id;
	uint256 matchId;
	address[] bankers;
	uint32 homeHandicapScore;
	uint32 awayHandicapScore;
	mapping(address => uint256) bankerStake;
	uint256 totalStake;
	mapping(address => Bet) playerBet;
	Bet totalBet;
	bool isInitialized;
}

contract CasinoPlatform is Ownable {
	uint256 public nBetting;
	uint256 public nMatch;

    mapping(uint256 => Match) Matches;
    mapping(uint256 => Post) BettingPosts;

    constructor() {
		nBetting = 0;
    }
	

	function getStakeInPostByUserAddress(uint256 postId, address user) public view returns (uint256) {
		return BettingPosts[postId].bankerStake[user];
	}

	function finishMatch(uint256 matchId, uint32 homeScore, uint32 awayScore) public onlyOwner returns (bool) {
		Matches[matchId].homeScore = homeScore;
		Matches[matchId].awayScore = awayScore;
		Matches[matchId].isFinished = true;

		for (uint256 i=0; i < Matches[matchId].bettingPostIds.length; i++) {
			resolveBettingPost(Matches[matchId].bettingPostIds[i]);
		}

		return true;
	}

	function resolveBettingPost(uint256 postId) private returns (bool) {
		return false;
	}

    function createBettingPost(uint256 matchId, uint32 homeHandicapScore, uint32 awayHandicapScore) public payable returns (uint256) {
		require(Matches[matchId].isInitialized, "matchId not existed");
		require(!Matches[matchId].isFinished, "the match is alreay finished");

		Post storage newPost = BettingPosts[nBetting];

		newPost.id = nBetting;
		nBetting += 1;

		newPost.matchId = matchId;
		newPost.bankers.push(msg.sender);
		newPost.homeHandicapScore = homeHandicapScore;
		newPost.awayHandicapScore = awayHandicapScore;
		newPost.bankerStake[msg.sender] = msg.value;
		newPost.totalStake = msg.value;
		newPost.isInitialized = true;

		Matches[matchId].bettingPostIds.push(newPost.id);

		return newPost.id;
	}

	function createMatch(string calldata home, string calldata away) public onlyOwner returns (uint256) {
		Match storage newMatch = Matches[nMatch];

		newMatch.id = nMatch;
		nMatch += 1;

		newMatch.home = home;
		newMatch.away = away;
		newMatch.isFinished = false;
		newMatch.isInitialized = true;

		return newMatch.id;
	}

	function makeABet(uint256 postId, bool isHomeBet) public payable returns (bool) {
		Post storage bettingPost = BettingPosts[postId];

		bool postExisted = bettingPost.isInitialized;
		require(postExisted, "post not exist");
		require(isValidBet(bettingPost, isHomeBet, msg.value), "bet not valid");

		if (isHomeBet) {
			bettingPost.playerBet[msg.sender].homeBet = msg.value;
			bettingPost.playerBet[msg.sender].awayBet = 0;

			bettingPost.totalBet.homeBet += msg.value;
		} else {
			bettingPost.playerBet[msg.sender].awayBet = msg.value;
			bettingPost.playerBet[msg.sender].homeBet = 0;

			bettingPost.totalBet.awayBet += msg.value;
		}

		return true;
	}

	function isValidBet(Post storage bettingPost, bool isHomeBet, uint256 value) private view returns (bool) {
		uint256 totalFutureHomeBet = bettingPost.totalBet.homeBet;
		uint256 totalFutureAwayBet = bettingPost.totalBet.awayBet;

		if (isHomeBet) {
			totalFutureHomeBet += value;
		} else {
			totalFutureAwayBet += value;
		}

		uint256 biggerSideBet;
		uint256 smallerSideBet;

		if (totalFutureHomeBet > totalFutureAwayBet) {
			biggerSideBet = totalFutureHomeBet;
			smallerSideBet = totalFutureAwayBet;
		} else {
			biggerSideBet = totalFutureAwayBet;
			smallerSideBet = totalFutureHomeBet;
		}

		uint256 diff = biggerSideBet - smallerSideBet;

		if (diff > bettingPost.totalStake) {
			return false;
		}

		return true;
	}

	function _transfer(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}(new bytes(0));
        if (!success) {
            revert("transfer error");
        }
    }
}