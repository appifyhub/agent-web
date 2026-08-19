import React from "react";
import { CircleCheck } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  variant?: "default" | "segmented";
}

// the segmented variant stacks into rows and becomes one horizontal strip at
// `@min-[48rem]`, measured against the enclosing settings section rather than the
// viewport because the sidebar takes 20rem from the content pane. the widest
// locales (ru, de) need roughly 750px for four segments, so that threshold is the
// first thing to tune during UI review; tailwind only sees literal class names,
// so it has to be changed on each `@min-[48rem]:` prefix below. the group owns the
// outer radius and the dividers between segments, which is why the items stay
// square and the shadcn `outline` variant is not used here.
const CardSelector: React.FC<CardSelectorProps> = ({
  value,
  remoteValue,
  onChange,
  options,
  disabled = false,
  variant = "default",
}) => {
  if (variant === "segmented") {
    const active = options.find((option) => option.value === value);
    const isPending = remoteValue != null && remoteValue !== value;

    return (
      <div className="flex w-full flex-col gap-3">
        <ToggleGroup
          type="single"
          value={value ?? ""}
          // radix clears the value when the active item is pressed again, but a
          // preset is never absent, so ignore the empty deselect callback
          onValueChange={(next) => next && onChange(next)}
          disabled={disabled}
          className={cn(
            "w-full flex-col items-stretch divide-y divide-border/80 overflow-hidden rounded-xl border border-border/80",
            "@min-[48rem]:flex-row @min-[48rem]:divide-x @min-[48rem]:divide-y-0",
          )}
        >
          {options.map(({ value: optValue, icon: Icon, title }) => {
            const isSelected = value === optValue;

            return (
              <ToggleGroupItem
                key={optValue}
                value={optValue}
                className={cn(
                  "h-auto min-h-14 flex-1 justify-start gap-3 whitespace-normal bg-surface-subtle/88 px-4 py-3.5 text-start text-sm text-muted-foreground",
                  "rounded-none! hover:bg-secondary/80 hover:text-foreground",
                  "@min-[48rem]:justify-center @min-[48rem]:text-center",
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground",
                )}
              >
                {isSelected ? (
                  <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2.75} />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span
                  className={cn(
                    "min-w-0",
                    isSelected ? "font-bold" : "font-medium",
                  )}
                >
                  {title}
                </span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        {active && (
          <p className="ps-1 text-sm leading-6 text-muted-foreground">
            {active.description}
            {isPending && (
              <span className="ms-1 inline-block leading-none text-accent-amber">
                *
              </span>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
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
};

export default CardSelector;
