import { Link, useLocation } from "react-router-dom";
import { Wallet2, Menu, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdmin } from "@/hooks/useAdmin";
import { useWallet } from "@/context/WalletContext";

const Navbar = () => {
  const { isConnected, walletAddress, connectWallet } = useWallet();
  const location = useLocation();
  const { isAdmin } = useAdmin(walletAddress);

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className={`nav-link ${location.pathname === "/" ? "text-secondary" : ""}`}
      >
        Home
      </Link>
      {isConnected && (
        <>
          <Link
            to="/create"
            className={`nav-link ${location.pathname === "/create" ? "text-secondary" : ""}`}
          >
            Create Bet
          </Link>
          <Link
            to="/available"
            className={`nav-link ${location.pathname === "/available" ? "text-secondary" : ""}`}
          >
            Available Bets
          </Link>
          <Link
            to="/my-bets"
            className={`nav-link ${location.pathname === "/my-bets" ? "text-secondary" : ""}`}
          >
            My Bets
          </Link>
          <Link
            to="/hosted-bets"
            className={`nav-link ${location.pathname === "/hosted-bets" ? "text-secondary" : ""}`}
          >
            Hosted Bets
          </Link>
        </>
      )}
      {isAdmin && (
        <Link
          to="/create-match"
          className={`nav-link flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-md ${location.pathname === "/create-match" ? "text-secondary" : ""
            }`}
        >
          <Shield className="w-4 h-4" />
          Create Match
        </Link>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-secondary">
            UK888
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <button
            onClick={connectWallet}
            className={`flex items-center space-x-2 ${isConnected ? "btn-primary" : "btn-secondary"}`}
          >
            <Wallet2 className="w-5 h-5" />
            <span>{isConnected ? "Connected" : "Connect Wallet"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
