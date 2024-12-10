import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

function NotFound() {
  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <AlertTriangle className="w-24 h-24 text-primary/70" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-5xl font-logo font-bold tracking-wide">
        404
      </h1>
      
      <p className="text-muted-foreground text-lg">
        Oops! The page you're looking for seems to have wandered off.
      </p>
      
      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link to="/">
            Return to Home
          </Link>
        </Button>
        
        <div className="text-xs text-muted-foreground">
          If you believe this is an error, please 
          <Link to="/contact" className="ml-1 underline">
            contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
