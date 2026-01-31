import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const requirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "Lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Number", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "Special character", test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const passedCount = requirements.filter((req) => req.test(password)).length;
  const strengthPercent = (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent <= 20) return "bg-destructive";
    if (strengthPercent <= 40) return "bg-orange-500";
    if (strengthPercent <= 60) return "bg-yellow-500";
    if (strengthPercent <= 80) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strengthPercent <= 20) return "Very Weak";
    if (strengthPercent <= 40) return "Weak";
    if (strengthPercent <= 60) return "Fair";
    if (strengthPercent <= 80) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            strengthPercent === 100 ? "text-green-600" : "text-muted-foreground"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="grid grid-cols-1 gap-1 text-xs">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                passed ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {passed ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
