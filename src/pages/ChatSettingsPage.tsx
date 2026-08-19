import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import ChatContextBar from "@/components/settings/chat/ChatContextBar";
import ChatSettingsForm from "@/components/settings/chat/ChatSettingsForm";
import SettingsGuideChip from "@/components/settings/SettingsGuideChip";
import { useChats } from "@/hooks/useChats";
import { useNavigation } from "@/hooks/useNavigation";
import { usePageSession } from "@/hooks/usePageSession";
import { ApiError } from "@/lib/api-error";
import { t } from "@/lib/translations";
import { PageError } from "@/lib/utils";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { setCachedChats } from "@/services/chat-cache";
import {
  saveChatSettings,
  type ChatConfig,
  type ChatSettings,
  type UserChatConfig,
} from "@/services/chat-settings-service";

const hasChatConfigChanges = (
  current: ChatConfig,
  remote: ChatConfig,
): boolean =>
  current.language_name !== remote.language_name ||
  current.language_iso_code !== remote.language_iso_code ||
  current.reply_chance_percent !== remote.reply_chance_percent ||
  current.release_notifications !== remote.release_notifications ||
  current.media_mode !== remote.media_mode;

const hasUserChatConfigChanges = (
  current: UserChatConfig,
  remote: UserChatConfig,
): boolean =>
  current.use_about_me !== remote.use_about_me ||
  current.use_custom_prompt !== remote.use_custom_prompt ||
  current.max_output_tokens !== remote.max_output_tokens ||
  current.max_chat_history_depth !== remote.max_chat_history_depth ||
  current.max_iterations !== remote.max_iterations;

const ChatSettingsPage: React.FC = () => {
  const { chat_id, user_id, lang_iso_code } = useParams<{
    lang_iso_code: string;
    chat_id: string;
    user_id?: string;
  }>();
  const { error, accessToken, isLoadingState, setError, setIsLoadingState } =
    usePageSession();
  const { navigateToProfile } = useNavigation();
  const { chats, isLoading: isChatsLoading } = useChats(
    user_id || accessToken?.decoded.sub,
    accessToken?.raw,
  );
  const selectedChat = chats.find(
    (chat) => chat.chat_config.chat_id === chat_id,
  );
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [remoteSettings, setRemoteSettings] = useState<ChatSettings | null>(
    null,
  );

  if (accessToken && !isChatsLoading && chat_id && !error?.isBlocker) {
    if (chatSettings?.chat_config.chat_id !== chat_id) {
      if (selectedChat) {
        setChatSettings(selectedChat);
        setRemoteSettings(selectedChat);
      } else {
        setError(PageError.blocker("error_codes.chat_not_found"));
      }
    }
  }

  const chatConfigChanged = !!(
    chatSettings &&
    remoteSettings &&
    hasChatConfigChanges(
      chatSettings.chat_config,
      remoteSettings.chat_config,
    )
  );
  const userChatConfigChanged = !!(
    chatSettings &&
    remoteSettings &&
    hasUserChatConfigChanges(
      chatSettings.user_chat_config,
      remoteSettings.user_chat_config,
    )
  );
  const areSettingsChanged = chatConfigChanged || userChatConfigChanged;

  const updateChatConfig = (changes: Partial<ChatConfig>) => {
    setChatSettings((current) =>
      current
        ? {
            ...current,
            chat_config: { ...current.chat_config, ...changes },
          }
        : current,
    );
  };

  const updateUserChatConfig = (changes: Partial<UserChatConfig>) => {
    setChatSettings((current) =>
      current
        ? {
            ...current,
            user_chat_config: { ...current.user_chat_config, ...changes },
          }
        : current,
    );
  };

  const restoreChatConfig = (keys: (keyof ChatConfig)[]) => {
    if (!remoteSettings) return;
    const restoredValues = Object.fromEntries(
      keys.map((key) => [key, remoteSettings.chat_config[key]]),
    ) as Partial<ChatConfig>;
    updateChatConfig(restoredValues);
  };

  const restoreUserChatConfig = (keys: (keyof UserChatConfig)[]) => {
    if (!remoteSettings) return;
    const restoredValues = Object.fromEntries(
      keys.map((key) => [key, remoteSettings.user_chat_config[key]]),
    ) as Partial<UserChatConfig>;
    updateUserChatConfig(restoredValues);
  };

  const handleSave = async () => {
    if (!chatSettings || !remoteSettings || !chat_id || !accessToken) return;

    const isAdmin = chatSettings.chat_config.is_admin;
    const chatConfigPayload =
      isAdmin && chatConfigChanged
        ? {
            language_name: chatSettings.chat_config.language_name,
            language_iso_code: chatSettings.chat_config.language_iso_code,
            reply_chance_percent:
              chatSettings.chat_config.reply_chance_percent,
            release_notifications:
              chatSettings.chat_config.release_notifications,
            media_mode: chatSettings.chat_config.media_mode,
          }
        : undefined;
    const userChatConfigPayload = userChatConfigChanged
      ? {
          use_about_me: chatSettings.user_chat_config.use_about_me,
          use_custom_prompt: chatSettings.user_chat_config.use_custom_prompt,
          max_output_tokens: chatSettings.user_chat_config.max_output_tokens,
          max_chat_history_depth:
            chatSettings.user_chat_config.max_chat_history_depth,
          max_iterations: chatSettings.user_chat_config.max_iterations,
        }
      : undefined;

    setIsLoadingState(true);
    setError(null);
    try {
      await saveChatSettings({
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        chat_id,
        rawToken: accessToken.raw,
        chatConfig: chatConfigPayload,
        userChatConfig: userChatConfigPayload,
      });
      setRemoteSettings(chatSettings);
      const updatedChats = chats.map((chat) =>
        chat.chat_config.chat_id === chat_id ? chatSettings : chat,
      );
      const resolvedUserId = user_id || accessToken.decoded.sub;
      if (resolvedUserId) {
        setCachedChats(resolvedUserId, updatedChats);
      }
      toast(t("saved"));
    } catch (saveError) {
      console.error("Error saving settings!", saveError);
      setError(
        saveError instanceof ApiError
          ? PageError.fromApiError(saveError)
          : PageError.simple("errors.save_failed"),
      );
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleProfileLinkClick = () => {
    const resolvedUserId = user_id || accessToken?.decoded.sub;
    if (resolvedUserId && lang_iso_code) {
      navigateToProfile(resolvedUserId, lang_iso_code);
    }
  };

  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  return (
    <BaseSettingsPage
      page="chat"
      cardTitle={t("configure_title", { botName })}
      onActionClicked={handleSave}
      actionDisabled={!areSettingsChanged}
      isContentLoading={isLoadingState || isChatsLoading}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
      contentVariant="flow"
      selectedChat={selectedChat}
      followupContent={
        <SettingsGuideChip
          icon={UserRound}
          label={t("configure_profile")}
          onActionClicked={handleProfileLinkClick}
        />
      }
    >
      <div className="flex flex-col gap-5">
        {selectedChat && <ChatContextBar chat={selectedChat} />}
        {chatSettings && (
          <ChatSettingsForm
            chatSettings={chatSettings}
            remoteSettings={remoteSettings}
            botName={botName}
            disabled={!!error?.isBlocker}
            onChatConfigChange={updateChatConfig}
            onUserChatConfigChange={updateUserChatConfig}
            onChatConfigRestore={restoreChatConfig}
            onUserChatConfigRestore={restoreUserChatConfig}
            onProfileLinkClick={handleProfileLinkClick}
          />
        )}
      </div>
    </BaseSettingsPage>
  );
};

export default ChatSettingsPage;
