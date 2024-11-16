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

    function createBettingPost(uint256 matchId, uint32 homeHandicapScore, uint32 awayHandicapScore) public payable returns (uint256) {
		bool matchExisted = Matches[matchId].isInitialized;
		
		require(matchExisted, "matchId not existed");

		Post storage newPost = BettingPosts[nBetting];

		newPost.id = nBetting;
		nBetting += 1;

		newPost.matchId = matchId;
		newPost.bankers.push(msg.sender);
		newPost.homeHandicapScore = homeHandicapScore;
		newPost.awayHandicapScore = awayHandicapScore;
		newPost.bankerStake[msg.sender] = msg.value;
		newPost.totalStake = msg.value;

		return newPost.id;
	}

	function createMatch(string calldata home, string calldata away) public onlyOwner returns (uint256) {
		Match storage newMatch = Matches[nMatch];

		newMatch.id = nMatch;
		nMatch += 1;

		newMatch.home = home;
		newMatch.away = away;
		newMatch.isInitialized = true;

		return newMatch.id;
	}
}