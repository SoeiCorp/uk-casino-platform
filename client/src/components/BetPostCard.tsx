import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Post } from "@/types/betting";
import { useState } from "react";
import { smartContractService } from "@/services/smartContractService";

interface BetPostCardProps {
  post: Post;
  matchDetails: {
    home: string;
    away: string;
  };
}

export const BetPostCard = ({ post, matchDetails }: BetPostCardProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClaimReward = async () => {
    try {
      setIsProcessing(true);
      await smartContractService.claimBettingReward(post.id);
      toast({
        title: "Success",
        description: "Reward claimed successfully!",
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{matchDetails.home} vs {matchDetails.away}</h3>
            {/* <p className="text-sm text-muted-foreground">Created by: {post.creator}</p> */}
          </div>
          {post.isResolved && (
            <Trophy className={`w-6 h-6 ${post.isClaimed ? 'text-green-500' : 'text-yellow-500'}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Home Handicap</p>
            <p className="font-medium">{post.homeHandicap}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Away Handicap</p>
            <p className="font-medium">{post.awayHandicap}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Banker Stake:</span>
            <span>{post.totalStake} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Home Bets:</span>
            <span>{post.homeBets} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Away Bets:</span>
            <span>{post.awayBets} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Max Bet Available:</span>
            <span>{post.maxBetAvailable} ETH</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {post.isResolved && !post.isClaimed && (
          <Button
            className="w-full"
            onClick={handleClaimReward}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Claim Reward"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BetPostCard;