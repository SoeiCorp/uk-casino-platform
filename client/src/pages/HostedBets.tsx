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

import { transformPostView } from "@/lib/utils";

const HostedBets = () => {
    const { toast } = useToast();
    const { isConnected, walletAddress } = useWallet();
    const [bankerBets, setBankerBets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [haveMore, setHaveMore] = useState(true);

    useEffect(() => {
        const fetchBankerBets = async () => {
            if (!isConnected || !walletAddress) return;

            setIsLoading(true);
            try {
                const result = await smartContractService.getMyBettingPostsAsBanker(100, 0); // Fetch with pagination
                console.log("fetchBankerBets: ", result.data)
                // Map the result data to PostView format
                const mappedBets = result.data
                    .map((bet: any) => transformPostView(bet))
                    .filter((bet: any, index: number, self: any[]) =>
                        index === self.findIndex((b) => b.id === bet.id)
                    );
                console.log("Mapped fetchBankerBets: ", mappedBets)
                setBankerBets(mappedBets);
                setHaveMore(result.haveMorePageAvailable); // Set pagination status
            } catch (error) {
                console.error("Error fetching banker bets:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch bets. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBankerBets();
    }, [isConnected, walletAddress, page]);

    const handleClaimReward = async (postId: string) => {
        try {
            console.log("Claiming reward for post:", postId);
            toast({
                title: "Claiming Reward",
                description: "Transaction initiated. Please confirm in your wallet.",
            });
            // Call the smart contract method for claiming reward
            await smartContractService.bankerClaimReward(Number(postId));
            toast({
                title: "Reward Claimed",
                description: "Your reward has been successfully claimed."
            });
        } catch (error) {
            console.error("Error claiming reward:", error);
            toast({
                title: "Error",
                description: "Failed to claim reward. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Timer className="w-5 h-5 text-primary" />;
            case "claimed":
                return <Trophy className="w-5 h-5 text-green-500" />;
            case "expired":
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-primary";
            case "claimed":
                return "text-green-500";
            case "expired":
                return "text-red-500";
            default:
                return "text-muted";
        }
    };

    const onclick = async (value) => {
        try {
            console.log("Call with value", value)
            const res = await smartContractService.bankerClaimReward(value.id)
        } catch (error) {
            console.log(error)
        }
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-6 pt-24">
                    <h1 className="text-3xl font-bold text-secondary">Hosted Bets</h1>
                    <p className="mt-6 text-muted-foreground">Please connect your wallet to view your hosted bets.</p>
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
                    <h1 className="text-3xl font-bold text-secondary">Hosted Bets</h1>

                    {isLoading ? (
                        <p>Loading your hosted bets...</p>
                    ) : bankerBets.length === 0 ? (
                        <p>You have no hosted bets.</p>
                    ) : (
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Bets</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="resolved">Resolved</TabsTrigger> {/* Resolved Tab */}
                            </TabsList>

                            {/* All Bets */}
                            <TabsContent value="all" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bankerBets.map((bet) => (
                                        <motion.div
                                            key={bet.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-semibold">{bet.home} vs {bet.away}</h3>
                                                        <p className="text-muted-foreground capitalize">{bet.gameType}</p>
                                                    </div>
                                                    {getStatusIcon(bet.status)}
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span>Wager Amount:</span>
                                                        <span>{Number(bet.totalStake) / Math.pow(10, 18)} ETH</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>Status:</span>
                                                        <span className={getStatusColor(bet.status)}>
                                                            {bet.status?.toUpperCase() || 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                    {bet.status !== 'ACTIVE' && (
                                                        <Button
                                                            className="w-full mt-4"
                                                            onClick={() => onclick(bet)}
                                                        >
                                                            Claim Rewards
                                                        </Button>
                                                    )}

                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Active Bets */}
                            <TabsContent value="active" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bankerBets
                                        .filter((bet) => bet.status === 'ACTIVE')
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
                                                            <p className="text-muted-foreground capitalize">{bet.gameType}</p>
                                                        </div>
                                                        {getStatusIcon(bet.status)}
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span>Wager Amount:</span>
                                                            <span>{Number(bet.totalStake) / Math.pow(10, 18)} ETH</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>Status:</span>
                                                            <span className={getStatusColor(bet.status)}>
                                                                {bet.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                </div>
                            </TabsContent>

                            {/* Resolved Bets */}
                            <TabsContent value="resolved" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bankerBets
                                        .filter((bet) => bet.status === 'CLAIMED' || bet.status === 'NOT_CLAIMED')
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
                                                            <p className="text-muted-foreground capitalize">{bet.gameType}</p>
                                                        </div>
                                                        {getStatusIcon(bet.status)}
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span>Wager Amount:</span>
                                                            <span>{Number(bet.totalStake) / Math.pow(10, 18)} ETH</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>Status:</span>
                                                            <span className={getStatusColor(bet.status)}>
                                                                {bet.status?.toUpperCase() || 'RESOLVED'}
                                                            </span>
                                                        </div>

                                                        {/* Conditionally render the 'Claim Rewards' button if the status is 'NOT_CLAIMED' */}
                                                        {bet.status === 'NOT_CLAIMED' && (
                                                            <Button
                                                                className="w-full mt-4"
                                                                onClick={() => handleClaimReward(bet.id)} // Assuming handleClaimReward is implemented
                                                            >
                                                                Claim Rewards
                                                            </Button>
                                                        )}
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

export default HostedBets;
