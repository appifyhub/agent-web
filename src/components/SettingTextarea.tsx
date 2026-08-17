import React, { useLayoutEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
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

interface SettingTextareaProps {
  id: string;
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;
  minRows?: number;
  maxRows?: number;
  variant?: "default" | "section";
}

const SettingTextarea: React.FC<SettingTextareaProps> = ({
  id,
  label,
  helperText,
  value,
  onChange,
  onClear,
  disabled = false,
  placeholder,
  className,
  labelClassName,
  textareaClassName,
  minRows = 2,
  maxRows = 10,
  variant = "default",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset to measure scrollHeight accurately.
    el.style.height = "auto";

    const styles = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;

    const extra = paddingTop + paddingBottom + borderTop + borderBottom;
    const minHeightPx = lineHeight * minRows + extra;
    const maxHeightPx = lineHeight * maxRows + extra;

    const desiredHeight = Math.max(el.scrollHeight, minHeightPx);
    const nextHeight = Math.min(desiredHeight, maxHeightPx);

    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeightPx ? "auto" : "hidden";
  }, [value, minRows, maxRows]);

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
      <div className="space-y-1">
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
        {helperText && (
          <p
            className={cn(
              variant === "section"
                ? "ps-1 text-sm leading-6"
                : "ps-2 text-sm font-light opacity-80",
              disabled ? "text-muted-foreground/50" : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
      <Textarea
        id={id}
        ref={textareaRef}
        className={cn(
          variant === "section"
            ? "w-full resize-none rounded-xl border-border bg-background/45 px-4 py-3 text-base leading-6 shadow-none"
            : "py-6 px-6 w-full sm:w-md text-[1.05rem] glass rounded-xl resize-none",
          disabled ? "cursor-not-allowed" : "",
          textareaClassName
        )}
        placeholder={disabled ? "—" : placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={minRows}
        style={{
          // Height is managed by auto-resize logic above.
          overflowY: undefined,
        }}
      />
    </div>
  );
};

export default SettingTextarea;
