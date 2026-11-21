import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/translations";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionButtonText: string;
  onActionClicked: () => void;
  actionDisabled?: boolean;
  isActionPending?: boolean;
  cancelButtonText?: string;
  destructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  actionButtonText,
  onActionClicked,
  actionDisabled = false,
  isActionPending = false,
  cancelButtonText,
  destructive = false,
}) => {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isActionPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isActionPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => handleOpenChange(false)}
            disabled={isActionPending}
          >
            {cancelButtonText ?? t("command_line.cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="cursor-pointer"
            onClick={onActionClicked}
            disabled={actionDisabled || isActionPending}
          >
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
