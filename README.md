# UK Casino Platform

This is the UK Web3 casino platform PoC, a part of the blockchain class final project.

## Problem

United Kingdom casinos are legal, however, gambling is inherently built on trust. Do you trust the person you make a bet with? Key issues include:
1. Lack of Trust: In typical gambling platforms, both parties (players and bankers) must rely on the operator or a centralized entity to handle bets and payouts fairly. However, the history of online gambling is rife with examples of manipulation and opaque processes.
2. Fraud & Manipulation: There’s always a risk that one party (or the platform itself) may engage in fraudulent behavior, altering the bet outcomes, and delaying or withholding payments.
3. Opaque Processes: Many online casinos do not offer transparency into how bets are managed or how results are calculated. Users are left with little control and no insight into the mechanics of the game.

## What we do

We need to prove that the zero-trust online casino platform in the UK is achievable. We create a decentralized online casino platform where trust and transparency are embedded in the system itself. By utilizing blockchain technology and smart contracts, we provide a platform for both bankers (bet creators) and players (bet participants) to engage in trustless betting.

## Why Blockchain

Can a traditional database technology meet our needs?
- No, because we need a smart contract to prevent fraud and deception.

Does more than one participant need to be able to update the data?
- Yes, because bankers and players should make a deal or accept it based on their preferences.

Do we and all those updaters trust one another?
- No, because it is gambling. The bankers and players might not trust whether the other side will pay.

Would all the participants trust a third party?
- No, because a third party might deceive everyone, we need to implement a zero-trust platform for gambling.

Does the data need to be kept private?
- No, because it does not contain any personal information, and it should be shown for transparency.

Do we need to control who can make changes to the blockchain software?
- No, there's no need to make any change to the blockchain software. Any blockchain-supporting smart contracts can be used such as Ethereum.

## Use Case

1. Creating a bet
   - A banker initiates a bet by defining the parameters (e.g., type of game, amount wagered).
    - The bet is published, and potential players can see the terms and choose whether to participate.
2. Banker Contributing a Bet:
    - A banker views bets initiated by other bankers on the platform.
    - The banker can manually join the bet by contributing funds, which increases the total pool of that bet.
    - This use case ensures that anyone can become a banker without having a lot of money.
3. Making a Bet:
    - A player views available bets on the platform and makes one based on the terms.
    - By interacting with the smart contract, the player locks their wager in the contract.
    - Once the bet is accepted, the game or event associated with the bet takes place, and the results are generated.
4.  Resolving a Bet:
    - Once the game/event concludes, the smart contract automatically calculates the result.
    - The winnings are distributed based on the contract’s predefined conditions, without requiring intervention from any central party.

## Activity Flow

1. Banker’s Role:
    - Creates and deploys a bet via the platform's smart contract interface.
    - Can manually join another banker’s bet by contributing funds to increase the pool.
    - Sets the bet conditions (e.g., type of game, amount wagered).
    - Waits for players to accept the bet.
2. Player’s Role:
    - Views the list of available bets.
    - Selects and make a bet that suits their preferences.
    - Locks the wager amount into the contract.
3. Smart Contract:
    - Manages the betting process: verifying terms, locking wagers, calculating outcomes, and distributing payouts.

## Project Roadmap

Phase 1: **Initial Betting System**  
	Launch the platform with a simple sports betting system, where bankers can create win/lose bets for individual sports events. Players can make bets.

Phase 2: **Collaborative Bankers**  
	Introduce a feature allowing individual bankers to pool funds, enabling collaboration and larger betting pools for increased liquidity and risk-sharing.

Phase 3: **Adjustable Betting Odds**  
	Implement the ability for bankers to set and adjust betting odds, adding flexibility and market-driven dynamics to the betting process.

Phase 4: **Expanded Betting Features with Verifiable Randomness**  
	Introduce betting on random events such as high-low, pseudo-lottery, and baccarat, backed by a trusted source of randomness to ensure fairness and transparency.

Phase 5: **Generalized Betting Options**  
	Expand the platform to allow users to create and participate in bets on a wide range of events, giving them the freedom to bet on virtually anything, further enhancing engagement and flexibility.

## Infrastructure

We use Ethereum Sepolia Testnet as a network for deploying our smart contract. Ethereum is a chain that is easy to use, and we have a lot of faucets (and our spare SepoliaETH from the midterm exam part A).

In the folder `smart-contract`, there are several important files/folders you need to know:

1. `.env` file that you need to fill with data corresponding to `.env.example` file.
2. `/contracts`, which contains `casinoPlatform.sol` file — the main application logic.
3. `/ignition`, which involves compile and build.

To redeploy the smart contract, you can run the following commands in your terminal:
```bash
cd smart-contract
```
```bash
npx hardhat compile
```

```bash
npx hardhat ignition deploy ./ignition/modules/CasinoPlatform.ts --network sepolia
```

Make sure you have enough funds in your Metamask wallet.

## Application

We use React as our frontend framework because of the team's familiarity with it.

In the folder `/client`, there are several folders/files that are important:

1. `.env` file
2. `Dockerfile` and `docker-compose.yml` file, which are used to run a container
3. `/public`, which contains resources (e.g., images)
4. `/src`, which contains all frontend code

To run our frontend, there are two methods:
### Method 1: Using Docker
```bash
cd client
```
```bash
docker-compose up --build
```

### Method 2: Using npm
``` bash
cd client
```
```bash
npm run build
```

```bash
npm run preview
```

