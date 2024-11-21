export type BetStatus = 'open' | 'in_progress' | 'resolved' | 'claimed';
export type GameType = 'sports' | 'dice' | 'cards';
export type BetResult = 'win' | 'lose' | 'draw' | null;

export interface Participant {
  address: string;
  amount: string;
  timestamp: number;
}

export interface Bet {
  id: string;
  gameType: GameType;
  wagerAmount: string;
  poolLimit: string;
  description: string;
  banker: string;
  currentPool: string;
  remainingPool: string;
  players: Participant[];
  contributors: Participant[];
  status: BetStatus;
  result?: BetResult;
  createdAt: number;
  resolvedAt?: number;
}

export interface SmartContractBet {
  betId: string;
  gameType: number;
  wagerAmount: bigint;
  poolLimit: bigint;
  description: string;
  banker: string;
  currentPool: bigint;
  remainingPool: bigint;
  status: number;
  result?: number;
}