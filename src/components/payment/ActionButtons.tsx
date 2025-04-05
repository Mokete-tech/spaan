
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  serviceId?: string;
}

const ActionButtons = ({ serviceId }: ActionButtonsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Button asChild className="w-full">
        <Link to="/">Return to homepage</Link>
      </Button>
      
      {serviceId && (
        <Button asChild variant="outline">
          <Link to={`/services/${serviceId}`}>View Service Details</Link>
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
