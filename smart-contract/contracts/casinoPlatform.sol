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
	bool isClaimed;
	bool isInitialized;
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

		return true;
	}

	function claimBettingReward(uint256 postId) public returns (bool) {
		Post storage thePost = BettingPosts[postId];
		Match storage theMatch = Matches[thePost.matchId];
		
		require(thePost.isInitialized, "betting post not found");
		require(theMatch.isFinished, "match is not finished");
		require(!thePost.playerBet[msg.sender].isClaimed, "reward already claimed");

		thePost.playerBet[msg.sender].isClaimed = true;

		uint32 homeScoreWithHandicap = theMatch.homeScore + thePost.homeHandicapScore;
		uint32 awayScoreWithHandicap = theMatch.awayScore + thePost.awayHandicapScore;

		if (homeScoreWithHandicap > awayScoreWithHandicap) {
			uint256 balanceToSend = thePost.playerBet[msg.sender].homeBet * 2;
			_transfer(msg.sender, balanceToSend);

			return true;
		} else if (homeScoreWithHandicap < awayScoreWithHandicap) {
			uint256 balanceToSend = thePost.playerBet[msg.sender].awayBet * 2;
			_transfer(msg.sender, balanceToSend);

			return true;
		}

		// send back ether for all bets because there's no winner
		_transfer(msg.sender, thePost.playerBet[msg.sender].homeBet);
		_transfer(msg.sender, thePost.playerBet[msg.sender].awayBet);

		return true;
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
		newPost.totalBet.isInitialized = true;

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
		require(BettingPosts[postId].isInitialized, "post not exist");
		require(isValidBet(BettingPosts[postId], isHomeBet, msg.value), "bet not valid");
		require(!Matches[BettingPosts[postId].matchId].isFinished, "match already finished");
		require(BettingPosts[postId].playerBet[msg.sender].isInitialized, "you already make a bet on this post");

		if (isHomeBet) {
			BettingPosts[postId].playerBet[msg.sender].homeBet = msg.value;
			BettingPosts[postId].playerBet[msg.sender].awayBet = 0;

			BettingPosts[postId].totalBet.homeBet += msg.value;
		} else {
			BettingPosts[postId].playerBet[msg.sender].awayBet = msg.value;
			BettingPosts[postId].playerBet[msg.sender].homeBet = 0;

			BettingPosts[postId].totalBet.awayBet += msg.value;
		}

		BettingPosts[postId].playerBet[msg.sender].isClaimed = false;
		BettingPosts[postId].playerBet[msg.sender].isInitialized = true;

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