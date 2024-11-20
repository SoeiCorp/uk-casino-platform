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
	uint256 timeLimit;
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
	mapping(address => bool) bankerClaimedReward;
	uint256 totalStake;
	mapping(address => Bet) playerBet;
	Bet totalBet;
	bool isInitialized;
}

struct PostView {
	uint256 id;
	uint256 matchId;
	uint32 homeHandicapScore;
	uint32 awayHandicapScore;
	uint256 totalStake;
	uint256 myStake;
	Bet totalBet;
	Bet myBet;
	bool isInitialized;
	bool isFinished;
	bool isAlreadyMadeABet;
}

struct MatchView {
	uint256 id;
	string home;
	string away;
	uint32 homeScore;
	uint32 awayScore;
	bool isFinished;
	bool isInitialized;
	uint256 nPosts;
}

uint256 constant MATCH_TIME_LIMIT = 60 * 60 * 24 * 10; // unit is in seconds and this is equal to 10 days

contract CasinoPlatform is Ownable {
	uint256 public nBetting;
	uint256 public nMatch;

    mapping(uint256 => Match) Matches;
    mapping(uint256 => Post) BettingPosts;
	mapping(address => uint256[]) PlayerBettingPostIds;
	mapping(address => uint256[]) BankerBettingPostIds;

    constructor() {
		nBetting = 0;
		nMatch = 0;
    }

	function getPostsIBetInWithPagination(uint256 nData, uint256 pageNumber) public view returns (PostView[] memory posts, bool success, bool haveMorePageAvailable) {
		uint256[] storage postIds = PlayerBettingPostIds[msg.sender];

		return _getPostsByIdsWithPagination(postIds, nData, pageNumber);
	}

	function getMyBettingPostsAsBankerWithPagination(uint256 nData, uint256 pageNumber) public view returns (PostView[] memory posts, bool success, bool haveMorePageAvailable) {
		uint256[] storage postIds = BankerBettingPostIds[msg.sender];

		return _getPostsByIdsWithPagination(postIds, nData, pageNumber);
	}

	function getPostsByMatchIdSortByLatestWithPagination(uint256 matchId, uint256 nData, uint256 pageNumber) public view returns (PostView[] memory posts, bool success, bool haveMorePageAvailable) {
		uint256[] storage postIds = Matches[matchId].bettingPostIds;

		return _getPostsByIdsWithPagination(postIds, nData, pageNumber);
	}
	
	function getActiveMatchSortByLatestWithPagination(uint256 nData, uint256 pageNumber) public view returns (MatchView[] memory activeMatches, bool success, bool haveMorePageAvailable) {
		uint256 startIndex;
		uint256 endIndex;

		(startIndex, endIndex, success, haveMorePageAvailable) = _getPaginationStartEndIndex(nMatch, nData, pageNumber);

		if (!success) {
			return (activeMatches, success, haveMorePageAvailable);
		}
		
		uint256 nDataToReturn = startIndex - endIndex + 1;
		activeMatches = new MatchView[](nDataToReturn);


		for (uint256 i = startIndex; i >= endIndex; i--) {
			uint256 j = startIndex - i;

			activeMatches[j].id = Matches[i].id;
			activeMatches[j].home = Matches[i].home;
			activeMatches[j].away = Matches[i].away;
			activeMatches[j].homeScore = Matches[i].homeScore;
			activeMatches[j].awayScore = Matches[i].awayScore;
			activeMatches[j].isFinished = Matches[i].isFinished;
			activeMatches[j].isInitialized = Matches[i].isInitialized;
			activeMatches[j].nPosts = Matches[i].bettingPostIds.length;

			if (i == 0) {
				break;
			}
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

	function bankerClaimReward(uint256 postId) public returns (bool) {
		Post storage thePost = BettingPosts[postId];
		Match storage theMatch = Matches[thePost.matchId];
		
		require(thePost.isInitialized, "betting post not found");
		require(!thePost.bankerClaimedReward[msg.sender], "reward already claimed");

		uint256 balanceToSend;

		// allow banker to pull out money when the chainlink is not updating
		if (theMatch.timeLimit <= block.timestamp) {
			BettingPosts[postId].bankerClaimedReward[msg.sender] = true;

			balanceToSend = BettingPosts[postId].bankerStake[msg.sender];

			_transfer(msg.sender, balanceToSend);

			return true;
		}

		require(theMatch.isFinished, "match is not finished");

		// banker_reward = total_banker_reward * banker_stake / total_stake
		// total_banker_reward = total_banker_stake + total_bet(both home and away combined) - total_player_win

		uint256 totalPlayerWin;

		uint32 homeScoreWithHandicap = theMatch.homeScore + thePost.homeHandicapScore;
		uint32 awayScoreWithHandicap = theMatch.awayScore + thePost.awayHandicapScore;

		if (homeScoreWithHandicap > awayScoreWithHandicap) {
			totalPlayerWin = thePost.totalBet.homeBet * 2;
		} else if (homeScoreWithHandicap < awayScoreWithHandicap) {
			totalPlayerWin = thePost.totalBet.awayBet * 2;
		}

		uint256 totalBankerReward = thePost.totalStake + thePost.totalBet.homeBet + thePost.totalBet.awayBet - totalPlayerWin;

		uint256 theBankerReward = totalBankerReward * BettingPosts[postId].bankerStake[msg.sender] / BettingPosts[postId].totalStake;

		balanceToSend = theBankerReward;

		_transfer(msg.sender, balanceToSend);

		return true;
	}

	function playerClaimBettingReward(uint256 postId) public returns (bool) {
		Post storage thePost = BettingPosts[postId];
		Match storage theMatch = Matches[thePost.matchId];
		
		require(thePost.isInitialized, "betting post not found");
		require(!thePost.playerBet[msg.sender].isClaimed, "reward already claimed");

		// allow players to pull out money when the chainlink is not updating
		if (theMatch.timeLimit <= block.timestamp) {
			BettingPosts[postId].playerBet[msg.sender].isClaimed = true;

			uint256 balanceToSend = thePost.playerBet[msg.sender].homeBet + thePost.playerBet[msg.sender].awayBet;
			_transfer(msg.sender, balanceToSend);

			return true;
		}

		require(theMatch.isFinished, "match is not finished");

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

		BankerBettingPostIds[msg.sender].push(BettingPosts[nBetting].id);

		nBetting += 1;

		return BettingPosts[nBetting].id;
	}

	function contributeToBettingPost(uint256 postId) public payable returns (bool success) {
		require(!Matches[BettingPosts[postId].matchId].isFinished, "match already finished");

		BettingPosts[postId].bankerStake[msg.sender] += msg.value;
		BettingPosts[postId].totalStake += msg.value;

		BankerBettingPostIds[msg.sender].push(BettingPosts[nBetting].id);

		success = true;

		return success;
	}

	function createMatch(string calldata home, string calldata away) public onlyOwner returns (uint256) {
		Matches[nMatch].id = nMatch;
		Matches[nMatch].home = home;
		Matches[nMatch].away = away;
		Matches[nMatch].isFinished = false;
		Matches[nMatch].isInitialized = true;

		Matches[nMatch].timeLimit = block.timestamp + MATCH_TIME_LIMIT;

		nMatch += 1;

		return Matches[nMatch].id;
	}

	function makeABet(uint256 postId, bool isHomeBet) public payable returns (bool) {
		require(BettingPosts[postId].isInitialized, "post not exist");
		require(isValidBet(BettingPosts[postId], isHomeBet, msg.value), "bet not valid");
		require(!Matches[BettingPosts[postId].matchId].isFinished, "match already finished");
		require(!BettingPosts[postId].playerBet[msg.sender].isInitialized, "you already make a bet on this post");

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

		PlayerBettingPostIds[msg.sender].push(postId);

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

	function _getPaginationStartEndIndex(uint256 nAllData, uint nDataWant, uint256 pageNumber) internal pure returns (uint256 startIndex, uint256 endIndex, bool success, bool haveMorePageAvailable) {
		// pageNumber start with 0
		// startIndex = nMatch - (pageNumber * nData) - 1
		// endIndex = startIndex + 1 - nData

		bool startIndexWillBeLowerThanZero = pageNumber * nDataWant + 1 > nAllData;
		if (startIndexWillBeLowerThanZero) {
			success = false;
			haveMorePageAvailable = false;
			return (startIndex, endIndex, success, haveMorePageAvailable);
		}

		startIndex = nAllData - (pageNumber * nDataWant) - 1;

		bool dataAvailableOnThisPageisLessThanNData = nDataWant > startIndex + 1;
		if (dataAvailableOnThisPageisLessThanNData) {
			endIndex = 0;
		} else {
			endIndex = startIndex + 1 - nDataWant;
		}

		haveMorePageAvailable = endIndex > 0;

		success = true;

		return (startIndex, endIndex, success, haveMorePageAvailable);
	}

	function _getPostsByIdsWithPagination(uint256[] memory postIds, uint256 nData, uint256 pageNumber) internal view returns (PostView[] memory posts, bool success, bool haveMorePageAvailable) {
		uint256 startIndex;
		uint256 endIndex;

		(startIndex, endIndex, success, haveMorePageAvailable) = _getPaginationStartEndIndex(postIds.length, nData, pageNumber);

		if (!success) {
			return (posts, success, haveMorePageAvailable);
		}

		uint256 nDataToReturn = startIndex - endIndex + 1;
		posts = new PostView[](nDataToReturn);

		for (uint256 i = startIndex; i >= endIndex; i--) {
			uint256 j = startIndex - i;

			posts[j].id = BettingPosts[postIds[i]].id;
			posts[j].matchId = BettingPosts[postIds[i]].matchId;
			posts[j].homeHandicapScore = BettingPosts[postIds[i]].homeHandicapScore;
			posts[j].awayHandicapScore = BettingPosts[postIds[i]].awayHandicapScore;
			posts[j].totalStake = BettingPosts[postIds[i]].totalStake;
			posts[j].totalBet = BettingPosts[postIds[i]].totalBet;
			posts[j].isInitialized = BettingPosts[postIds[i]].isInitialized;
			posts[j].isFinished = Matches[BettingPosts[postIds[i]].matchId].isFinished;
			posts[j].isAlreadyMadeABet = BettingPosts[postIds[i]].playerBet[msg.sender].isInitialized;
			posts[j].myStake = BettingPosts[postIds[i]].bankerStake[msg.sender];
			posts[j].myBet.homeBet = BettingPosts[postIds[i]].playerBet[msg.sender].homeBet;
			posts[j].myBet.awayBet = BettingPosts[postIds[i]].playerBet[msg.sender].awayBet;

			if (i == 0) {
				break;
			}
		}

		success = true;

		return (posts, success, haveMorePageAvailable);
	}
}