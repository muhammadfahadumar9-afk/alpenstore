import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryFeeNoticeProps {
  variant?: "default" | "compact";
}

const WHATSAPP_URL =
  "https://wa.me/2349168877858?text=" +
  encodeURIComponent(
    "Hello ALPEN STORE LTD! I'd like to discuss the delivery fee for my order before payment."
  );

const DeliveryFeeNotice = ({ variant = "default" }: DeliveryFeeNoticeProps) => {
  return (
    <div className="card-alpen p-5 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Delivery fee is discussed on WhatsApp
          </h3>
          <p className="text-sm text-muted-foreground">
            {variant === "compact"
              ? "Please chat with us on WhatsApp to confirm your delivery fee before making any payment."
              : "Before completing payment, please chat with us on WhatsApp so we can confirm the delivery fee for your location and arrange the best option for you."}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full gap-2">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
          Discuss delivery fee on WhatsApp
        </a>
      </Button>
    </div>
  );
};

export default DeliveryFeeNotice;