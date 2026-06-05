import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrendingUp, Menu, Home, BarChart3, BookOpen, Package, Newspaper, HelpCircle, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MobileNavigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/tools", label: "Learn", icon: BookOpen },
    { path: "/products", label: "Markets", icon: Package },
    { path: "/news", label: "News", icon: Newspaper },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b-0 rounded-none">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/finhubafrica-logo.png" 
              alt="FINHUBAFRICA Logo" 
              className="h-8 w-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gradient tracking-wider">FINHUBAFRICA</h1>
              <span className="text-xs text-muted-foreground font-medium tracking-widest">FINANCIAL HUB</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="neu-card">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-card border-l-0 rounded-none scrollbar-modern">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="pb-4 border-b border-border/50">
                    <h2 className="font-semibold text-gradient text-xl">Navigation</h2>
                    <p className="text-sm text-muted-foreground mt-1">Navigate through the platform</p>
                  </div>
                  
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${
                          isActive(item.path) 
                            ? "premium-card text-primary-foreground" 
                            : "hover:bg-muted/50 glass-card"
                        }`}>
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {isActive(item.path) && (
                            <Badge variant="secondary" className="ml-auto bg-primary-foreground/20 text-primary-foreground">Active</Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <div className="pt-2 pb-1 border-t border-border/50">
                    <div className="flex items-center justify-between py-3">
                      <h3 className="text-sm font-semibold text-gradient">Africa-First Features</h3>
                      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">New</Badge>
                    </div>
                  </div>
                  <Link to="/mobile-money" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/mobile-money") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium flex-1">Mobile Money</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                  <Link to="/p2p" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/p2p") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <Users className="h-5 w-5" />
                      <span className="font-medium flex-1">P2P Marketplace</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                  <Link to="/vault" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/vault") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <Shield className="h-5 w-5" />
                      <span className="font-medium flex-1">Vault</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                  <Link to="/learn" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/learn") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium flex-1">Learn & Earn</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                  <Link to="/recurring" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/recurring") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium flex-1">Recurring Buys</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                  <Link to="/social-trading" onClick={() => setOpen(false)} className="block">
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 micro-bounce ${isActive("/social-trading") ? "premium-card text-primary-foreground" : "hover:bg-muted/50 glass-card"}`}>
                      <Shield className="h-5 w-5" />
                      <span className="font-medium flex-1">Social Trading</span>
                      <Badge className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">New</Badge>
                    </div>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block glass-card p-4 mb-8 fixed top-0 left-0 right-0 z-50 mx-auto max-w-7xl mt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/src/assets/finhubafrica-logo.png" 
              alt="FINHUBAFRICA Logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-vogun text-gradient tracking-wide">
                FINHUBAFRICA
              </h1>
              <span className="text-xs text-muted-foreground font-medium tracking-widest">FINANCIAL HUB</span>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap items-center">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "outline"}
                  size="sm"
                  className={`transition-all duration-300 micro-bounce font-medium ${
                    isActive(item.path) 
                      ? "btn-primary" 
                      : "neu-card hover:glass-card"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;