import React from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardSelectorOption {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface CardSelectorProps {
  value: string | null;
  remoteValue?: string | null;
  onChange: (value: string) => void;
  options: readonly CardSelectorOption[];
  disabled?: boolean;
}

const CardSelector: React.FC<CardSelectorProps> = ({
  value,
  remoteValue,
  onChange,
  options,
  disabled = false,
}) => (
  <div className="flex flex-col items-center w-full">
    <div className="flex flex-col gap-4 sm:w-md w-full">
      {options.map(({ value: optValue, icon: Icon, title, description }) => (
        <button
          key={optValue}
          className={cn(
            "rounded-2xl text-left cursor-pointer transition-all border",
            value === optValue ? "glass" : "glass-muted",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          style={{
            padding: "1.5rem",
            ...(value === optValue && { borderColor: "var(--color-green-200)" }),
          }}
          onClick={() => onChange(optValue)}
          disabled={disabled || value === optValue}
        >
          <div className="flex items-center gap-6">
            {value === optValue ? (
              <CircleCheck className="h-6 w-6 shrink-0 text-green-200" />
            ) : (
              <Icon className="h-6 w-6 shrink-0 text-accent-amber" />
            )}
            <div>
              <p
                className={cn(
                  "font-semibold",
                  value === optValue && "text-green-200 underline underline-offset-3",
                )}
              >
                {title}
                {value === optValue && remoteValue != null && remoteValue !== optValue && (
                  <span className="text-sm leading-none inline-block no-underline ml-0.5 text-accent-amber">
                    *
                  </span>
                )}
              </p>
              <p
                className={cn(
                  "text-sm font-light mt-1",
                  value === optValue ? "text-green-200/70" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default CardSelector;
