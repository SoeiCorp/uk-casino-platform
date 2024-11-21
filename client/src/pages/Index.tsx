import { motion } from "framer-motion";
import { TrendingUp, Users, Award, Wallet2 } from "lucide-react";
import StatCard from "../components/StatCard";
import Navbar from "../components/Navbar";
import { useWallet } from "@/context/WalletContext";

const Index = () => {
    const { isConnected, walletAddress, connectWallet } = useWallet();
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-6 pt-24">
                <img
                    src="online-casino.png"
                    alt="online casino"
                    className="relative w-full h-full object-cover text-center blur-sm brightness-50"
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <h1 className="text-5xl font-bold text-gray-200 mb-4">
                            Win Big at{" "}
                            <span className="text-primary">UK888</span>💰
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            The next generation of decentralized betting, get
                            rich fast and easy.
                        </p>
                        <h2 className="text-2xl font-bold mt-4 text-gray-50">
                            Connect your MetaMask Wallet now!!
                        </h2>
                        <div className="w-full flex justify-center">
                            <button
                                onClick={connectWallet}
                                className={`flex items-center space-x-2 mt-4 ${
                                    isConnected
                                        ? "btn-primary"
                                        : "btn-secondary"
                                }`}
                            >
                                <Wallet2 className="w-5 h-5" />
                                <span>
                                    {isConnected
                                        ? "Connected"
                                        : "Connect Wallet"}
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="text-center">
                    <h1 className="text-5xl font-bold text-secondary mb-4">
                        Welcome to UK888
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover a workd of excitement and rewards at UK888.
                        Enjoy a wide range of games, exclusive bonuses. Join us
                        today and experience the thrill of winning!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-32">
                    <StatCard
                        title="Total Bets"
                        value="10,234"
                        icon={<TrendingUp className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Active Users"
                        value="2,451"
                        icon={<Users className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Total Winnings"
                        value="Ξ 1,234"
                        icon={<Award className="w-6 h-6" />}
                    />
                </div>
            </main>
        </div>
    );
};

export default Index;
