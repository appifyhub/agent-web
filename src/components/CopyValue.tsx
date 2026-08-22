import React from "react";
import { toast } from "sonner";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

interface CopyValueProps {
  value: string | number;
}

const CopyValue: React.FC<CopyValueProps> = ({ value }) => {
  const fullValue = String(value);
  const displayValue =
    fullValue.length > 16
      ? `${fullValue.slice(0, 8)}...${fullValue.slice(-6)}`
      : fullValue;

  const spanRef = React.useRef<HTMLSpanElement>(null);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.navigator && window.navigator.clipboard) {
      await window.navigator.clipboard.writeText(fullValue);
      toast(t("copied"));
    } else {
      if (spanRef.current) {
        const range = document.createRange();
        range.selectNodeContents(spanRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="link"
      className="h-auto max-w-full cursor-pointer select-all p-0 font-mono font-light text-blue-300/70 underline decoration-dotted decoration-2 decoration-blue-300/30 underline-offset-4 hover:text-blue-200"
      onClick={handleCopy}
      title={fullValue}
      aria-label={`${t("linked_profiles.copy_key")}: ${fullValue}`}
    >
      <span ref={spanRef}>{displayValue}</span>
    </Button>
  );
};

export default CopyValue;
