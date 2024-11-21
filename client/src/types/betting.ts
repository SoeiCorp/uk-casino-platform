export interface Match {
  id: number;
  home: string;
  away: string;
  isActive: boolean;
  createdAt: number;
}

export interface Post {
  id: number;
  matchId: number;
  creator: string;
  homeHandicap: number;
  awayHandicap: number;
  totalStake: string;
  homeBets: string;
  awayBets: string;
  maxBetAvailable: string;
  isResolved: boolean;
  isClaimed: boolean;
  winner?: 'home' | 'away' | 'draw';
}

export interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  haveMorePageAvailable: boolean;
}