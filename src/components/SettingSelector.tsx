import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface SettingSelectorOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SettingSelectorProps {
  label: string;
  helperText?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onUndo?: () => void;
  options: SettingSelectorOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "section";
}

const SettingSelector: React.FC<SettingSelectorProps> = ({
  label,
  helperText,
  value,
  onChange,
  onUndo,
  options,
  disabled = false,
  placeholder = t("select_placeholder"),
  className = "",
  labelClassName = "",
  triggerClassName = "",
  contentClassName = "",
  variant = "default",
}) => {
  const validOption = options.find((opt) => opt.value === value);
  const selectValue = validOption ? value : undefined;

  return (
    <div
      className={cn(
        variant === "section" ? "space-y-2.5" : "space-y-4",
        className,
      )}
    >
      <div className="space-y-1">
        <div
          className={cn(
            "flex w-full items-center justify-between",
            variant === "default" && "sm:w-md",
          )}
        >
          <Label
            className={cn(
              variant === "section"
                ? "text-sm font-medium tracking-tight text-foreground"
                : "text-[1.05rem] font-light",
              disabled ? "text-muted-foreground/50" : "",
              labelClassName,
            )}
          >
            {label}
          </Label>
          {onUndo !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={variant === "section" ? "utility" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 cursor-pointer rounded-full",
                    variant === "default" && "glass p-1.5",
                  )}
                  onClick={onUndo}
                  disabled={disabled || !selectValue}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("restore")}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              variant === "section"
                ? "ps-1 text-sm leading-6"
                : "ps-1 text-sm font-light opacity-80",
              disabled
                ? "text-muted-foreground/50"
                : "text-muted-foreground",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
      <Select value={selectValue} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            variant === "section"
              ? "h-12 w-full cursor-pointer overflow-hidden rounded-xl border-border bg-background/45 px-4 text-base shadow-none data-[size=default]:h-12"
              : "py-6 px-6 w-full sm:w-md text-[1.05rem] overflow-hidden rounded-2xl cursor-pointer",
            variant === "default" &&
              (disabled
                ? "text-muted-foreground/80 glass-static"
                : "glass"),
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            variant === "section"
              ? "rounded-xl border-border bg-popover px-2 py-2 text-foreground shadow-2xl"
              : "px-4 py-4 glass-dark-static rounded-2xl text-foreground",
            contentClassName,
          )}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled || opt.value === value}
              className={cn(
                variant === "section"
                  ? "cursor-pointer rounded-lg px-3 py-2.5 text-foreground"
                  : "py-4 px-4 cursor-pointer text-foreground",
                opt.value === value ? "bg-accent/70" : "",
              )}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SettingSelector;
