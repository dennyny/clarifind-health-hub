import { UploadZone } from "./UploadZone";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Users, Star, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Text */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Get Your Lab Results
              <span className="block text-transparent bg-gradient-hero bg-clip-text">
                Explained by Doctors
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload your lab results and receive professional medical interpretations 
              from qualified doctors within 24 hours — completely free.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-medium">5.0 Rating</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-accent" />
                <span>Over 12.5K+ patients helped</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>24-hour turnaround</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <UploadZone />

          {/* Demo Link */}
          <div className="text-center pt-4">
            <Button variant="outline" asChild>
              <Link to="/doctor" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Preview Doctor Dashboard
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="text-center p-6 rounded-lg bg-card shadow-card hover:shadow-medical transition-all duration-300">
              <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Your medical data is protected with enterprise-grade security and encryption.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card shadow-card hover:shadow-medical transition-all duration-300">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Qualified Doctors</h3>
              <p className="text-sm text-muted-foreground">
                Licensed medical professionals review and interpret your results.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card shadow-card hover:shadow-medical transition-all duration-300">
              <Clock className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Fast & Free</h3>
              <p className="text-sm text-muted-foreground">
                Get your results explained within 24 hours at no cost to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};