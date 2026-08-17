import { t } from "@/lib/translations";

export type SettingsPage =
  | "sponsorships"
  | "profile"
  | "chat"
  | "features"
  | "access"
  | "intelligence"
  | "linked_profiles"
  | "usage"
  | "purchases"
  | "onboarding";

export const getSettingsPageTitle = (page: SettingsPage): string => {
  switch (page) {
    case "sponsorships":
      return t("sponsorships");
    case "profile":
      return t("profile");
    case "chat":
      return t("chat");
    case "features":
      return t("features.header");
    case "access":
      return t("access");
    case "intelligence":
      return t("intelligence");
    case "linked_profiles":
      return t("linked_profiles.page_title");
    case "usage":
      return t("usage.page_title");
    case "purchases":
      return t("purchases.page_title");
    case "onboarding":
      return t("onboarding.page_title");
  }
};
