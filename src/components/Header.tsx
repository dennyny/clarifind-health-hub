import clarimedLogo from "@/assets/clarimed-logo.png";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="w-full border-b border-border bg-gradient-card shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={clarimedLogo} 
              alt="Clarimed Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Clarimed
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Doctor Verified</span>
              </div>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};