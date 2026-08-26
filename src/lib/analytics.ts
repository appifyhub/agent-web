import { Platform } from "@/lib/platform";
import type { SettingsPage } from "@/lib/settings-pages";
import type { DecodedToken } from "@/lib/tokens";
import type { ChatSettings } from "@/services/chat-settings-service";
import type { UserSettings } from "@/services/user-settings-service";

export type AnalyticsPageId = SettingsPage | "not_found";
export type AnalyticsPageState = "ready" | "auth_error" | "not_found";
export type AnalyticsErrorCategory = "not_found" | "authentication";
export type AnalyticsPageErrorCode =
  | "route_not_found"
  | "token_missing"
  | "token_invalid"
  | "token_expired_initial"
  | "token_expired_runtime"
  | "api_authentication_failed";
export type AnalyticsAccountStatus = "waitlisted" | "invited" | "active";
export type AnalyticsAccessMode =
  | "sponsored"
  | "keys"
  | "credits"
  | "mixed"
  | "none";
export type AnalyticsChatKind = "private" | "group";
export type AnalyticsChatRole = "admin" | "member";
export type AnalyticsChatOwnership = "own" | "shared";
export type AnalyticsSettingsArea =
  | "profile"
  | "chat"
  | "access"
  | "intelligence";
export type AnalyticsResult = "success" | "failure" | "cancelled";
export type AnalyticsSettingState =
  | "enabled"
  | "disabled"
  | "configured"
  | "cleared"
  | "updated"
  | "present"
  | "absent";
export type AnalyticsOnboardingAction =
  | "view"
  | "continue"
  | "back"
  | "skip"
  | "complete";
export type AnalyticsFeatureId =
  | "credit_transfer"
  | "store_picker"
  | "product_link"
  | "license_binding"
  | "sponsorship"
  | "linked_profile_key"
  | "linked_profile_connection"
  | "help_guide"
  | "interface_language"
  | "auth_required_recovery"
  | "not_found_recovery"
  | "purchase";
export type AnalyticsFeatureAction =
  | "open"
  | "cancel"
  | "submit"
  | "complete"
  | "view"
  | "copy"
  | "share"
  | "regenerate"
  | "connect"
  | "add"
  | "remove"
  | "unlink"
  | "change"
  | "return";
export type AnalyticsReportId = "usage" | "purchases";

interface AnalyticsEnvironment {
  origin: string;
  measurementId: string;
  debugMode: boolean;
}

export interface AnalyticsUserProperties {
  accountStatus: AnalyticsAccountStatus;
  accessMode: AnalyticsAccessMode;
  sourcePlatform: Platform;
  backendVersion?: string;
}

export interface AnalyticsIdentity {
  userId: string;
  userProperties: AnalyticsUserProperties;
}

export interface AnalyticsChatContext {
  chatPlatform: Platform;
  chatKind: AnalyticsChatKind;
  chatRole: AnalyticsChatRole;
  chatOwnership: AnalyticsChatOwnership;
}

export interface AnalyticsErrorDetails {
  apiErrorCode?: number;
  httpStatus?: number;
}

export interface AnalyticsPageViewInput {
  pageId: AnalyticsPageId;
  pageState: AnalyticsPageState;
  occurrenceId: string;
  interfaceLanguage: string;
  identity?: AnalyticsIdentity | null;
  chatContext?: AnalyticsChatContext;
}

export interface AnalyticsPageErrorInput extends AnalyticsErrorDetails {
  pageId: AnalyticsPageId;
  occurrenceId: string;
  errorCategory: AnalyticsErrorCategory;
  errorCode: AnalyticsPageErrorCode;
}

export interface AnalyticsSettingsSavedInput extends AnalyticsErrorDetails {
  area: AnalyticsSettingsArea;
  result: Exclude<AnalyticsResult, "cancelled">;
  changedFieldCount: number;
}

export interface AnalyticsSettingSavedInput {
  area: AnalyticsSettingsArea;
  settingId: string;
  state?: AnalyticsSettingState;
  optionId?: string;
}

export interface AnalyticsOnboardingProgressInput {
  stepId: string;
  action: AnalyticsOnboardingAction;
  choiceId?: string;
  choiceEnabled?: boolean;
}

export interface AnalyticsFeatureActionInput extends AnalyticsErrorDetails {
  featureId: AnalyticsFeatureId;
  action: AnalyticsFeatureAction;
  result?: AnalyticsResult;
  optionId?: string;
  sourceArea?: AnalyticsPageId;
}

export interface AnalyticsReportFilterInput {
  reportId: AnalyticsReportId;
  filterId: string;
  optionId: string;
}

type AnalyticsEventName =
  | "page_view"
  | "page_error"
  | "onboarding_progress"
  | "settings_saved"
  | "setting_saved"
  | "feature_action"
  | "report_filter_changed";
type AnalyticsParameter = string | number | boolean | null;
type AnalyticsParameters = Record<string, AnalyticsParameter>;
type Gtag = (...args: unknown[]) => void;

interface CanonicalPageContext {
  pageId: AnalyticsPageId;
  pageState: AnalyticsPageState;
  location: string;
  title: string;
  referrer: string;
  interfaceLanguage: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: Gtag;
  }
}

const PAGE_PATHS: Record<AnalyticsPageId, string> = {
  sponsorships: "/app/sponsorships",
  profile: "/app/profile",
  chat: "/app/chat",
  help: "/app/help",
  access: "/app/access",
  intelligence: "/app/intelligence",
  linked_profiles: "/app/linked-profiles",
  usage: "/app/usage",
  purchases: "/app/purchases",
  onboarding: "/app/onboarding",
  not_found: "/app/not-found",
};

const APP_NAME = import.meta.env.VITE_APP_NAME_SHORT;
const PAGE_TITLES: Record<AnalyticsPageId, string> = {
  sponsorships: `${APP_NAME} | Sponsorships`,
  profile: `${APP_NAME} | Profile`,
  chat: `${APP_NAME} | Chat`,
  help: `${APP_NAME} | Help`,
  access: `${APP_NAME} | Access`,
  intelligence: `${APP_NAME} | Intelligence`,
  linked_profiles: `${APP_NAME} | Linked Profiles`,
  usage: `${APP_NAME} | Usage`,
  purchases: `${APP_NAME} | Purchases`,
  onboarding: `${APP_NAME} | Onboarding`,
  not_found: `${APP_NAME} | Not Found`,
};

const API_KEY_FIELDS: ReadonlyArray<keyof UserSettings> = [
  "open_ai_key",
  "anthropic_key",
  "google_ai_key",
  "perplexity_key",
  "replicate_key",
  "rapid_api_key",
  "coinmarketcap_key",
  "twelve_data_api_key",
  "x_key",
  "x_ai_key",
];
const STABLE_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const CONTROLLED_VALUE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;
const USER_ID_PATTERN = /^[a-fA-F0-9-]{1,64}$/;

let environment: AnalyticsEnvironment | null | undefined;
let isConfigured = false;
let currentIdentity: AnalyticsIdentity | null = null;
let currentPageContext: CanonicalPageContext | null = null;
let lastPageOccurrenceKey: string | null = null;
const activeErrorFingerprints = new Map<string, string>();

const getEnvironment = (): AnalyticsEnvironment | null => {
  if (environment !== undefined) return environment;
  if (typeof window === "undefined") {
    environment = null;
    return environment;
  }

  const appBaseUrl = import.meta.env.VITE_APP_BASE_URL;
  const measurementId = import.meta.env.VITE_ANALYTICS_MEASUREMENT_ID;
  if (!appBaseUrl || !MEASUREMENT_ID_PATTERN.test(measurementId || "")) {
    environment = null;
    return environment;
  }

  try {
    const appUrl = new URL(appBaseUrl);
    if (appUrl.hostname !== window.location.hostname) {
      environment = null;
      return environment;
    }
    environment = {
      origin: appUrl.origin,
      measurementId,
      debugMode: import.meta.env.VITE_ANALYTICS_DEBUG_MODE === "true",
    };
  } catch {
    environment = null;
  }
  return environment;
};

const stableId = (value: string | undefined): string | undefined =>
  value && STABLE_ID_PATTERN.test(value) ? value : undefined;

const getAccountStatus = (
  userSettings: UserSettings,
): AnalyticsAccountStatus => {
  if (userSettings.are_policies_accepted) return "active";
  if (
    userSettings.is_on_waitlist &&
    !userSettings.is_invited_to_start
  ) {
    return "waitlisted";
  }
  return "invited";
};

const getAccessMode = (userSettings: UserSettings): AnalyticsAccessMode => {
  if (userSettings.is_sponsored) return "sponsored";
  const hasKeys = API_KEY_FIELDS.some((field) => Boolean(userSettings[field]));
  const hasCredits = userSettings.credit_balance > 0;
  if (hasKeys && hasCredits) return "mixed";
  if (hasKeys) return "keys";
  if (hasCredits) return "credits";
  return "none";
};

export const buildAnalyticsIdentity = (
  decodedToken: DecodedToken,
  userSettings: UserSettings,
): AnalyticsIdentity | null => {
  if (!USER_ID_PATTERN.test(decodedToken.sub)) return null;
  return {
    userId: decodedToken.sub,
    userProperties: {
      accountStatus: getAccountStatus(userSettings),
      accessMode: getAccessMode(userSettings),
      sourcePlatform: decodedToken.platform,
      backendVersion: CONTROLLED_VALUE_PATTERN.test(decodedToken.version)
        ? decodedToken.version
        : undefined,
    },
  };
};

export const buildAnalyticsChatContext = (
  chatSettings: ChatSettings,
): AnalyticsChatContext => ({
  chatPlatform: Platform.fromString(chatSettings.chat_config.platform),
  chatKind: chatSettings.chat_config.is_private ? "private" : "group",
  chatRole: chatSettings.chat_config.is_admin ? "admin" : "member",
  chatOwnership: chatSettings.chat_config.is_own ? "own" : "shared",
});

const getUserProperties = (
  identity: AnalyticsIdentity | null,
): AnalyticsParameters => ({
  account_status: identity?.userProperties.accountStatus ?? null,
  access_mode: identity?.userProperties.accessMode ?? null,
  source_platform: identity?.userProperties.sourcePlatform ?? null,
  backend_version: identity?.userProperties.backendVersion ?? null,
});

const getConfig = (
  pageContext: CanonicalPageContext,
): AnalyticsParameters => ({
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  page_location: pageContext.location,
  page_title: pageContext.title,
  page_referrer: pageContext.referrer,
  user_id: currentIdentity?.userId ?? null,
  debug_mode: environment?.debugMode ?? false,
});

const loadAnalytics = (pageContext: CanonicalPageContext): boolean => {
  const selectedEnvironment = getEnvironment();
  if (!selectedEnvironment || typeof document === "undefined") return false;

  if (!window.dataLayer) window.dataLayer = [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    isConfigured = false;
  }

  if (!isConfigured) {
    window.gtag("js", new Date());
  }
  window.gtag("set", "user_properties", getUserProperties(currentIdentity));
  window.gtag(
    "config",
    selectedEnvironment.measurementId,
    getConfig(pageContext),
  );

  if (!isConfigured) {
    const tagSrc = `https://www.googletagmanager.com/gtag/js?id=${selectedEnvironment.measurementId}`;
    if (!document.querySelector(`script[src="${tagSrc}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = tagSrc;
      document.head.append(script);
    }
    isConfigured = true;
  }

  return true;
};

const sendEvent = (
  eventName: AnalyticsEventName,
  parameters: AnalyticsParameters,
): void => {
  if (!environment || !currentPageContext || !window.gtag) return;
  window.gtag("event", eventName, {
    ...parameters,
    page_location: currentPageContext.location,
    page_title: currentPageContext.title,
    page_referrer: currentPageContext.referrer,
    debug_mode: environment.debugMode,
  });
};

const addErrorDetails = (
  parameters: AnalyticsParameters,
  details: AnalyticsErrorDetails,
): void => {
  if (
    details.apiErrorCode !== undefined &&
    Number.isSafeInteger(details.apiErrorCode)
  ) {
    parameters.api_error_code = details.apiErrorCode;
  }
  if (
    details.httpStatus !== undefined &&
    Number.isSafeInteger(details.httpStatus)
  ) {
    parameters.http_status = details.httpStatus;
  }
};

export const trackPageView = (input: AnalyticsPageViewInput): void => {
  const selectedEnvironment = getEnvironment();
  if (!selectedEnvironment) return;

  const interfaceLanguage = stableId(input.interfaceLanguage);
  if (!interfaceLanguage) return;

  const occurrenceKey = `${input.occurrenceId}:${input.pageId}:${input.pageState}`;
  if (lastPageOccurrenceKey === occurrenceKey) return;

  if (input.identity !== undefined) currentIdentity = input.identity;
  const pageContext: CanonicalPageContext = {
    pageId: input.pageId,
    pageState: input.pageState,
    location: `${selectedEnvironment.origin}${PAGE_PATHS[input.pageId]}`,
    title: PAGE_TITLES[input.pageId],
    referrer: currentPageContext?.location ?? "",
    interfaceLanguage,
  };

  if (!loadAnalytics(pageContext)) return;
  currentPageContext = pageContext;
  lastPageOccurrenceKey = occurrenceKey;
  activeErrorFingerprints.clear();

  const parameters: AnalyticsParameters = {
    page_id: input.pageId,
    page_state: input.pageState,
    interface_language: interfaceLanguage,
  };
  if (input.pageId === "chat" && input.chatContext) {
    parameters.chat_platform = input.chatContext.chatPlatform;
    parameters.chat_kind = input.chatContext.chatKind;
    parameters.chat_role = input.chatContext.chatRole;
    parameters.chat_ownership = input.chatContext.chatOwnership;
  }
  sendEvent("page_view", parameters);
};

export const clearAnalyticsIdentity = (): void => {
  currentIdentity = null;
  if (!currentPageContext || !isConfigured || !window.gtag || !environment) {
    return;
  }
  window.gtag("set", "user_properties", getUserProperties(null));
  window.gtag(
    "config",
    environment.measurementId,
    getConfig(currentPageContext),
  );
};

export const trackPageError = (input: AnalyticsPageErrorInput): void => {
  const scope = `${input.occurrenceId}:${input.pageId}`;
  const fingerprint = [
    input.errorCategory,
    input.errorCode,
    input.apiErrorCode ?? "",
    input.httpStatus ?? "",
  ].join(":");
  if (activeErrorFingerprints.get(scope) === fingerprint) return;

  const parameters: AnalyticsParameters = {
    page_id: input.pageId,
    error_category: input.errorCategory,
    error_code: input.errorCode,
  };
  addErrorDetails(parameters, input);
  sendEvent("page_error", parameters);
  if (currentPageContext) activeErrorFingerprints.set(scope, fingerprint);
};

export const clearPageError = (
  pageId: AnalyticsPageId,
  occurrenceId: string,
): void => {
  activeErrorFingerprints.delete(`${occurrenceId}:${pageId}`);
};

export const trackSettingsSaved = (
  input: AnalyticsSettingsSavedInput,
): void => {
  const parameters: AnalyticsParameters = {
    area: input.area,
    result: input.result,
    changed_field_count: Number.isFinite(input.changedFieldCount)
      ? Math.max(0, Math.trunc(input.changedFieldCount))
      : 0,
  };
  addErrorDetails(parameters, input);
  sendEvent("settings_saved", parameters);
};

export const trackSettingSaved = (
  input: AnalyticsSettingSavedInput,
): void => {
  const settingId = stableId(input.settingId);
  const optionId = stableId(input.optionId);
  if (!settingId || (!input.state && !optionId)) return;

  const parameters: AnalyticsParameters = {
    area: input.area,
    setting_id: settingId,
  };
  if (input.state) parameters.state = input.state;
  if (optionId) parameters.option_id = optionId;
  sendEvent("setting_saved", parameters);
};

export const trackOnboardingProgress = (
  input: AnalyticsOnboardingProgressInput,
): void => {
  const stepId = stableId(input.stepId);
  const choiceId = stableId(input.choiceId);
  if (!stepId) return;

  const parameters: AnalyticsParameters = {
    step_id: stepId,
    action: input.action,
  };
  if (choiceId) parameters.option_id = choiceId;
  if (input.choiceEnabled !== undefined) {
    parameters.state = input.choiceEnabled ? "enabled" : "disabled";
  }
  sendEvent("onboarding_progress", parameters);
};

export const trackFeatureAction = (
  input: AnalyticsFeatureActionInput,
): void => {
  const optionId = stableId(input.optionId);
  const parameters: AnalyticsParameters = {
    feature_id: input.featureId,
    action: input.action,
  };
  if (input.result) parameters.result = input.result;
  if (optionId) parameters.option_id = optionId;
  if (input.sourceArea) parameters.source_area = input.sourceArea;
  addErrorDetails(parameters, input);
  sendEvent("feature_action", parameters);
};

export const trackReportFilterChanged = (
  input: AnalyticsReportFilterInput,
): void => {
  const filterId = stableId(input.filterId);
  const optionId = stableId(input.optionId);
  if (!filterId || !optionId) return;
  sendEvent("report_filter_changed", {
    report_id: input.reportId,
    filter_id: filterId,
    option_id: optionId,
  });
};
