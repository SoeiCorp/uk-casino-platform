import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateBet from "./pages/CreateBet";
import CreateMatch from "./pages/CreateMatch";
import AvailableBets from "./pages/AvailableBets";
import MyBets from "./pages/MyBets";
import HostedBets from "./pages/HostedBets"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateBet />} />
          <Route path="/create-match" element={<CreateMatch />} />
          <Route path="/available" element={<AvailableBets />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/hosted-bets" element={<HostedBets />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;