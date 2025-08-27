import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Stethoscope } from "lucide-react";
import clarimedLogo from "@/assets/clarimed-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login - in real app, this would authenticate with backend
    if (userType === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3">
            <img src={clarimedLogo} alt="Clarimed Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-foreground">Clarimed</h1>
          </div>
          
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === "patient"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setUserType("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === "doctor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Doctor
          </button>
        </div>

        {/* Login Form */}
        <Card className="shadow-medical bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-center">
              {userType === "doctor" ? "Doctor Portal" : "Patient Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-background"
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant={userType === "doctor" ? "trust" : "medical"} 
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link 
                to="#" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
              
              {userType === "patient" && (
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="#" className="text-primary hover:underline">
                    Sign up here
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">Demo Mode</h3>
            <p className="text-sm text-blue-700">
              This is a demo. Use any email/password to login. 
              {userType === "doctor" ? " You'll be taken to the doctor dashboard." : " Patient features require Supabase integration."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;