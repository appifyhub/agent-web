import {
  trackSettingSaved,
  trackSettingsSaved,
  type AnalyticsSettingState,
  type AnalyticsSettingsArea,
} from "@/lib/analytics";
import type { ApiError } from "@/lib/api-error";
import type { UserSettingsPayload } from "@/services/user-settings-service";
import type {
  ChatConfig,
  UserChatConfig,
} from "@/services/chat-settings-service";

type PayloadField = keyof UserSettingsPayload;

const FIELD_AREAS: Record<PayloadField, AnalyticsSettingsArea> = {
  full_name: "profile",
  about_me: "profile",
  custom_prompt: "profile",
  are_policies_accepted: "profile",
  open_ai_key: "access",
  anthropic_key: "access",
  google_ai_key: "access",
  perplexity_key: "access",
  replicate_key: "access",
  rapid_api_key: "access",
  coinmarketcap_key: "access",
  twelve_data_api_key: "access",
  x_key: "access",
  x_ai_key: "access",
  tool_choice_chat: "intelligence",
  tool_choice_reasoning: "intelligence",
  tool_choice_copywriting: "intelligence",
  tool_choice_vision: "intelligence",
  tool_choice_hearing: "intelligence",
  tool_choice_images_gen: "intelligence",
  tool_choice_videos_gen: "intelligence",
  tool_choice_search: "intelligence",
  tool_choice_embedding: "intelligence",
  tool_choice_api_fiat_exchange: "intelligence",
  tool_choice_api_crypto_exchange: "intelligence",
  tool_choice_api_stock_quote: "intelligence",
  tool_choice_api_twitter: "intelligence",
};

// intelligence tool choices carry stable backend tool ids, so the selected
// option is safe to report; every other field reports presence state only
const OPTION_FIELDS = new Set<PayloadField>([
  "tool_choice_chat",
  "tool_choice_reasoning",
  "tool_choice_copywriting",
  "tool_choice_vision",
  "tool_choice_hearing",
  "tool_choice_images_gen",
  "tool_choice_videos_gen",
  "tool_choice_search",
  "tool_choice_embedding",
  "tool_choice_api_fiat_exchange",
  "tool_choice_api_crypto_exchange",
  "tool_choice_api_stock_quote",
  "tool_choice_api_twitter",
]);

const CREDENTIAL_FIELDS = new Set<PayloadField>([
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
]);

const getFieldState = (
  field: PayloadField,
  value: string | boolean,
): AnalyticsSettingState => {
  if (typeof value === "boolean") return value ? "enabled" : "disabled";
  if (!value) return "cleared";
  return CREDENTIAL_FIELDS.has(field) ? "configured" : "present";
};

export const trackUserSettingsSaved = (
  area: AnalyticsSettingsArea,
  payload: UserSettingsPayload,
): void => {
  const fields = Object.keys(payload) as PayloadField[];

  trackSettingsSaved({
    area,
    result: "success",
    changedFieldCount: fields.length,
  });

  fields.forEach((field) => {
    const value = payload[field];
    if (value === undefined) return;

    trackSettingSaved({
      area: FIELD_AREAS[field],
      settingId: field,
      state: getFieldState(field, value),
      optionId:
        OPTION_FIELDS.has(field) && typeof value === "string" && value
          ? value
          : undefined,
    });
  });
};

export const trackUserSettingsFailed = (
  area: AnalyticsSettingsArea,
  payload: UserSettingsPayload,
  saveError: unknown,
): void => {
  const apiError = saveError as Partial<ApiError> | null;

  trackSettingsSaved({
    area,
    result: "failure",
    changedFieldCount: Object.keys(payload).length,
    apiErrorCode:
      typeof apiError?.errorCode === "number" ? apiError.errorCode : undefined,
    httpStatus:
      typeof apiError?.httpStatus === "number" ? apiError.httpStatus : undefined,
  });
};

// `language_name` is deliberately excluded below: it carries display text,
// while `language_iso_code` identifies the same choice as a stable id
type ChatConfigPayload = Pick<
  ChatConfig,
  | "language_iso_code"
  | "reply_chance_percent"
  | "release_notifications"
  | "media_mode"
> & { language_name?: string };

type UserChatConfigPayload = Pick<
  UserChatConfig,
  | "use_about_me"
  | "use_custom_prompt"
  | "max_output_tokens"
  | "max_chat_history_depth"
  | "max_iterations"
>;

const emitChatField = (
  settingId: string,
  value: string | number | boolean | undefined,
): void => {
  if (value === undefined) return;
  if (typeof value === "boolean") {
    trackSettingSaved({
      area: "chat",
      settingId,
      state: value ? "enabled" : "disabled",
    });
    return;
  }
  trackSettingSaved({
    area: "chat",
    settingId,
    state: "updated",
    optionId: String(value),
  });
};

// `language_name` is never reported, so it must not inflate the field count
const countChatFields = (
  chatConfig?: ChatConfigPayload,
  userChatConfig?: UserChatConfigPayload,
): number =>
  (chatConfig
    ? Object.keys(chatConfig).filter((key) => key !== "language_name").length
    : 0) + (userChatConfig ? Object.keys(userChatConfig).length : 0);

export const trackChatSettingsSaved = (
  chatConfig?: ChatConfigPayload,
  userChatConfig?: UserChatConfigPayload,
): void => {
  trackSettingsSaved({
    area: "chat",
    result: "success",
    changedFieldCount: countChatFields(chatConfig, userChatConfig),
  });

  if (chatConfig) {
    emitChatField("language_iso_code", chatConfig.language_iso_code);
    emitChatField("reply_chance_percent", chatConfig.reply_chance_percent);
    emitChatField("release_notifications", chatConfig.release_notifications);
    emitChatField("media_mode", chatConfig.media_mode);
  }

  if (userChatConfig) {
    emitChatField("use_about_me", userChatConfig.use_about_me);
    emitChatField("use_custom_prompt", userChatConfig.use_custom_prompt);
    emitChatField("max_output_tokens", userChatConfig.max_output_tokens);
    emitChatField(
      "max_chat_history_depth",
      userChatConfig.max_chat_history_depth,
    );
    emitChatField("max_iterations", userChatConfig.max_iterations);
  }
};

export const trackChatSettingsFailed = (
  chatConfig: ChatConfigPayload | undefined,
  userChatConfig: UserChatConfigPayload | undefined,
  saveError: unknown,
): void => {
  const apiError = saveError as Partial<ApiError> | null;

  trackSettingsSaved({
    area: "chat",
    result: "failure",
    changedFieldCount: countChatFields(chatConfig, userChatConfig),
    apiErrorCode:
      typeof apiError?.errorCode === "number" ? apiError.errorCode : undefined,
    httpStatus:
      typeof apiError?.httpStatus === "number"
        ? apiError.httpStatus
        : undefined,
  });
};
