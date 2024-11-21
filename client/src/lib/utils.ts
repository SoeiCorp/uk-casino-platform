import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformBetting(betData: any) {
  const parsedData = Array.from(betData);

  return {
    homeBet: parsedData[0],
    awayBet: parsedData[1],
    isClaimed: parsedData[2],
    isInitialized: parsedData[3],
  }
}

export function transformPostView(betData: any, isForBankerView: boolean = false) {

  return {
    id: betData[0].toString(), // Convert BigInt to string
    matchId: betData[1].toString(),
    homeHandicapScore: Number(betData[2]), // Convert to number if needed
    awayHandicapScore: Number(betData[3]),
    totalStake: Number(betData[4]), // Convert BigInt to number
    myStake: Number(betData[5]),
    totalBet: transformBetting(betData[6]), // Assuming this is a custom object, handle accordingly
    myBet: transformBetting(betData[7]), // Handle similarly to totalBet
    isInitialized: betData[8],
    isFinished: betData[9],
    isAlreadyMadeABet: betData[10],
    playerRewardClaimed: betData[11],
    bankerRewardClaimed: betData[12],
    home: betData[13],
    away: betData[14],
    status: betData[8] && !betData[9] ? 'ACTIVE' : betData[8] && betData[9] && ((betData[12] && isForBankerView) || (betData[11] && !isForBankerView)) ? 'CLAIMED' : 'NOT_CLAIMED',
  };
}