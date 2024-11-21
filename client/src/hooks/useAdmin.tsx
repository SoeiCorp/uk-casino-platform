import { useState, useEffect } from "react";
import { smartContractService } from "@/services/smartContractService";

export const useAdmin = (walletAddress: string | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!walletAddress) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const adminStatus = await smartContractService.isAdmin(walletAddress);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [walletAddress]);

  return { isAdmin, isLoading };
};