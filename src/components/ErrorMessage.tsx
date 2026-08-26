import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  title: React.ReactNode;
  description: React.ReactNode;
  genericMessage?: React.ReactNode;
  isBlocker?: boolean;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  description,
  genericMessage,
  isBlocker = false,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);
  const autoDismissTime = 5000;

  useEffect(() => {
    if (isBlocker || !onDismiss) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoDismissTime) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 16);

    const timeout = setTimeout(() => {
      onDismiss();
    }, autoDismissTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isBlocker, onDismiss]);

  const alertContent = (
    <Alert
      aria-hidden={isBlocker || undefined}
      className="relative w-full space-y-2 overflow-hidden rounded-xl border-destructive/35 bg-card px-6 py-4 shadow-2xl shadow-black/60"
    >
      {!isBlocker && onDismiss && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-foreground/10">
          <div
            className="h-full bg-destructive/35 transition-all duration-16 linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <AlertCircle className="scale-120 text-destructive" />
      <AlertTitle className="text-[1.04rem] font-bold font-sans text-foreground">
        {title}
      </AlertTitle>
      <AlertDescription className="text-[1.05rem] font-sans text-foreground">
        {description}
        {genericMessage && (
          <>
            <br />
            {genericMessage}
          </>
        )}
      </AlertDescription>
    </Alert>
  );

  if (isBlocker) {
    return (
      <Dialog open>
        <DialogPortal>
          <DialogOverlay className="z-[100] bg-black/80" />
        </DialogPortal>
        <DialogContent
          showCloseButton={false}
          role="alertdialog"
          showOverlay={false}
          className="z-[101] border-0 bg-transparent p-0 shadow-none sm:max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
            {genericMessage && <> {genericMessage}</>}
          </DialogDescription>
          {alertContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="max-w-md mx-auto fixed bottom-5 lg:top-30 inset-x-0 px-6 z-50">
      {alertContent}
    </div>
  );
};

export default ErrorMessage;
