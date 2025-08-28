import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Stethoscope, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import clarimedLogo from "@/assets/clarimed-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const ExpertLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuth();

  // Redirect if already logged in as doctor
  useEffect(() => {
    if (user && profile && profile.user_type === 'doctor') {
      navigate('/doctor');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.endsWith("@clarimed.com")) {
      setError("Expert access requires a @clarimed.com email address");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || "Invalid email or password");
      }
      // Navigation will be handled by useEffect when profile is loaded
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3">
            <img src={clarimedLogo} alt="Clarimed Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-foreground">Clarimed Expert</h1>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Doctor Portal
            </h2>
            <p className="text-muted-foreground">
              Sign in to access the medical expert dashboard
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-medical bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-center">
              Expert Access
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Restricted to verified medical professionals
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Professional Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clarimed.com"
                  className="bg-background"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must use your @clarimed.com email address
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-background pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="medical" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Access Expert Dashboard
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link 
                to="/expert/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Secure Access
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Only verified medical professionals with @clarimed.com accounts</p>
              <p>• All activities are logged for compliance and security</p>
              <p>• Contact IT support for access issues</p>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <div className="text-center text-sm text-muted-foreground">
          Need help? Contact{" "}
          <a 
            href="mailto:support@clarimed.com" 
            className="text-primary hover:underline"
          >
            support@clarimed.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExpertLogin;
