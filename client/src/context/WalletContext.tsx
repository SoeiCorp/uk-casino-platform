import React, { createContext, useContext, useState, useEffect } from "react";

type WalletContextType = {
    isConnected: boolean;
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setWalletAddress(accounts[0]);
                setIsConnected(true);
                localStorage.setItem("walletAddress", accounts[0]); // Persist wallet address
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            console.log("MetaMask is not installed.");
        }
    };

    useEffect(() => {
        const storedWalletAddress = localStorage.getItem("walletAddress");
        if (storedWalletAddress) {
            setWalletAddress(storedWalletAddress);
            setIsConnected(true);
        }
    }, []);

    return (
        <WalletContext.Provider value={{ isConnected, walletAddress, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
