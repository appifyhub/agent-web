import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { copyText } from "@/lib/clipboard";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface CopyableCommandProps {
  command: string;
  onCopy?: () => void;
  onCopied?: () => void;
  onCopyFailed?: () => void;
  copyDisabled?: boolean;
  copyTooltipText?: string;
  copyErrorText?: string;
  textRef?: React.Ref<HTMLSpanElement>;
  textClassName?: string;
  beforeCopy?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const CopyableCommand: React.FC<CopyableCommandProps> = ({
  command,
  onCopy,
  onCopied,
  onCopyFailed,
  copyDisabled = false,
  copyTooltipText,
  copyErrorText,
  textRef,
  textClassName,
  beforeCopy,
  children,
  className,
}) => {
  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onCopy?.();
    if (await copyText(command)) {
      toast(t("copied"));
      onCopied?.();
    } else {
      toast.error(copyErrorText ?? t("command_line.copy_failed"));
      onCopyFailed?.();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        ref={textRef}
        dir="ltr"
        className={cn(
          "flex-1 h-12 min-h-12 px-4 flex items-center font-mono text-sm bg-card/90 border border-border/80 rounded-xl select-all overflow-x-auto overflow-y-hidden whitespace-nowrap",
          textClassName,
        )}
      >
        {command}
      </span>
      {beforeCopy}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-surface-raised/50 border border-border/60 rounded-xl h-12 w-12 cursor-pointer"
            onClick={handleCopy}
            disabled={copyDisabled}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copyTooltipText ?? t("command_line.copy_command")}
        </TooltipContent>
      </Tooltip>
      {children}
    </div>
  );
};

export default CopyableCommand;
