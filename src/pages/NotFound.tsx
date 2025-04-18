
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Shield className="h-24 w-24 text-muted-foreground" />
            <AlertTriangle className="h-10 w-10 text-risk-high absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="w-full">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
