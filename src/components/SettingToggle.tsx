import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingToggleProps {
  id: string;
  label: string;
  helperText?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
  onProfileLinkClick?: () => void;
  profileLinkText?: string; // Should be provided when onProfileLinkClick is set
  variant?: "default" | "section";
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  id,
  label,
  helperText,
  checked,
  onChange,
  disabled = false,
  className,
  labelClassName,
  switchClassName,
  onProfileLinkClick,
  profileLinkText,
  variant = "default",
}) => {
  if (variant === "section") {
    return (
      <div className={className}>
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/45 px-4 py-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label
              htmlFor={id}
              className={cn(
                "cursor-pointer text-sm font-medium leading-5 tracking-tight text-foreground",
                disabled &&
                  "cursor-not-allowed text-muted-foreground/50",
                labelClassName,
              )}
            >
              {label}
            </Label>
            {helperText && (
              <p
                className={cn(
                  "ps-1 text-sm leading-6",
                  disabled
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground",
                )}
              >
                {helperText}
                {onProfileLinkClick && profileLinkText && (
                  <>
                    {" "}
                    <Button
                      type="button"
                      variant="link"
                      className="inline h-auto cursor-pointer p-0 align-baseline text-sm text-blue-300/75 underline decoration-blue-300/45 underline-offset-3 hover:text-blue-200"
                      disabled={disabled}
                      onClick={onProfileLinkClick}
                    >
                      {profileLinkText}
                    </Button>
                  </>
                )}
              </p>
            )}
          </div>
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            className={cn(
              "mt-0.5 shrink-0 cursor-pointer data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/20",
              disabled && "cursor-not-allowed",
              switchClassName,
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            className={cn(
              "shrink-0 cursor-pointer",
              "data-[state=checked]:bg-accent-amber",
              "data-[state=checked]:shadow-[0_0_4px_rgba(147,197,253,0.3)]",
              "data-[state=unchecked]:bg-foreground/20",
              disabled && "cursor-not-allowed",
              switchClassName,
            )}
          />
          <Label
            htmlFor={id}
            className={cn(
              "text-[1.05rem] font-light cursor-pointer flex-1",
              disabled ? "text-muted-foreground/50 cursor-not-allowed" : "",
              labelClassName,
            )}
          >
            {label}
          </Label>
        </div>
        {helperText && (
          <p
            className={cn(
              "text-sm font-light opacity-80",
              disabled ? "text-muted-foreground/50" : "text-muted-foreground",
            )}
          >
            {helperText}
            {onProfileLinkClick && (
              <>
                {" "}
                <button
                  onClick={onProfileLinkClick}
                  disabled={disabled}
                  className={cn(
                    "inline-flex items-center space-x-1 underline underline-offset-3 decoration-accent-amber/60 text-accent-amber/60 hover:text-accent-amber cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {profileLinkText}
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingToggle;
