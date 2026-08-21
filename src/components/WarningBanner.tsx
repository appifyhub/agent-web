import React from "react";
import { AlertTriangle, X, Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

interface WarningBannerProps {
  message: string;
  icon?: React.ReactNode;
  borderColor?: string;
  onDismiss?: () => void;
  destructiveLabel?: string;
  destructiveOnClick?: () => void;
  destructiveIcon?: React.ReactNode;
  primaryLabel?: string;
  primaryOnClick?: () => void;
  primaryIcon?: React.ReactNode;
  secondaryLabel?: string;
  secondaryOnClick?: () => void;
  secondaryIcon?: React.ReactNode;
}

const WarningBanner: React.FC<WarningBannerProps> = ({
  message,
  icon,
  borderColor = "border-red-300/60",
  onDismiss,
  destructiveLabel,
  destructiveOnClick,
  destructiveIcon,
  primaryLabel,
  primaryOnClick,
  primaryIcon,
  secondaryLabel,
  secondaryOnClick,
  secondaryIcon,
}) => {
  const defaultIcon = (
    <AlertTriangle className="h-5.5 w-5.5 text-red-300/70 shrink-0" />
  );
  const buttons = [
    {
      type: "destructive" as const,
      label: destructiveLabel,
      onClick: destructiveOnClick,
      icon: destructiveIcon ?? <Trash2 className="h-3.5 w-3.5" />,
      variant: "destructive" as const,
    },
    {
      type: "primary" as const,
      label: primaryLabel,
      onClick: primaryOnClick,
      icon: primaryIcon ?? <Plus className="h-3.5 w-3.5" />,
      variant: "outline" as const,
    },
    {
      type: "secondary" as const,
      label: secondaryLabel,
      onClick: secondaryOnClick,
      icon: secondaryIcon ?? <Check className="h-3.5 w-3.5" />,
      variant: "outline" as const,
    },
  ].filter((btn) => btn.label && btn.onClick);

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-4 rounded-2xl border bg-surface-raised/60",
        borderColor,
      )}
    >
      <div className={cn(
        "flex items-start gap-3 px-[1.25rem] pt-[1.25rem]",
        buttons.length === 0 && "pb-[1.25rem]",
      )}>
        <div className="flex items-center gap-4 flex-1">
          {icon ?? defaultIcon}
          <p className="text-base font-light text-foreground/90 leading-relaxed flex-1 md:text-justify [hyphens:auto]">
            {message}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="utility"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("close")}</span>
          </Button>
        )}
      </div>
      {buttons.length > 0 && (
        <div className="flex flex-col gap-2 px-[1.25rem] pb-[1.25rem] sm:flex-row">
          {buttons.map((button) => (
            <Button
              key={button.type}
              variant={button.variant}
              size="default"
              className="flex-1"
              onClick={button.onClick}
            >
              {button.icon}
              {button.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarningBanner;
