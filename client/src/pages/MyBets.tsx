import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { Trophy, Timer, AlertTriangle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { smartContractService } from "@/services/smartContractService";
import { transformPostView } from "@/lib/utils"

const MyBets = () => {
  const { toast } = useToast();
  const { isConnected, walletAddress } = useWallet();
  const [bets, setBets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      if (!isConnected || !walletAddress) return;

      setIsLoading(true);
      try {
        console.log(walletAddress);
        const fetchedBets = await smartContractService.getPostsIBetIn(10, 0);
        console.log(fetchedBets);
        if (fetchedBets.success) {
          const parsedBets = Array.from(fetchedBets.data).map((proxyItem) => {
            const myBet = transformPostView(proxyItem)
            myBet["wagerAmount"] = myBet["totalStake"] / Math.pow(10, 18)
            myBet["status"] = myBet["isFinished"] ? "Finished" : "Not Finish"
            myBet["myBetHome"] = Number(myBet["myBet"]["awayBet"]) / Math.pow(10, 18)
            myBet["myBetAway"] = Number(myBet["myBet"]["homeBet"]) / Math.pow(10, 18)
            return myBet
          })
          console.log(parsedBets)
          setBets(parsedBets);
        } else {
          setBets([]);
        }

      } catch (error) {
        console.error("Error fetching bets:", error);
        toast({
          title: "Error",
          description: "Failed to fetch bets. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBets();
  }, [isConnected, walletAddress, toast]);

  const handleContributeFunds = async (betId: string) => {
    try {
      console.log("Contributing funds to bet:", betId);
      toast({
        title: "Contributing Funds",
        description: "Transaction initiated. Please confirm in your wallet.",
      });
      // Add your smart contract interaction logic here
    } catch (error) {
      console.error("Error contributing funds:", error);
      toast({
        title: "Error",
        description: "Failed to contribute funds. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Timer className="w-5 h-5 text-primary" />;
      case "won":
        return <Trophy className="w-5 h-5 text-green-500" />;
      case "lost":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-primary";
      case "won":
        return "text-green-500";
      case "lost":
        return "text-red-500";
      default:
        return "text-muted";
    }
  };

  const onclick = async (values) => {
    try {
      console.log("Claming bet with values:", values)
      const res = await smartContractService.claimBettingReward(values.id)
      values["status"] = "Finished"
      console.log(res)
    } catch (error) {
      console.error("Error creating bet:", error)
      toast({
        title: "Error Claming Bet",
        description: "There was an error claming your bet. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24">
          <h1 className="text-3xl font-bold text-secondary">My Bets</h1>
          <p className="mt-6 text-muted-foreground">
            Please connect your wallet to view your bets.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-bold text-secondary">My Bets</h1>

          {isLoading ? (
            <p>Loading your bets...</p>
          ) : bets.length === 0 ? (
            <p>You have no bets.</p>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Bets</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bets.map((bet) => (
                    <motion.div
                      key={bet.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {bet.home} vs {bet.away}
                            </h3>
                            <p className="text-muted-foreground capitalize">
                              {bet.gameType}
                            </p>
                          </div>
                          {getStatusIcon(bet.status)}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Wager Amount:</span>
                            <span>{bet.wagerAmount} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Home Amount:</span>
                            <span>{bet.myBetHome} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Away Amount:</span>
                            <span>{bet.myBetAway} ETH</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Status:</span>
                            <span className={getStatusColor(bet.status)}>
                              {bet.status?.toUpperCase()}
                            </span>
                          </div>
                          {bet.status !== "Not Finish" && (
                            <Button
                              className="w-full mt-4"
                              onClick={() => onclick(bet)}
                            >
                              Claim Rewards
                            </Button>
                          )}
                          {bet.status === "active" && (
                            <Button
                              className="w-full mt-4"
                              onClick={() => handleContributeFunds(bet.id)}
                            >
                              Contribute Funds
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="active">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bets
                    .filter((bet) => bet.status === "Not Finish")
                    .map((bet) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {bet.home} vs {bet.away}
                              </h3>
                              <p className="text-muted-foreground capitalize">
                                {bet.gameType}
                              </p>
                            </div>
                            {getStatusIcon(bet.status)}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Wager Amount:</span>
                              <span>{bet.wagerAmount} ETH</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Status:</span>
                              <span className={getStatusColor(bet.status)}>
                                {bet.status?.toUpperCase()}
                              </span>
                            </div>
                            {bet.status === "active" && (
                              <Button
                                className="w-full mt-4"
                                onClick={() => handleContributeFunds(bet.id)}
                              >
                                Contribute Funds
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="resolved">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bets
                    .filter(
                      (bet) => bet.status === "Finished",
                    )
                    .map((bet) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {bet.home} vs {bet.away}
                              </h3>
                              <p className="text-muted-foreground capitalize">
                                {bet.gameType}
                              </p>
                            </div>
                            {getStatusIcon(bet.status)}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Wager Amount:</span>
                              <span>{bet.wagerAmount} ETH</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Status:</span>
                              <span className={getStatusColor(bet.status)}>
                                {bet.status?.toUpperCase()}
                              </span>
                            </div>
                            <Button
                              className="w-full mt-4"
                              onClick={() => onclick(bet)}
                            >
                              Claim Rewards
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MyBets;
