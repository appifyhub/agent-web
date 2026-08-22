import React, { useCallback, useEffect, useState } from "react";
import { ClockAlert, ClockFading, Link2Off, Sun } from "lucide-react";
import TokenSummary from "@/components/TokenSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DecodedToken } from "@/lib/tokens";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiryTimestamp: number;
  decodedToken?: DecodedToken;
  onExpire?: () => void;
  compactOnNarrow?: boolean;
}

interface SessionPopoverOptions {
  align?: "center" | "end";
  showTimer?: boolean;
}

interface SessionDetailsProps {
  title: React.ReactNode;
  timer?: React.ReactNode;
  decodedToken?: DecodedToken;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({
  title,
  timer,
  decodedToken,
}) => (
  <>
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      {title}
      {timer && <div className="ml-auto">{timer}</div>}
    </div>
    {decodedToken && <TokenSummary decoded={decodedToken} />}
  </>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryTimestamp,
  decodedToken,
  onExpire,
  compactOnNarrow = false,
}) => {
  const calculateTimeLeft = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const deltaSeconds = expiryTimestamp - now;
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (deltaSeconds > 0) {
      timeLeft = {
        days: Math.floor(deltaSeconds / (60 * 60 * 24)),
        hours: Math.floor((deltaSeconds % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((deltaSeconds % (60 * 60)) / 60),
        seconds: Math.floor(deltaSeconds % 60),
      };
    }

    return { timeLeft, deltaSeconds };
  }, [expiryTimestamp]);

  const [{ timeLeft, deltaSeconds }, setTimeLeft] = useState(
    calculateTimeLeft(),
  );
  const [isExpired, setIsExpired] = useState(deltaSeconds <= 0);

  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      const { timeLeft: newTimeLeft, deltaSeconds: newDeltaSeconds } =
        calculateTimeLeft();
      setTimeLeft({ timeLeft: newTimeLeft, deltaSeconds: newDeltaSeconds });

      if (newDeltaSeconds <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, isExpired, onExpire]);

  const statusClassName =
    deltaSeconds <= 60
      ? "border-destructive text-destructive"
      : deltaSeconds <= 180
        ? "border-accent-amber/45 text-accent-amber"
        : "border-border bg-surface-subtle/75 text-muted-foreground";
  const iconClassName = "size-4 shrink-0";
  const statusIcon = isExpired ? (
    <Link2Off className={iconClassName} />
  ) : deltaSeconds <= 180 ? (
    <ClockAlert className={iconClassName} />
  ) : (
    <ClockFading className={iconClassName} />
  );

  const formatTime = (time: number): string =>
    String(time).padStart(2, "0");
  const { days, hours, minutes, seconds } = timeLeft;
  let timeString = "";
  if (hours > 0) {
    timeString += `${formatTime(hours)}:`;
  }
  if (minutes > 0 || hours > 0) {
    timeString += `${formatTime(minutes)}:`;
  }
  timeString += formatTime(seconds);

  const timerContent = isExpired ? (
    statusIcon
  ) : (
    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
      {days > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          <Sun className={iconClassName} />
          <span className="leading-none">{days}</span>
        </div>
      )}
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        {statusIcon}
        <span className="truncate leading-none">{timeString}</span>
      </div>
    </div>
  );

  const fullTimer = (
    <div
      className={cn(
        "flex min-w-0 items-center justify-center overflow-hidden rounded-full border px-3.5 py-2 font-mono text-xs",
        statusClassName,
      )}
    >
      {timerContent}
    </div>
  );

  const fullTimerTrigger = (
    <Button
      type="button"
      variant="utility"
      size="sm"
      className={cn("rounded-full font-mono text-xs", statusClassName)}
      aria-label={t("navigation.show_session_timer")}
    >
      {timerContent}
    </Button>
  );

  const renderSessionPopover = (
    trigger: React.ReactElement,
    {
      align = "center",
      showTimer = true,
    }: SessionPopoverOptions = {},
  ) => (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side="bottom"
        sideOffset={10}
        collisionPadding={16}
        className="w-80 overflow-hidden p-0"
      >
        <SessionDetails
          title={
            <span className="text-sm font-semibold text-foreground">
              {t("token_info.session_details")}
            </span>
          }
          timer={showTimer ? fullTimer : undefined}
          decodedToken={decodedToken}
        />
      </PopoverContent>
    </Popover>
  );

  if (!compactOnNarrow) {
    return renderSessionPopover(fullTimerTrigger, {
      align: "end",
      showTimer: false,
    });
  }

  const compactTimerTrigger = (
    <Button
      type="button"
      variant="utility"
      size="icon"
      className={cn("size-9 rounded-full", statusClassName)}
      aria-label={t("navigation.show_session_timer")}
    >
      {statusIcon}
    </Button>
  );

  return (
    <>
      <div className="sm:hidden">
        <Dialog modal={false}>
          <DialogTrigger asChild>{compactTimerTrigger}</DialogTrigger>
          <DialogContent
            showCloseButton={false}
            showOverlay={false}
            className="block max-h-[calc(100dvh-6.625rem)] w-[calc(100vw-2rem)] max-w-80 gap-0 overflow-x-hidden overflow-y-auto rounded-xl border-border bg-popover p-0 shadow-[0_18px_60px_oklch(0.04_0.01_292/0.45)]"
            style={{ left: "50vw", top: "5.625rem", translate: "-50% 0" }}
          >
            <SessionDetails
              title={
                <DialogTitle className="text-sm font-semibold text-foreground">
                  {t("token_info.session_details")}
                </DialogTitle>
              }
              timer={fullTimer}
              decodedToken={decodedToken}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="hidden sm:block lg:hidden">
        {renderSessionPopover(compactTimerTrigger)}
      </div>
      <div className="hidden lg:block">
        {renderSessionPopover(fullTimerTrigger, { showTimer: false })}
      </div>
    </>
  );
};

export default CountdownTimer;
