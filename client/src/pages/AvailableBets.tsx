import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import BetCard from "@/components/BetCard";
import { smartContractService } from "@/services/smartContractService";

const AvailableBets = () => {
  const [matches, setMatches] = useState<any[]>([]); // Store fetched matches
  const [hasMore, setHasMore] = useState(false); // Handle pagination state
  const [selectedMatch, setSelectedMatch] = useState<string>(""); // Currently selected match
  const [bets, setBets] = useState<any[]>([]); // Bets for the selected match
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [page, setPage] = useState(0); // Pagination page for bets
  const [hasMoreBets, setHasMoreBets] = useState(false); // Check for more pages

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const result = await smartContractService.getActiveMatches(1000, 0);
        console.log("Raw Matches are: ", result.data);

        // Transform the proxy objects into usable data
        const processedMatches = Array.from(result.data).map((proxyItem) => {
          const matchData = {};
          for (const [key, value] of Object.entries(proxyItem)) {
            matchData[key] = value;
          }
          return matchData;
        });

        console.log("Processed Matches: ", processedMatches);

        setMatches(processedMatches);
        setHasMore(result.haveMorePageAvailable);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    // Fetch bets when a match is selected
    const fetchBets = async () => {
      if (!selectedMatch) {
        setBets([]);
        return;
      }

      setIsLoadingBets(true);
      try {
        // console.log("Selected Match ID: ", Number(selectedMatch))
        const result = await smartContractService.getPostsByMatchId(
          Number(selectedMatch),
          100,
          0,
        );
        // setBets((prevBets) => (page === 0 ? result.data : [...prevBets, ...result.data]));
        setBets(result.data);
        console.log("Bets: ", result.data);
        // Transform the proxy objects into usable data
        const parsedBets = Array.from(result.data).map((proxyItem) => {
          const betData = {};
          for (const [key, value] of Object.entries(proxyItem)) {
            betData[key] = value;
          }
          return betData;
        });

        console.log("Parsed Bets: ", parsedBets);

        const bets = Array.from(parsedBets).map((bet) => {
          const processedData = {};
          processedData["id"] = bet["0"]
          processedData["homeHandicap"] = parseInt(bet["2"]);
          processedData["awayHandicap"] = parseInt(bet["3"]);
          processedData["totalStake"] = parseInt(bet["4"]) / Math.pow(10, 18);
          processedData["homeBets"] = parseInt(bet["6"]["0"]) / Math.pow(10, 18);
          processedData["awayBets"] = parseInt(bet["6"]["1"]) / Math.pow(10, 18);
          processedData["maxBetAvailable"] =
            parseFloat(processedData["totalStake"]) -
            Math.abs(
              parseFloat(processedData["homeBets"]) -
              parseFloat(processedData["awayBets"]),
            ) /
            Math.pow(10, 18);
          processedData["home"] = bet["13"];
          processedData["away"] = bet["14"];
          return processedData;
        });
        console.log("BETSSS: ", bets);

        setBets(bets);
        setHasMoreBets(result.haveMorePageAvailable);
      } catch (error) {
        console.error("Error fetching bets:", error);
      } finally {
        setIsLoadingBets(false);
      }
    };

    fetchBets();
  }, [selectedMatch, page]);

  const handleLoadMoreBets = () => {
    if (hasMoreBets) setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-3xl font-bold text-secondary">
              Available Bets
            </h1>
            <Select
              onValueChange={(value) => {
                // Handle both "all" and individual match selection
                setSelectedMatch(value === "all" ? "" : value);
                setPage(1); // Reset to first page when selecting a new match
              }}
              value={selectedMatch || "all"} // Default to "all" if no match is selected
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue>
                  {selectedMatch
                    ? (() => {
                      // Find the selected match using String conversion for BigInt comparison
                      const selected = matches.find(
                        (match) => String(match[0]) === selectedMatch, // Match ID is in the 0th index and BigInt
                      );
                      return selected
                        ? `${selected[1]} vs ${selected[2]}`
                        : "Select a match";
                    })()
                    : "Select a match"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" disabled>-- Select a match --</SelectItem>
                {isLoadingMatches ? (
                  <SelectItem value="all" disabled>
                    Loading matches...
                  </SelectItem>
                ) : (
                  matches.map((match) => (
                    <SelectItem key={String(match[0])} value={String(match[0])}>
                      {" "}
                      {/* Convert BigInt to string */}
                      {match[1]} vs {match[2]}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingBets ? (
              <p>Loading bets...</p>
            ) : bets.length === 0 ? (
              <p>No bets available for this match.</p>
            ) : (
              bets.map((bet) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <BetCard bet={bet} />
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {hasMoreBets && !isLoadingBets && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLoadMoreBets}
                className="px-4 py-2 bg-secondary text-white rounded-md"
              >
                Load More Bets
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AvailableBets;
