import React from "react";
import CopyValue from "@/components/CopyValue";
import type { LucideIcon } from "lucide-react";
import { AtSign, Hash, Radio, Rocket } from "lucide-react";
import type { DecodedToken } from "@/lib/tokens";
import { t } from "@/lib/translations";

export interface TokenSummaryItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

interface TokenSummaryProps {
  decoded: DecodedToken;
}

const TokenSummary: React.FC<TokenSummaryProps> = ({ decoded }) => {
  const items: TokenSummaryItem[] = [
    { label: t("token_info.profile_id"), value: decoded.sub, icon: Hash },
    {
      label: t("token_info.platform"),
      value:
        decoded.platform?.charAt(0).toUpperCase() +
          decoded.platform?.slice(1) || decoded.platform,
      icon: Radio,
    },
    decoded.platform_id && {
      label: t("token_info.platform_user_id"),
      value: decoded.platform_id,
      icon: Hash,
    },
    decoded.platform_handle &&
      decoded.platform_handle !== decoded.platform_id && {
        label: t("token_info.platform_handle"),
        value: decoded.platform_handle,
        icon: AtSign,
      },
    { label: t("token_info.version"), value: decoded.version, icon: Rocket },
  ].filter(Boolean) as TokenSummaryItem[];

  return (
    <div className="grid gap-3 px-4 py-4 text-xs">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-2"
        >
          {React.createElement(item.icon, {
            className: "mt-0.5 size-4 text-muted-foreground/60",
          })}
          <div className="min-w-0">
            <div className="text-muted-foreground">{item.label}</div>
            <div className="mt-0.5 min-w-0 text-foreground">
              <CopyValue value={item.value} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenSummary;
