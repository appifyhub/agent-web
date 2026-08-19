import React from "react";
import { Info, X } from "lucide-react";
import { t } from "@/lib/translations";
import { CostEstimate } from "@/services/external-tools-service";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ProviderIcon from "@/components/ProviderIcon";
import { cn } from "@/lib/utils";

interface CostEstimateDialogProps {
  toolName: string;
  costEstimate: CostEstimate;
  providerId?: string;
  providerName?: string;
  maxInputImages?: number;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CostEstimateContent: React.FC<{
  toolName: string;
  costEstimate: CostEstimate;
  maxInputImages?: number;
}> = ({ toolName, costEstimate, maxInputImages }) => {
  const formatCost = (value: number): string => {
    return value.toFixed(value % 1 === 0 ? 0 : 2);
  };

  const tokenCosts = [
    {
      key: "input_1m_tokens",
      label: t("cost_estimate.input_tokens"),
      value: costEstimate.input_1m_tokens,
    },
    {
      key: "output_1m_tokens",
      label: t("cost_estimate.output_tokens"),
      value: costEstimate.output_1m_tokens,
    },
    {
      key: "search_1m_tokens",
      label: t("cost_estimate.search_tokens"),
      value: costEstimate.search_1m_tokens,
    },
  ].filter((item) => item.value != null);

  const inputImageCosts = [
    {
      key: "input_image_1k",
      label: t("cost_estimate.input_image_1k"),
      value: costEstimate.input_image_1k,
    },
    {
      key: "input_image_2k",
      label: t("cost_estimate.input_image_2k"),
      value: costEstimate.input_image_2k,
    },
    {
      key: "input_image_4k",
      label: t("cost_estimate.input_image_4k"),
      value: costEstimate.input_image_4k,
    },
    {
      key: "input_image_8k",
      label: t("cost_estimate.input_image_8k"),
      value: costEstimate.input_image_8k,
    },
    {
      key: "input_image_12k",
      label: t("cost_estimate.input_image_12k"),
      value: costEstimate.input_image_12k,
    },
  ].filter((item) => item.value != null);

  const outputImageCosts = [
    {
      key: "output_image_1k",
      label: t("cost_estimate.output_image_1k"),
      value: costEstimate.output_image_1k,
    },
    {
      key: "output_image_2k",
      label: t("cost_estimate.output_image_2k"),
      value: costEstimate.output_image_2k,
    },
    {
      key: "output_image_4k",
      label: t("cost_estimate.output_image_4k"),
      value: costEstimate.output_image_4k,
    },
  ].filter((item) => item.value != null);

  const outputVideoCosts = [
    {
      key: "output_video_1k_second",
      label: t("cost_estimate.output_video_1k_second"),
      value: costEstimate.output_video_1k_second,
    },
    {
      key: "output_video_2k_second",
      label: t("cost_estimate.output_video_2k_second"),
      value: costEstimate.output_video_2k_second,
    },
    {
      key: "output_video_4k_second",
      label: t("cost_estimate.output_video_4k_second"),
      value: costEstimate.output_video_4k_second,
    },
  ].filter((item) => item.value != null);

  const otherCosts = [
    {
      key: "api_call",
      label: t("cost_estimate.api_call"),
      value: costEstimate.api_call,
    },
    {
      key: "second_of_runtime",
      label: t("cost_estimate.second_of_runtime"),
      value: costEstimate.second_of_runtime,
    },
    {
      key: "web_search_query",
      label: t("cost_estimate.web_search_query"),
      value: costEstimate.web_search_query,
    },
  ].filter((item) => item.value != null);

  const hasAnyCosts =
    tokenCosts.length > 0 ||
    inputImageCosts.length > 0 ||
    outputImageCosts.length > 0 ||
    outputVideoCosts.length > 0 ||
    otherCosts.length > 0;

  const maxImagesNote =
    maxInputImages != null && maxInputImages > 0
      ? t("cost_estimate.max_input_images", { maxImages: maxInputImages })
      : undefined;

  // a rate card reads as one column of figures, so groups are separated by a
  // label and hairlines rather than each being boxed into its own surface
  const renderGroup = (
    title: string,
    rows: { key: string; label: string; value?: number | null }[],
    note?: string,
  ) =>
    rows.length > 0 ? (
      <section>
        <h4 className="font-mono text-[0.7rem] font-semibold tracking-[0.14em] text-primary uppercase">
          {title}
        </h4>
        {note && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground/70">
            {note}
          </p>
        )}
        <dl className="mt-[0.75rem] grid grid-cols-[1fr_auto] items-baseline gap-x-6">
          {rows.map((item, index) => {
            // the last row drops its rule so the group gap does the separating
            const ruled = index < rows.length - 1 ? "border-b border-border/45" : "";

            return (
              <React.Fragment key={item.key}>
                <dt className={cn("py-2.5 text-sm text-muted-foreground", ruled)}>
                  {item.label}
                </dt>
                <dd
                  className={cn(
                    "py-2.5 text-end font-mono text-sm font-medium text-foreground tabular-nums",
                    ruled,
                  )}
                >
                  {formatCost(item.value!)}
                </dd>
              </React.Fragment>
            );
          })}
        </dl>
      </section>
    ) : null;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("cost_estimate.description", { toolName })}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground/60">
          {t("cost_estimate.disclaimer")}
        </p>
      </div>

      {!hasAnyCosts && (
        <p className="text-sm text-muted-foreground">
          {t("cost_estimate.no_data")}
        </p>
      )}

      {renderGroup(t("cost_estimate.token_costs"), tokenCosts)}
      {renderGroup(
        t("cost_estimate.input_image_costs"),
        inputImageCosts,
        maxImagesNote,
      )}
      {renderGroup(
        t("cost_estimate.output_image_costs"),
        outputImageCosts,
        inputImageCosts.length === 0 ? maxImagesNote : undefined,
      )}
      {renderGroup(t("cost_estimate.output_video_costs"), outputVideoCosts)}
      {renderGroup(t("cost_estimate.other_costs"), otherCosts)}
    </div>
  );
};

const CostEstimateDialog: React.FC<CostEstimateDialogProps> = ({
  toolName,
  costEstimate,
  providerId,
  providerName,
  maxInputImages,
  children,
  open,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  
  const handleOpenChange = (newVal: boolean) => {
    if (!isControlled) setInternalOpen(newVal);
    onOpenChange?.(newVal);
  };

  const handleClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOpenChange(true);
  };

  const trigger = isControlled && !children ? null : children ? (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onPointerUp={(e) => { e.stopPropagation(); }}
      onMouseDown={(e) => { e.stopPropagation(); }}
      onMouseUp={(e) => { e.stopPropagation(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
      }}
      className="inline-flex cursor-pointer"
    >
      {children}
    </button>
  ) : (
    <button
      onClick={handleClick}
      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      type="button"
    >
      <Info className="h-4 w-4" />
      <span className="sr-only">{t("cost_estimate.title")}</span>
    </button>
  );

  const heading = (
    <>
      <span className="text-base leading-6 font-semibold text-foreground">
        {t("cost_estimate.title")}
      </span>
      {(toolName || providerName) && (
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {providerId && (
            <ProviderIcon
              providerId={providerId}
              className="h-4 w-4 shrink-0 opacity-80"
            />
          )}
          <span className="text-sm font-medium text-primary">{toolName}</span>
          {providerName && (
            <span className="text-sm text-muted-foreground">
              · {providerName}
            </span>
          )}
        </span>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <>
        {trigger}
        <Dialog open={show} onOpenChange={handleOpenChange}>
          <DialogContent
            className="max-h-[min(42rem,calc(100vh-3rem))] gap-0 overflow-y-auto rounded-3xl border-border bg-popover px-7 py-7 shadow-[0_28px_90px_oklch(0.03_0.01_292/0.55)] sm:max-w-[520px]"
            showCloseButton={false}
          >
            <DialogClose className="absolute top-5 end-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-subtle/90 text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{t("close")}</span>
            </DialogClose>
            <DialogHeader className="gap-0 pe-10">
              <DialogTitle className="flex flex-col items-start">
                {heading}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-[1.5rem]">
              <CostEstimateContent toolName={toolName} costEstimate={costEstimate} maxInputImages={maxInputImages} />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Drawer open={show} onOpenChange={handleOpenChange}>
        {/* DrawerContent already provides its own inner scroll region, so this
            must not scroll too — a second scroller lets the header slide away.
            the base radius comes from an attribute selector, hence `!` */}
        <DrawerContent className="border-border bg-popover px-5 rounded-t-[1.75rem]!">
          <DrawerHeader className="gap-0 px-0 pt-[1.25rem] pb-0 text-left md:gap-0">
            <DrawerTitle className="flex flex-col items-start">
              {heading}
            </DrawerTitle>
          </DrawerHeader>
          <div className="mt-[1.5rem] pb-[max(2rem,env(safe-area-inset-bottom))]">
            <CostEstimateContent toolName={toolName} costEstimate={costEstimate} maxInputImages={maxInputImages} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CostEstimateDialog;
