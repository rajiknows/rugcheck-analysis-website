
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <Shield className="h-6 w-6 text-primary" />
              <span>TokenRiskBeacon</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/tokens" className="text-foreground hover:text-primary transition-colors">
              Tokens
            </Link>
            <Link to="/alerts" className="text-foreground hover:text-primary transition-colors">
              Alerts
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden fixed inset-0 z-50 bg-background pt-16 px-4 transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col space-y-4 p-4">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors py-2 border-b"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/tokens" 
              className="text-foreground hover:text-primary transition-colors py-2 border-b"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tokens
            </Link>
            <Link 
              to="/alerts" 
              className="text-foreground hover:text-primary transition-colors py-2 border-b"
              onClick={() => setMobileMenuOpen(false)}
            >
              Alerts
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-colors py-2 border-b"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">TokenRiskBeacon</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Token Risk Beacon. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
