import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { smartContractService } from "@/services/smartContractService";

export const BetActions = ({ bet }) => {
  const { toast } = useToast();
  const [contributionAmount, setContributionAmount] = useState("");
  const [betAmount, setBetAmount] = useState(bet.homeBets || bet.awayBets); // Added for bet amount
  const [isContributing, setIsContributing] = useState(false);
  const [isBetting, setIsBetting] = useState(false);
  const [betSide, setBetSide] = useState(bet.homeBets ? true : false);

  const handleContribution = async () => {
    try {
      setIsContributing(true);
      console.log("Contributing to bet:", bet.id, "Amount:", contributionAmount);
      await smartContractService.contributeToBettingPost(
        Number(bet.id),
        String(contributionAmount)
      )
      toast({
        title: "Contributing to Bet Pool",
        description: "Transaction initiated. Please confirm in your wallet.",
      });
    } catch (error) {
      console.error("Error contributing to bet:", error);
      toast({
        title: "Error",
        description: "Failed to contribute to bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleBet = async () => {
    try {
      setIsBetting(true);
      console.log("Making bet:", bet.id, "Side:", betSide, "Amount:", betAmount);
      await smartContractService.makeABet(
        Number(bet.id),
        betSide,
        String(betAmount)
      )
      toast({
        title: "Making Bet",
        description: "Transaction initiated. Please confirm in your wallet.",
      });
    } catch (error) {
      console.error("Error making bet:", error);
      toast({
        title: "Error",
        description: "Failed to make bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBetting(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Contribute as Banker
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Bet Pool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Amount in ETH"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleContribution}
              disabled={isContributing}
            >
              {isContributing ? "Contributing..." : "Contribute"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Make Bet</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Choose your side</Label>
              <RadioGroup
                defaultValue="true"
                onValueChange={(value) => setBetSide(value == "home" ? true : false)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="true" />
                  <Label htmlFor="true">Home Side</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="away" id="false" />
                  <Label htmlFor="false">Away Side</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Input for bet amount */}
            <div className="space-y-2">
              <Label htmlFor="bet-amount">Bet Amount (ETH)</Label>
              <Input
                id="bet-amount"
                type="number"
                placeholder="Enter amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleBet}
              disabled={isBetting || !betAmount} // Disable if betting or no amount entered
            >
              {isBetting ? "Processing..." : "Confirm Bet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BetActions;
