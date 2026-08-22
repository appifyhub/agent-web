import React from "react";
import { ExternalToolProvider } from "@/services/external-tools-service";
import ProviderIcon from "@/components/ProviderIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProviderTabsProps {
  providers: ExternalToolProvider[];
  selectedIndex: number;
  onProviderClick: (index: number) => void;
  disabled?: boolean;
}

const ProviderTabs: React.FC<ProviderTabsProps> = ({
  providers,
  selectedIndex,
  onProviderClick,
  disabled = false,
}) => {
  if (providers.length <= 1) return null;

  return (
    <div
      role="tablist"
      className="grid grid-cols-5 sm:grid-cols-10 place-items-center gap-2 mx-auto w-fit pb-[2rem]"
    >
      {providers.map((provider, index) => (
        <Tooltip key={provider.id}>
          <TooltipTrigger asChild>
            <Button
              variant="utility"
              size="icon"
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={provider.name}
              onClick={() => onProviderClick(index)}
              disabled={disabled}
              className={cn(
                "h-8 w-8 cursor-pointer rounded-full border transition-all duration-200",
                selectedIndex === index
                  ? "border-foreground/60 opacity-100"
                  : "border-border/40 opacity-40 hover:opacity-70",
              )}
            >
              <div className="h-4 w-4">
                <ProviderIcon
                  providerId={provider.id}
                  className="w-full h-full"
                  alt={`${provider.name} logo`}
                />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{provider.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ProviderTabs;
