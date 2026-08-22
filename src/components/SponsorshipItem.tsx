import React from "react";
import {
  Check,
  CheckCheck,
  VenetianMask,
  AtSign,
  UserX,
  ChevronDown,
  UserRound,
  Phone,
  ScrollText,
  Mail,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";
import { Platform } from "@/lib/platform";
import { SponsorshipResponse } from "@/services/sponsorships-service";
import PlatformIcon from "@/components/PlatformIcon";
import { Button } from "@/components/ui/button";

interface SponsorshipItemProps {
  sponsorship: SponsorshipResponse;
  isExpanded: boolean;
  isCollapsing: boolean;
  disabled: boolean;
  onToggle: () => void;
  onUnsponsor: () => void;
}

const SponsorshipItem: React.FC<SponsorshipItemProps> = ({
  sponsorship,
  isExpanded,
  isCollapsing,
  disabled,
  onToggle,
  onUnsponsor,
}) => {
  const displayName = (() => {
    const { full_name, platform_handle, platform } = sponsorship;

    let prefixIcon = null;
    let prefixChar = "";

    if (full_name || platform_handle) {
      if (!full_name && platform_handle) {
        if (platform === Platform.WHATSAPP) {
          prefixIcon = <Phone className="h-5 w-5 text-accent-amber shrink-0" />;
          prefixChar = "+";
        } else if (platform === Platform.TELEGRAM) {
          prefixIcon = <AtSign className="h-5 w-5 text-accent-amber shrink-0" />;
        } else {
          prefixIcon = <UserRound className="h-5 w-5 text-accent-amber translate-y-0.5 shrink-0" />;
        }
      } else if (full_name) {
        prefixIcon = <UserRound className="h-5 w-5 text-accent-amber translate-y-0.5 shrink-0" />;
      }

      return (
        <div className="flex items-center space-x-3 truncate overflow-hidden whitespace-nowrap">
          {prefixIcon}
          <span className="font-normal truncate overflow-hidden whitespace-nowrap">
            {prefixChar}
            {full_name || platform_handle}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 truncate overflow-hidden whitespace-nowrap">
        <VenetianMask className="h-5 w-5 text-accent-amber shrink-0" />
        <span className="font-normal truncate overflow-hidden whitespace-nowrap">
          {t("sponsorship.incognito")}
        </span>
      </div>
    );
  })();

  const statusLabel = sponsorship.accepted_at
    ? t("sponsorship.details.accepted")
    : t("sponsorship.details.received");

  const boolLabel = (value: boolean) =>
    value ? t("sponsorship.details.yes") : t("sponsorship.details.no");

  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
      style={{
        gridTemplateRows: isCollapsing ? "0fr" : "1fr",
        opacity: isCollapsing ? 0 : 1,
      }}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "flex flex-col cursor-pointer w-full",
            "transition-all duration-300 ease-in-out",
            isExpanded ? "py-5" : "py-[0.85rem]",
          )}
          onClick={onToggle}
        >
          {/* collapsed row */}
          <div className="flex w-full cursor-pointer items-center">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="min-w-0">{displayName}</div>
              {!isExpanded &&
                (sponsorship.accepted_at ? (
                  <CheckCheck className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-success shrink-0" />
                ))}
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300",
                isExpanded ? "text-foreground rotate-180" : "rotate-0",
              )}
            />
          </div>

          {/* expanded details */}
          <div
            className="grid w-full transition-[grid-template-rows,opacity] duration-300 ease-in-out"
            style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
          >
            <div
              className={cn(
                "overflow-hidden transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className={cn(
                  "flex flex-col w-full transition-[gap,padding] duration-300 ease-in-out",
                  isExpanded ? "gap-3 pt-[1rem]" : "gap-0 pt-0",
                )}
              >
                <div className="flex flex-col gap-y-2 gap-x-2 w-full md:grid md:grid-cols-2">
                  <div className="bg-[oklch(0.22_0.02_292)] rounded-md space-y-1 p-[1rem]">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase truncate">
                      {t("sponsorship.details.identity_title")}
                    </h4>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground min-w-0 truncate flex items-center gap-2">
                          <PlatformIcon
                            platform={sponsorship.platform ?? Platform.UNKNOWN}
                            className="h-4 w-4 shrink-0"
                          />
                          {t("sponsorship.details.platform")}
                        </span>
                        <span className="shrink-0">
                          {Platform.getName(sponsorship.platform ?? Platform.UNKNOWN)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground min-w-0 truncate flex items-center gap-2">
                          {sponsorship.accepted_at ? (
                            <CheckCheck className="h-4 w-4 text-success shrink-0" />
                          ) : (
                            <Check className="h-4 w-4 text-success shrink-0" />
                          )}
                          {t("sponsorship.details.status")}
                        </span>
                        <span className="shrink-0">{statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[oklch(0.22_0.02_292)] rounded-md space-y-1 p-[1rem]">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase truncate">
                      {t("sponsorship.details.account_title")}
                    </h4>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground min-w-0 truncate flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-200 shrink-0" />
                          {t("sponsorship.details.waitlist")}
                        </span>
                        <span
                          className={cn(
                            "shrink-0",
                            sponsorship.is_on_waitlist ? "text-accent-amber" : "text-success",
                          )}
                        >
                          {boolLabel(sponsorship.is_on_waitlist)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex justify-between gap-4",
                          !sponsorship.is_on_waitlist && "line-through opacity-40",
                        )}
                      >
                        <span className="text-muted-foreground min-w-0 truncate flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-200 shrink-0" />
                          {t("sponsorship.details.invited")}
                        </span>
                        <span
                          className={cn(
                            "shrink-0",
                            sponsorship.is_invited_to_start ? "text-success" : "text-muted-foreground",
                          )}
                        >
                          {boolLabel(sponsorship.is_invited_to_start)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground min-w-0 truncate flex items-center gap-2">
                          <ScrollText className="h-4 w-4 text-blue-200 shrink-0" />
                          {t("sponsorship.details.policies")}
                        </span>
                        <span
                          className={cn(
                            "shrink-0",
                            sponsorship.are_policies_accepted ? "text-success" : "text-muted-foreground",
                          )}
                        >
                          {boolLabel(sponsorship.are_policies_accepted)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-white bg-[oklch(0.3_0.08_290)]/80 border border-purple-400/20 cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onUnsponsor();
                    }}
                    disabled={disabled}
                  >
                    <UserX className="h-4 w-4 mr-1.5" />
                    {t("sponsorship.unlink")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipItem;
