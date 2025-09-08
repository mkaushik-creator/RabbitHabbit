import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [_, setLocation] = useLocation();
  
  console.log("404 Not Found page loaded");
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-gray-600">
            Oops! Page not found. Hop back to home.
          </p>
          
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setLocation("/")}
          >
            <Home size={18} />
            <span>Back to Home</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
