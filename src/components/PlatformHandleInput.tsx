import React from "react";
import PlatformDropdown from "@/components/PlatformDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Platform } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

interface PlatformHandleInputProps {
  label: string;
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  platformHandle: string;
  onPlatformHandleChange: (value: string) => void;
  disabled?: boolean;
  onKeyboardConfirm?: () => void;
  className?: string;
}

const getPlatformPlaceholder = (
  platform: Platform,
  disabled: boolean,
): string => {
  if (disabled) return "—";
  switch (platform) {
    case Platform.TELEGRAM:
      return t("sponsorship.platform_handle_placeholder_telegram");
    case Platform.WHATSAPP:
      return t("sponsorship.platform_handle_placeholder_whatsapp");
    default:
      return t("sponsorship.platform_handle_placeholder");
  }
};

const PlatformHandleInput: React.FC<PlatformHandleInputProps> = ({
  label,
  selectedPlatform,
  onPlatformChange,
  platformHandle,
  onPlatformHandleChange,
  disabled = false,
  onKeyboardConfirm,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <Label className="ps-2 text-[1.05rem] font-light w-full sm:w-md">
        {label}
      </Label>
      <div className="flex space-x-3 w-full sm:w-md">
        <PlatformDropdown
          selectedPlatform={selectedPlatform}
          onPlatformChange={onPlatformChange}
        />
        <Input
          className="py-6 px-6 w-full text-[1.05rem] glass rounded-2xl"
          placeholder={getPlatformPlaceholder(selectedPlatform, disabled)}
          disabled={disabled}
          value={platformHandle}
          onChange={(e) => onPlatformHandleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onKeyboardConfirm) {
              onKeyboardConfirm();
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlatformHandleInput;
