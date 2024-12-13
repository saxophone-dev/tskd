import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/Contact"
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

function NotFound() {
  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <AlertTriangle
          className="w-24 h-24 text-primary/70"
          strokeWidth={1.5}
        />
      </div>

      <h1 className="text-5xl font-logo font-bold tracking-wide">not found</h1>

      <p className="text-muted-foreground text-lg">
        Oops! The page you're looking for seems to have disappeared.
      </p>

      <div className="">
        <Button asChild className="w-full mb-6">
          <Link to="/">Go back?</Link>
        </Button>

        <div className="text-xs text-muted-foreground -mt-4">
          If you believe this is an error, please
          <ContactDialog child={<span className="ml-1 underline cursor-pointer">contact support</span>} />.
        </div>
      </div>
    </div>
  );
}

export default NotFound;
