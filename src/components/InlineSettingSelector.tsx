import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface InlineSettingSelectorOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface InlineSettingSelectorProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: InlineSettingSelectorOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const InlineSettingSelector: React.FC<InlineSettingSelectorProps> = ({
  label,
  value,
  onChange,
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
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <Label
        className={cn(
          "block text-[1.05rem] font-light shrink min-w-0 truncate mr-auto",
          disabled ? "text-muted-foreground/50" : "",
          labelClassName
        )}
      >
        {label}
      </Label>
      <Select value={selectValue} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "py-2.5 px-4 w-auto min-w-[40%] max-w-[60%] text-sm rounded-xl cursor-pointer border-border bg-background/45 shadow-none",
            disabled && "text-muted-foreground/80",
            triggerClassName
          )}
        >
          <div className="overflow-hidden truncate flex-1 text-left">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent
          className={cn(
            "max-w-[min(42rem,calc(100vw-2rem))] rounded-xl border-border bg-popover px-2 py-2 text-foreground shadow-2xl",
            contentClassName
          )}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled || opt.value === value}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2.5 text-foreground",
                opt.value === value ? "bg-accent/70" : ""
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

export default InlineSettingSelector;
