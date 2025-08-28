import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import clarimedLogo from "@/assets/clarimed-logo.png";

const SignUpSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src={clarimedLogo} alt="Clarimed Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-foreground">Clarimed</span>
          </Link>
        </div>

        <Card className="shadow-medical bg-gradient-card border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">
              Welcome to Clarimed!
            </CardTitle>
            <p className="text-muted-foreground">
              Your account has been created successfully
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                🎉 Congratulations!
              </h3>
              <p className="text-muted-foreground">
                You're now part of the Clarimed community. We're excited to help you on your healthcare journey.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900">Check Your Email</h4>
                  <p className="text-sm text-blue-700">
                    We've sent a confirmation email to your inbox. Please verify your email address to get started.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">What's Next?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verify your email address by clicking the link we sent you
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign in to your account and start exploring our healthcare services
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload lab results, book consultations, and connect with verified doctors
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button asChild variant="medical" className="w-full" size="lg">
                <Link to="/login" className="flex items-center gap-2">
                  Sign In to Your Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@clarimed.com" className="text-primary hover:underline">
                  support@clarimed.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpSuccess;
