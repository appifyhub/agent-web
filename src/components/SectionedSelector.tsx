import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import ProviderIcon from "@/components/ProviderIcon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CostEstimate } from "@/services/external-tools-service";
import CostEstimateDialog from "@/components/CostEstimateDialog";
import { CircleHelp } from "lucide-react";

export interface SectionedSelectorSection {
  sectionTitle: string;
  providerId?: string; // for navigation
  isConfigured: boolean;
  options: SectionedSelectorOption[];
}

export interface SectionedSelectorOption {
  value: string;
  label: React.ReactNode;
  isConfigured?: boolean;
  providerId?: string; // for provider logos
  costEstimate?: CostEstimate;
  toolName?: string;
  maxInputImages?: number;
}

interface SectionedSelectorProps {
  /** accessible name for the trigger; not rendered as visible copy */
  accessibleName: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onUndo?: () => void;
  sections: SectionedSelectorSection[];
  disabled?: boolean;
  placeholder?: string;
  notConfiguredLabel?: string;
  onProviderNavigate?: (providerId: string) => void;
  hasCredits?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const SectionedSelector: React.FC<SectionedSelectorProps> = ({
  accessibleName,
  value,
  onChange,
  onUndo,
  sections,
  disabled = false,
  placeholder = t("select_placeholder"),
  notConfiguredLabel = t("tools.not_configured_with_prefix"),
  onProviderNavigate,
  hasCredits = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [costEstimateTarget, setCostEstimateTarget] = React.useState<{
    toolName: string;
    estimate: CostEstimate;
    providerId?: string;
    providerName?: string;
    maxInputImages?: number;
  } | null>(null);

  // Find if the current value exists in any section
  const validOption = sections
    .flatMap((section) => section.options)
    .find((opt) => opt.value === value);
  const selectValue = validOption ? value : undefined;

  const actionButtonClassName =
    "h-8 w-8 shrink-0 cursor-pointer rounded-full";

  const undoButton =
    onUndo !== undefined ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="utility"
            size="icon"
            className={actionButtonClassName}
            onClick={onUndo}
            disabled={disabled || !selectValue}
          >
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">{t("restore")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("restore")}</TooltipContent>
      </Tooltip>
    ) : null;

  const costEstimateButton =
    validOption?.costEstimate && validOption.toolName ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="utility"
            size="icon"
            className={actionButtonClassName}
            onClick={() => {
              const validOptionSection = sections.find((s) =>
                s.options.some((o) => o.value === value)
              );
              setCostEstimateTarget({
                toolName: validOption.toolName!,
                estimate: validOption.costEstimate!,
                providerId: validOption.providerId,
                providerName: validOptionSection?.sectionTitle,
                maxInputImages: validOption.maxInputImages,
              });
            }}
          >
            <CircleHelp className="h-4 w-4" />
            <span className="sr-only">{t("cost_estimate.title")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("cost_estimate.title")}</TooltipContent>
      </Tooltip>
    ) : null;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* the cost-estimate and undo actions sit beside the trigger rather than
          inside it, so neither crowds the selected value */}
      <div
        className={cn(
          (costEstimateButton || undoButton) && "flex items-center gap-1.5",
        )}
      >
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={onChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          // no visible label, so the control carries its own accessible name
          aria-label={accessibleName}
          className={cn(
            // shadcn line-clamps the value via display:-webkit-box, which clips
            // without an ellipsis; restore flex so the label's own truncate wins
            "*:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1",
            // the icon-to-label gap lives on the value's inner row; tightened only
            // here, since the portalled dropdown has no container ancestor
            "*:data-[slot=select-value]:*:gap-1.5 @min-[30rem]:*:data-[slot=select-value]:*:gap-3",
            // the chevron is lifted out of the flex row and parked in the trailing
            // padding, so the value can never share or overrun its space
            "relative [&>svg]:absolute [&>svg]:end-2 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2",
            "h-12 w-full min-w-0 flex-1 basis-0 cursor-pointer gap-0 overflow-hidden rounded-xl border-border bg-background/45 ps-2 pe-8 text-sm shadow-none data-[size=default]:h-12 @min-[30rem]:ps-4 @min-[30rem]:pe-9 @min-[30rem]:text-base",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "max-w-[min(42rem,calc(100vw-2rem))] rounded-xl border-border bg-popover px-2 py-2 text-foreground shadow-2xl",
            contentClassName
          )}
        >
          {sections.map((section) => (
            <div key={section.sectionTitle}>
              <div
                className={cn(
                  "flex items-center justify-between pointer-events-auto",
                  "px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground",
                )}
              >
                <span>{section.sectionTitle}</span>
                {!section.isConfigured && !hasCredits && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (section.providerId) {
                        if (onProviderNavigate) {
                          onProviderNavigate(section.providerId);
                          setIsOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          console.warn(
                            "Provider navigation not available yet for:",
                            section.providerId,
                          );
                        }
                      }
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    disabled={!section.providerId}
                    className={cn(
                      "pointer-events-auto h-auto rounded-full px-2.5 py-1 text-xs font-medium",
                      !section.providerId
                        ? "cursor-not-allowed border-muted-foreground/20 text-muted-foreground/60"
                        : "cursor-pointer border-accent-amber/30 bg-accent-amber/5 text-accent-amber transition-transform hover:border-accent-amber/50 hover:bg-accent-amber/15 active:scale-95",
                    )}
                  >
                    {notConfiguredLabel}
                  </Button>
                )}
              </div>

              {section.options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={!section.isConfigured && !hasCredits}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2.5 text-foreground",
                    opt.value === value ? "bg-accent/70" : "",
                    (!section.isConfigured || !opt.isConfigured) ? "text-muted-foreground/50" : ""
                  )}
                  addon={
                    <>
                      {opt.costEstimate && opt.toolName && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="pointer-events-auto z-50 size-7 shrink-0 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
                          aria-label={t("cost_estimate.title")}
                          onPointerDown={(event) => event.stopPropagation()}
                          onPointerUp={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsOpen(false);
                            setCostEstimateTarget({
                              toolName: opt.toolName!,
                              estimate: opt.costEstimate!,
                              providerId: opt.providerId,
                              providerName: section.sectionTitle,
                              maxInputImages: opt.maxInputImages,
                            });
                          }}
                        >
                          <CircleHelp className="size-4" />
                        </Button>
                      )}

                      {section.isConfigured && !opt.isConfigured && (
                        <div className="flex items-center gap-2 ms-auto ps-2">
                          <span className="text-xs text-muted-foreground/60 ms-2">
                            {notConfiguredLabel}
                          </span>
                        </div>
                      )}
                    </>
                  }
                >
                  <div className="flex w-full min-w-0 items-center gap-3">
                    {opt.providerId && (
                      <ProviderIcon
                        providerId={opt.providerId}
                        className="w-4 h-4 opacity-70 shrink-0"
                        alt=""
                      />
                    )}
                    <span className="truncate-start min-w-0 flex-1">
                      <bdi>{opt.label}</bdi>
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
        {costEstimateButton}
        {undoButton}
      </div>
      {costEstimateTarget && (
        <CostEstimateDialog
          toolName={costEstimateTarget.toolName}
          costEstimate={costEstimateTarget.estimate}
          providerId={costEstimateTarget.providerId}
          providerName={costEstimateTarget.providerName}
          maxInputImages={costEstimateTarget.maxInputImages}
          open={!!costEstimateTarget}
          onOpenChange={(open) => {
            if (!open) setCostEstimateTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default SectionedSelector;
