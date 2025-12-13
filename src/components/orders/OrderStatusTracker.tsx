import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusConfig {
  icon: React.ElementType;
  color: string;
  label: string;
  step: number;
}

export const statusConfig: Record<string, StatusConfig> = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending", step: 1 },
  confirmed: { icon: Package, color: "bg-blue-500", label: "Confirmed", step: 2 },
  processing: { icon: Package, color: "bg-blue-500", label: "Processing", step: 2 },
  shipped: { icon: Truck, color: "bg-purple-500", label: "Shipped", step: 3 },
  delivered: { icon: CheckCircle, color: "bg-green-500", label: "Delivered", step: 4 },
  cancelled: { icon: XCircle, color: "bg-red-500", label: "Cancelled", step: 0 },
};

interface OrderStatusTrackerProps {
  status: string;
  showBadge?: boolean;
}

export const getStatusBadge = (status: string) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={`${config.color} text-white`}>
      <config.icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

const OrderStatusTracker = ({ status, showBadge = false }: OrderStatusTrackerProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  const currentStep = config.step;
  const steps = [
    { step: 1, label: "Pending", icon: Clock },
    { step: 2, label: "Processing", icon: Package },
    { step: 3, label: "Shipped", icon: Truck },
    { step: 4, label: "Delivered", icon: CheckCircle },
  ];

  if (status === "cancelled") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-destructive">
        <XCircle className="w-10 h-10 mb-2" />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      {showBadge && (
        <div className="flex justify-center mb-4">
          {getStatusBadge(status)}
        </div>
      )}
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted mx-4">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>

        {steps.map(({ step, label, icon: Icon }) => (
          <div key={step} className="relative z-10 flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-xs mt-2 text-center ${
                step <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
