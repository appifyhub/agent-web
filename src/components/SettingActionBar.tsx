import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

interface SettingActionBarProps {
  onActionClicked: () => void;
  actionDisabled: boolean;
  className?: string;
  leadingContent?: React.ReactNode;
  showActionButton?: boolean;
  actionIcon?: React.ReactNode;
  actionButtonText?: string;
  showSecondaryButton?: boolean;
  onSecondaryClicked?: () => void;
  secondaryDisabled?: boolean;
  secondaryIcon?: React.ReactNode;
  secondaryText?: string;
  secondaryTooltipText?: string;
  secondaryClassName?: string;
  showCancelButton?: boolean;
  onCancelClicked?: () => void;
  cancelDisabled?: boolean;
  cancelIcon?: React.ReactNode;
  cancelTooltipText?: string;
}

const SettingActionBar: React.FC<SettingActionBarProps> = ({
  onActionClicked,
  actionDisabled,
  className,
  leadingContent,
  showActionButton = true,
  actionIcon,
  actionButtonText = t("save"),
  showSecondaryButton = false,
  onSecondaryClicked = () => {},
  secondaryDisabled = false,
  secondaryIcon,
  secondaryText,
  secondaryTooltipText,
  secondaryClassName = "",
  showCancelButton = false,
  onCancelClicked = () => {},
  cancelDisabled = false,
  cancelIcon,
  cancelTooltipText = t("close"),
}) => (
  <div className={cn("flex w-full min-w-0 items-center gap-3", className)}>
    {leadingContent && (
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {leadingContent}
      </div>
    )}
    <div className="ml-auto flex shrink-0 items-center gap-2">
      {showSecondaryButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="utility"
              size={secondaryText ? "default" : "icon"}
              className={cn(
                "cursor-pointer rounded-full",
                secondaryText ? "h-9 px-4 text-sm" : "h-9 w-9",
                secondaryClassName,
              )}
              disabled={secondaryDisabled}
              onClick={onSecondaryClicked}
            >
              {secondaryIcon}
              {secondaryText && <span className="ml-2">{secondaryText}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{secondaryTooltipText}</TooltipContent>
        </Tooltip>
      )}
      {showActionButton && (
        <Button
          variant="brand"
          className="h-9 cursor-pointer rounded-full px-5 text-sm disabled:bg-primary/30 disabled:text-primary-foreground/55 disabled:opacity-100 disabled:shadow-none"
          disabled={actionDisabled}
          onClick={onActionClicked}
        >
          {actionIcon}
          {actionIcon && actionButtonText && <span className="ml-2">{actionButtonText}</span>}
          {!actionIcon && actionButtonText}
        </Button>
      )}
      {showCancelButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="utility"
              size="icon"
              className="h-9 w-9 cursor-pointer rounded-full"
              disabled={cancelDisabled}
              onClick={onCancelClicked}
            >
              {cancelIcon ?? <CloseIcon className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{cancelTooltipText}</TooltipContent>
        </Tooltip>
      )}
    </div>
  </div>
);

export default SettingActionBar;
