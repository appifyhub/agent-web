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
}) => {
  const validOption = options.find((opt) => opt.value === value);
  const selectValue = validOption ? value : undefined;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="space-y-1">
        <div className="flex w-full items-center justify-between">
          <Label
            className={cn(
              "text-sm font-medium tracking-tight text-foreground",
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
                  variant="utility"
                  size="icon"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-full"
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
              "ps-1 text-sm leading-6",
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
            "h-12 w-full cursor-pointer overflow-hidden rounded-xl border-border bg-background/45 px-4 text-base shadow-none data-[size=default]:h-12",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "rounded-xl border-border bg-popover px-2 py-2 text-foreground shadow-2xl",
            contentClassName,
          )}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled || opt.value === value}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2.5 text-foreground",
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
