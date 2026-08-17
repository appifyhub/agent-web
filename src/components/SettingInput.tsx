import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

interface SettingInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  spellCheck?: boolean;
  onKeyboardConfirm?: () => void;
  variant?: "default" | "section";
}

const SettingInput: React.FC<SettingInputProps> = ({
  id,
  label,
  value,
  onChange,
  onClear,
  disabled = false,
  placeholder,
  className,
  labelClassName,
  inputClassName,
  type = "text",
  autoComplete = "off",
  spellCheck = false,
  onKeyboardConfirm = () => {},
  variant = "default",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      onKeyboardConfirm();
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <div
      className={cn(
        variant === "section" ? "space-y-2.5" : "space-y-4",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between w-full",
          variant === "default" && "sm:w-md",
        )}
      >
        <Label
          htmlFor={id}
          className={cn(
            variant === "section"
              ? "text-sm font-medium tracking-tight text-foreground"
              : "ps-2 text-[1.05rem] font-light",
            disabled ? "text-muted-foreground/50" : "",
            labelClassName
          )}
        >
          {label}
        </Label>
        {onClear !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={variant === "section" ? "utility" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0 cursor-pointer rounded-full",
                  variant === "default" && "glass p-1.5",
                )}
                onClick={handleClear}
                disabled={disabled || !value}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("linked_profiles.clear_key")}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input
        id={id}
        className={cn(
          variant === "section"
            ? "h-12 w-full rounded-xl border-border bg-background/45 px-4 text-base shadow-none"
            : "py-6 px-6 w-full sm:w-md text-[1.05rem] glass rounded-2xl",
          disabled ? "cursor-not-allowed" : "",
          inputClassName
        )}
        type={type}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        aria-autocomplete="none"
        placeholder={disabled ? "—" : placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SettingInput;
