import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, LogOut, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <nav className="glass-card p-4 mb-8 rounded-xl border border-primary/20 backdrop-blur-xl shadow-lg fixed top-0 left-0 right-0 z-50 mx-auto max-w-[calc(100%-2rem)] lg:max-w-7xl mt-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/src/assets/finhubafrica-logo.png" 
            alt="FINHUBAFRICA Logo" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold font-vogun text-gradient-green tracking-wide">
              FINHUBAFRICA
            </h1>
            <span className="text-xs text-primary/70 font-medium tracking-widest">FINANCIAL HUB</span>
          </div>
        </div>
        
        {/* Ad Space - Navigation Banner */}
        <div className="hidden lg:flex items-center justify-center bg-muted/30 border border-border/40 rounded-lg px-4 py-2 min-w-[200px] h-12">
          <span className="text-xs text-muted-foreground">Ad Space - 200x48</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "outline"}
              size="sm"
              className="hover:bg-primary/90 font-medium"
            >
              Dashboard
            </Button>
          </Link>
          <Link to="/analytics">
            <Button 
              variant={location.pathname === "/analytics" ? "default" : "outline"}
              size="sm"
            >
              Analytics
            </Button>
          </Link>
          <Link to="/tools">
            <Button 
              variant={location.pathname === "/tools" ? "default" : "outline"}
              size="sm"
            >
              Educational
            </Button>
          </Link>
          <Link to="/ai-predictions">
            <Button 
              variant={location.pathname === "/ai-predictions" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              🤖 AI Predictions
            </Button>
          </Link>
          <Link to="/trading">
            <Button 
              variant={location.pathname === "/trading" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" /> Trading
            </Button>
          </Link>
          <Link to="/products">
            <Button 
              variant={location.pathname === "/products" ? "default" : "outline"}
              size="sm"
            >
              Products
            </Button>
          </Link>
          <Link to="/news">
            <Button 
              variant={location.pathname === "/news" ? "default" : "outline"}
              size="sm"
            >
              News
            </Button>
          </Link>
          <Link to="/mobile-money">
            <Button variant="outline" size="sm" className="text-[11px] hover:bg-green-500/10 hover:text-green-400 border-green-500/20">M-Pesa</Button>
          </Link>
          <Link to="/markets">
            <Button 
              variant={location.pathname.startsWith("/markets") || location.pathname.startsWith("/forex") ? "default" : "outline"}
              size="sm"
            >
              Markets
            </Button>
          </Link>
          <Link to="/p2p">
            <Button variant="outline" size="sm" className="text-[11px] hover:bg-blue-500/10 hover:text-blue-400 border-blue-500/20">P2P</Button>
          </Link>
          <Link to="/vault">
            <Button variant="outline" size="sm" className="text-[11px] hover:bg-amber-500/10 hover:text-amber-400 border-amber-500/20">Vault</Button>
          </Link>
          <Link to="/learn">
            <Button variant="outline" size="sm" className="text-[11px] hover:bg-purple-500/10 hover:text-purple-400 border-purple-500/20">Learn</Button>
          </Link>
          <Link to="/recurring">
            <Button variant="outline" size="sm" className="text-[11px] hover:bg-teal-500/10 hover:text-teal-400 border-teal-500/20">DCA</Button>
          </Link>
          
          {/* User Menu */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border/40">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Sign Out</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;