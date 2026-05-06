import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TrendingUp, Menu, Home, BarChart3, BookOpen, Package, Newspaper, HelpCircle, Shield } from "lucide-react";
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