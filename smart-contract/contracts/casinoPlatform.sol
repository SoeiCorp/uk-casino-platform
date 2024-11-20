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
		nMatch = 0;
    }
	
	function getActiveMatchSortByLatest(uint256 nData, uint256 pageNumber) public view returns (Match[] memory activeMatches, bool success, bool haveMorePageAvailable) {
		uint256 startIndex;
		uint256 endIndex;
		// pageNumber start with 0
		// startIndex = nMatch - (pageNumber * nData) - 1
		// endIndex = startIndex + 1 - nData

		bool startIndexWillBeLowerThanZero = pageNumber * nData + 1 > nMatch;
		if (startIndexWillBeLowerThanZero) {
			success = false;
			haveMorePageAvailable = false;
			return (activeMatches, success, haveMorePageAvailable);
		}

		startIndex = nMatch - (pageNumber * nData) - 1;

		bool dataAvailableOnThisPageisLessThanNData = nData > startIndex + 1;
		if (dataAvailableOnThisPageisLessThanNData) {
			endIndex = 0;
		} else {
			endIndex = startIndex + 1 - nData;
		}

		uint256 nDataToReturn = startIndex - endIndex + 1;
		activeMatches = new Match[](nDataToReturn);

		for (uint256 i = startIndex; i >= endIndex; i--) {
			uint256 j = startIndex - i;

			activeMatches[j] = Matches[i];
		}

		success = true;
		haveMorePageAvailable = endIndex > 0;

		return (activeMatches, success, haveMorePageAvailable);
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

	function playerClaimBettingReward(uint256 postId) public returns (bool) {
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

    function createBettingPost(uint256 matchId, uint32 homeHandicapScore, uint32 awayHandicapScore) public payable returns (uint256 newPostId) {
		require(Matches[matchId].isInitialized, "matchId not existed");
		require(!Matches[matchId].isFinished, "the match is alreay finished");

		BettingPosts[nBetting].id = nBetting;

		BettingPosts[nBetting].matchId = matchId;
		BettingPosts[nBetting].homeHandicapScore = homeHandicapScore;
		BettingPosts[nBetting].awayHandicapScore = awayHandicapScore;
		BettingPosts[nBetting].bankerStake[msg.sender] = msg.value;
		BettingPosts[nBetting].totalStake = msg.value;
		BettingPosts[nBetting].isInitialized = true;
		BettingPosts[nBetting].totalBet.isInitialized = true;

		Matches[matchId].bettingPostIds.push(BettingPosts[nBetting].id);

		nBetting += 1;

		return BettingPosts[nBetting].id;
	}

	function contributeToBettingPost(uint256 postId) public payable returns (bool success) {
		require(!Matches[BettingPosts[postId].matchId].isFinished, "match already finished");

		BettingPosts[postId].bankerStake[msg.sender] += msg.value;
		BettingPosts[postId].totalStake += msg.value;

		success = true;

		return success;
	}

	function createMatch(string calldata home, string calldata away) public onlyOwner returns (uint256) {
		Matches[nMatch].id = nMatch;
		Matches[nMatch].home = home;
		Matches[nMatch].away = away;
		Matches[nMatch].isFinished = false;
		Matches[nMatch].isInitialized = true;

		nMatch += 1;

		return Matches[nMatch].id;
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