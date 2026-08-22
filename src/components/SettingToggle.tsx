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
  profileLinkText?: string; // required when onProfileLinkClick is set
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
}) => {
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

};

export default SettingToggle;
