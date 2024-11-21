import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Coins, Users, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { BetActions } from "./BetActions";

export const BetCard = ({ bet }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{bet.home} vs {bet.away}</h3>
            {/* <p className="text-sm text-secondary">Created by: {bet.creator}</p> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary">Home Handicap</p>
            <p className="font-medium">{bet.homeHandicap}</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Away Handicap</p>
            <p className="font-medium">{bet.awayHandicap}</p>
          </div>
        </div>
        <hr className="bg-gray-800"></hr>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <span>Total Banker Stake: {bet.totalStake} ETH</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            <span>Home Bets: {bet.homeBets} ETH</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            <span>Away Bets: {bet.awayBets} ETH</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            <span>Max Bet Available: {bet.maxBetAvailable} ETH</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <BetActions bet={bet} />
      </CardFooter>
    </Card>
  );
};

export default BetCard;