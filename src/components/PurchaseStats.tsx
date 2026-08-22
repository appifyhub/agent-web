import React, { useState } from "react";
import { ChevronDown, BadgeCent, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import { PurchaseAggregates, ProductAggregateStats } from "@/services/purchase-service";

interface PurchaseStatsProps {
  stats: PurchaseAggregates | null;
  isLoading?: boolean;
}

const PurchaseStats: React.FC<PurchaseStatsProps> = ({ stats, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || !stats) {
    return null;
  }

  const formatCurrency = (cents: number): string => {
    const dollars = cents / 100;
    return `$${dollars.toFixed(2)}`;
  };

  const getProductName = (productId: string): string => {
    const product = stats.all_products_used.find((p) => p.id === productId);
    return product?.name || productId;
  };

  const hasBreakdowns = Object.keys(stats.by_product).length > 0;

  const renderBreakdown = (
    title: string,
    data: Record<string, ProductAggregateStats>
  ) => {
    if (Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div className="border border-border/50 rounded-md p-[1rem] space-y-2 bg-[oklch(0.22_0.02_292)]">
        <h4 className="text-sm font-medium text-blue-300/80 uppercase truncate">
          {title}
        </h4>
        <div className="flex flex-col space-y-1 text-sm">
          {Object.entries(data)
            .sort(([nameA, statsA], [nameB, statsB]) => {
              if (statsB.total_net_cost_cents !== statsA.total_net_cost_cents) {
                return statsB.total_net_cost_cents - statsA.total_net_cost_cents;
              }
              if (statsB.record_count !== statsA.record_count) {
                return statsB.record_count - statsA.record_count;
              }
              return getProductName(nameA).localeCompare(getProductName(nameB));
            })
            .map(([productId, aggregateStats]) => {
              const displayName = getProductName(productId);

              return (
                <div key={productId} className="flex justify-between gap-4">
                  <span className="text-muted-foreground min-w-0 truncate">
                    {displayName}
                  </span>
                  <span className="shrink-0 text-xs flex items-center gap-1">
                    <span className="text-accent-amber">{formatCurrency(aggregateStats.total_net_cost_cents)}</span>
                    <span className="text-muted-foreground">({aggregateStats.record_count})</span>
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-[0.5rem]">
        <div className="bg-[oklch(0.22_0.02_292)] border border-border/80 rounded-lg px-[0.75rem] py-[0.75rem] flex flex-col items-center gap-[0.5rem]">
          <BadgeCent strokeWidth={1.5} className="h-6 w-6 shrink-0 text-accent-amber" />
          <div className="text-center min-w-0">
            <p className="text-xs text-foreground/70 truncate">
              {t("purchases.stats.total_paid")}
            </p>
            <p className="text-lg font-medium text-accent-amber truncate">
              {formatCurrency(stats.total_cost_cents)}
            </p>
          </div>
        </div>

        <div className="bg-[oklch(0.22_0.02_292)] border border-border/80 rounded-lg px-[0.75rem] py-[0.75rem] flex flex-col items-center gap-[0.5rem]">
          <ListOrdered strokeWidth={1.5} className="h-6 w-6 shrink-0 text-blue-300" />
          <div className="text-center min-w-0">
            <p className="text-xs text-foreground/70 truncate">
              {t("purchases.stats.total_purchases")}
            </p>
            <p className="text-lg font-medium text-blue-300 truncate">
              {stats.total_purchase_count.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {hasBreakdowns && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between py-3 px-2 border-b border-muted-foreground/20 text-[1.05rem]",
            isExpanded
              ? "font-medium text-accent-amber underline underline-offset-4"
              : "font-light"
          )}
        >
          <span>
            {isExpanded
              ? t("purchases.stats.hide_breakdowns")
              : t("purchases.stats.show_breakdowns")}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </Button>
      )}

      {isExpanded && hasBreakdowns && (
        <div className="mt-[1rem] flex flex-col gap-y-2">
          {renderBreakdown(t("purchases.stats.by_product"), stats.by_product)}
        </div>
      )}
    </div>
  );
};

export default PurchaseStats;
