import { request } from "@/services/networking";
import { parseApiError } from "@/lib/api-error";

export type ReleaseNotificationsSetting = "none" | "major" | "minor" | "all";
export type MediaModeSetting = "photo" | "file" | "all";

export interface ChatConfig {
  chat_id: string;
  title?: string;
  platform: string;
  is_own: boolean;
  is_private: boolean;
  is_admin: boolean;
  language_name?: string;
  language_iso_code?: string;
  reply_chance_percent: number;
  release_notifications: ReleaseNotificationsSetting;
  media_mode: MediaModeSetting;
}

export interface UserChatConfig {
  use_about_me: boolean;
  use_custom_prompt: boolean;
}

export interface ChatSettings {
  chat_config: ChatConfig;
  user_chat_config: UserChatConfig;
}

export async function fetchAllChatSettings({
  apiBaseUrl,
  rawToken,
}: {
  apiBaseUrl: string;
  rawToken: string;
}): Promise<ChatSettings[]> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${rawToken}`,
  };
  const response = await request(`${apiBaseUrl}/settings/chats`, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return response.json();
}

export async function saveChatSettings({
  apiBaseUrl,
  chat_id,
  rawToken,
  chatConfig,
  userChatConfig,
}: {
  apiBaseUrl: string;
  chat_id: string;
  rawToken: string;
  chatConfig?: Partial<ChatConfig>;
  userChatConfig?: Partial<UserChatConfig>;
}): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${rawToken}`,
  };
  const payload: Record<string, unknown> = {};
  if (chatConfig !== undefined) payload.chat_config = chatConfig;
  if (userChatConfig !== undefined) payload.user_chat_config = userChatConfig;
  const response = await request(`${apiBaseUrl}/settings/chats/${chat_id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
}
