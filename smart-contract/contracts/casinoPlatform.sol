// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "./ownable.sol";

struct Match {
	bytes32 id;
	string home;
	string away;
	uint32 homeScore;
	uint32 awayScore;
	bool isFinished;
}

struct Bet {
	uint256 homeBet;
	uint256 awayBet;
}

struct Post {
	bytes32 id;
	bytes32 matchId;
	address[] bankers;
	uint32 homeHandicapScore;
	uint32 awayHandicapScore;
	mapping(address => uint256) bankerStake;
	uint256 totalStake;
	mapping(address => Bet) playerBet;
	Bet totalBet;
}

contract CasinoPlatform is Ownable {
    Match[] Matches;
    Post[] BettingPosts;

    constructor() {

    }

    
}