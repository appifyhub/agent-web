import React from "react";
import SettingSelector from "@/components/SettingSelector";
import SettingToggle from "@/components/SettingToggle";
import SettingsSection from "@/components/settings/SettingsSection";
import { LLM_LANGUAGES } from "@/lib/languages";
import { t } from "@/lib/translations";
import type {
  ChatConfig,
  ChatSettings,
  MediaModeSetting,
  ReleaseNotificationsSetting,
  UserChatConfig,
} from "@/services/chat-settings-service";

const OUTPUT_TOKEN_OPTIONS = [300, 1500, 5000, 15000, 300000, 1500000];
const HISTORY_DEPTH_OPTIONS = [1, 5, 10, 50, 100, 200];
const ITERATION_OPTIONS = [1, 2, 5, 10, 20, 50];

interface ChatSettingsFormProps {
  chatSettings: ChatSettings;
  remoteSettings: ChatSettings | null;
  botName: string;
  disabled: boolean;
  onChatConfigChange: (changes: Partial<ChatConfig>) => void;
  onUserChatConfigChange: (changes: Partial<UserChatConfig>) => void;
  onChatConfigRestore: (keys: (keyof ChatConfig)[]) => void;
  onUserChatConfigRestore: (keys: (keyof UserChatConfig)[]) => void;
  onProfileLinkClick: () => void;
}

const closestOption = (value: number, options: number[]): number =>
  options.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );

const ChatSettingsForm: React.FC<ChatSettingsFormProps> = ({
  chatSettings,
  remoteSettings,
  botName,
  disabled,
  onChatConfigChange,
  onUserChatConfigChange,
  onChatConfigRestore,
  onUserChatConfigRestore,
  onProfileLinkClick,
}) => {
  const { chat_config: chatConfig, user_chat_config: userChatConfig } =
    chatSettings;
  const remoteChatConfig = remoteSettings?.chat_config;
  const remoteUserChatConfig = remoteSettings?.user_chat_config;
  const fieldClassName = "settings-field";

  return (
    <div className="flex flex-col gap-5">
      {chatConfig.is_admin && (
        <SettingsSection
          title={t("chat_context.defaults")}
        >
          <SettingSelector
            label={t("preferred_language_label", { botName })}
            value={chatConfig.language_iso_code || undefined}
            onChange={(languageIsoCode) => {
              const languageName = LLM_LANGUAGES.find(
                (language) => language.isoCode === languageIsoCode,
              )?.defaultName;
              onChatConfigChange({
                language_iso_code: languageIsoCode,
                language_name: languageName,
              });
            }}
            onUndo={
              chatConfig.language_iso_code !==
              remoteChatConfig?.language_iso_code
                ? () =>
                    onChatConfigRestore([
                      "language_iso_code",
                      "language_name",
                    ])
                : undefined
            }
            options={LLM_LANGUAGES.map((language) => ({
              value: language.isoCode,
              label: (
                <div className="flex items-center gap-2">
                  <span>{language.flagEmoji}</span>
                  <span>{language.localizedName}</span>
                  <span className="text-muted-foreground">
                    ({language.defaultName})
                  </span>
                </div>
              ),
              disabled: language.isoCode === chatConfig.language_iso_code,
            }))}
            disabled={disabled}
            placeholder={
              disabled ? "—" : t("preferred_language_placeholder")
            }
            className={fieldClassName}
            variant="section"
          />

          <SettingSelector
            label={t("notifications.releases_label", { botName })}
            value={chatConfig.release_notifications || undefined}
            onChange={(releaseNotifications) =>
              onChatConfigChange({
                release_notifications:
                  releaseNotifications as ReleaseNotificationsSetting,
              })
            }
            onUndo={
              chatConfig.release_notifications !==
              remoteChatConfig?.release_notifications
                ? () => onChatConfigRestore(["release_notifications"])
                : undefined
            }
            options={[
              {
                value: "none",
                label: t("notifications.releases_choice_none"),
                disabled: chatConfig.release_notifications === "none",
              },
              {
                value: "major",
                label: t("notifications.releases_choice_major"),
                disabled: chatConfig.release_notifications === "major",
              },
              {
                value: "minor",
                label: t("notifications.releases_choice_minor"),
                disabled: chatConfig.release_notifications === "minor",
              },
              {
                value: "all",
                label: t("notifications.releases_choice_all"),
                disabled: chatConfig.release_notifications === "all",
              },
            ]}
            disabled={disabled}
            placeholder={
              disabled ? "—" : t("notifications.releases_placeholder")
            }
            className={fieldClassName}
            variant="section"
          />

          <SettingSelector
            label={t("media.mode_label", { botName })}
            value={chatConfig.media_mode || undefined}
            onChange={(mediaMode) =>
              onChatConfigChange({ media_mode: mediaMode as MediaModeSetting })
            }
            onUndo={
              chatConfig.media_mode !== remoteChatConfig?.media_mode
                ? () => onChatConfigRestore(["media_mode"])
                : undefined
            }
            options={[
              {
                value: "photo",
                label: t("media.mode_choice_photo"),
                disabled: chatConfig.media_mode === "photo",
              },
              {
                value: "file",
                label: t("media.mode_choice_file"),
                disabled: chatConfig.media_mode === "file",
              },
              {
                value: "all",
                label: t("media.mode_choice_all"),
                disabled: chatConfig.media_mode === "all",
              },
            ]}
            disabled={disabled}
            placeholder={disabled ? "—" : t("media.mode_placeholder")}
            className={fieldClassName}
            variant="section"
          />

          {!chatConfig.is_private && (
            <SettingSelector
              label={t("spontaneous_label", { botName })}
              value={
                typeof chatConfig.reply_chance_percent === "number"
                  ? String(chatConfig.reply_chance_percent)
                  : undefined
              }
              onChange={(replyChancePercent) =>
                onChatConfigChange({
                  reply_chance_percent: Number(replyChancePercent),
                })
              }
              onUndo={
                chatConfig.reply_chance_percent !==
                remoteChatConfig?.reply_chance_percent
                  ? () => onChatConfigRestore(["reply_chance_percent"])
                  : undefined
              }
              options={Array.from({ length: 11 }, (_, index) => ({
                value: String(index * 10),
                label:
                  index === 0
                    ? t("never")
                    : index === 10
                      ? t("always")
                      : t("reply_frequency", { percent: index * 10 }),
                disabled:
                  String(index * 10) ===
                  String(chatConfig.reply_chance_percent ?? ""),
              }))}
              disabled={disabled}
              placeholder={
                disabled ? "—" : t("spontaneous_placeholder")
              }
              className={fieldClassName}
              variant="section"
            />
          )}
        </SettingsSection>
      )}

      <SettingsSection
        title={t("chat_context.response_behavior")}
      >
        <SettingSelector
          label={t("llm_limits.response_length_label")}
          helperText={t("llm_limits.response_length_helper", { botName })}
          value={String(
            closestOption(
              userChatConfig.max_output_tokens,
              OUTPUT_TOKEN_OPTIONS,
            ),
          )}
          onChange={(maxOutputTokens) =>
            onUserChatConfigChange({
              max_output_tokens: Number(maxOutputTokens),
            })
          }
          onUndo={
            userChatConfig.max_output_tokens !==
            remoteUserChatConfig?.max_output_tokens
              ? () => onUserChatConfigRestore(["max_output_tokens"])
              : undefined
          }
          options={[
            {
              value: "300",
              label: t("llm_limits.response_length_minimum"),
            },
            {
              value: "1500",
              label: t("llm_limits.response_length_cost_saver"),
            },
            {
              value: "5000",
              label: t("llm_limits.response_length_regular"),
            },
            {
              value: "15000",
              label: t("llm_limits.response_length_extended"),
            },
            {
              value: "300000",
              label: t("llm_limits.response_length_full"),
            },
            {
              value: "1500000",
              label: t("llm_limits.response_length_extreme"),
            },
          ]}
          disabled={disabled}
          placeholder={disabled ? "—" : t("select_placeholder")}
          className={fieldClassName}
          variant="section"
        />

        <SettingSelector
          label={t("llm_limits.memory_depth_label")}
          helperText={t("llm_limits.memory_depth_helper", { botName })}
          value={String(
            closestOption(
              userChatConfig.max_chat_history_depth,
              HISTORY_DEPTH_OPTIONS,
            ),
          )}
          onChange={(maxChatHistoryDepth) =>
            onUserChatConfigChange({
              max_chat_history_depth: Number(maxChatHistoryDepth),
            })
          }
          onUndo={
            userChatConfig.max_chat_history_depth !==
            remoteUserChatConfig?.max_chat_history_depth
              ? () => onUserChatConfigRestore(["max_chat_history_depth"])
              : undefined
          }
          options={[
            {
              value: "1",
              label: t("llm_limits.memory_depth_minimal"),
            },
            {
              value: "5",
              label: t("llm_limits.memory_depth_short"),
            },
            {
              value: "10",
              label: t("llm_limits.memory_depth_brief"),
            },
            {
              value: "50",
              label: t("llm_limits.memory_depth_standard"),
            },
            {
              value: "100",
              label: t("llm_limits.memory_depth_deep"),
            },
            {
              value: "200",
              label: t("llm_limits.memory_depth_maximum"),
            },
          ]}
          disabled={disabled}
          placeholder={disabled ? "—" : t("select_placeholder")}
          className={fieldClassName}
          variant="section"
        />

        <SettingSelector
          label={t("llm_limits.thinking_depth_label")}
          helperText={t("llm_limits.thinking_depth_helper", { botName })}
          value={String(
            closestOption(userChatConfig.max_iterations, ITERATION_OPTIONS),
          )}
          onChange={(maxIterations) =>
            onUserChatConfigChange({ max_iterations: Number(maxIterations) })
          }
          onUndo={
            userChatConfig.max_iterations !==
            remoteUserChatConfig?.max_iterations
              ? () => onUserChatConfigRestore(["max_iterations"])
              : undefined
          }
          options={[
            {
              value: "1",
              label: t("llm_limits.thinking_depth_minimal"),
            },
            {
              value: "2",
              label: t("llm_limits.thinking_depth_light"),
            },
            {
              value: "5",
              label: t("llm_limits.thinking_depth_brief"),
            },
            {
              value: "10",
              label: t("llm_limits.thinking_depth_standard"),
            },
            {
              value: "20",
              label: t("llm_limits.thinking_depth_thorough"),
            },
            {
              value: "50",
              label: t("llm_limits.thinking_depth_exhaustive"),
            },
          ]}
          disabled={disabled}
          placeholder={disabled ? "—" : t("select_placeholder")}
          className={fieldClassName}
          variant="section"
        />
      </SettingsSection>

      <SettingsSection
        title={t("chat_settings_personal_subtitle")}
      >
        <SettingToggle
          id="use-about-me"
          label={t("use_about_me_label", { botName })}
          helperText={t("use_about_me_helper", { botName })}
          checked={userChatConfig.use_about_me}
          onChange={(useAboutMe) =>
            onUserChatConfigChange({ use_about_me: useAboutMe })
          }
          disabled={disabled}
          className={fieldClassName}
          onProfileLinkClick={onProfileLinkClick}
          profileLinkText={t("use_about_me_which_information")}
          variant="section"
        />

        <SettingToggle
          id="use-custom-prompt"
          label={t("use_custom_prompt_label", { botName })}
          helperText={t("use_custom_prompt_helper", { botName })}
          checked={userChatConfig.use_custom_prompt}
          onChange={(useCustomPrompt) =>
            onUserChatConfigChange({ use_custom_prompt: useCustomPrompt })
          }
          disabled={disabled}
          className={fieldClassName}
          onProfileLinkClick={onProfileLinkClick}
          profileLinkText={t("use_custom_prompt_which_instructions")}
          variant="section"
        />
      </SettingsSection>
    </div>
  );
};

export default ChatSettingsForm;
