import React from "react";
import { MessageCircleMore, UserLock, Users } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Platform } from "@/lib/platform";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import type { ChatSettings } from "@/services/chat-settings-service";

interface ChatContextBarProps {
  chat: ChatSettings;
}

const ChatContextBar: React.FC<ChatContextBarProps> = ({ chat }) => {
  const { isCompact, isMobile, setOpen, setOpenMobile, state } = useSidebar();
  const platform = Platform.fromString(chat.chat_config.platform);
  const showChatPicker = isMobile || state === "collapsed";

  const handleOpenNavigation = () => {
    if (isMobile || isCompact) {
      setOpenMobile(true);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-surface-subtle/70 px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/55 text-muted-foreground">
        <PlatformIcon
          platform={platform}
          className={cn("size-4", platform === Platform.WHATSAPP && "scale-125")}
          tone="brand"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
          {chat.chat_config.title || t("untitled")}
        </p>
        <div className="mt-0.5 flex items-center text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            {chat.chat_config.is_private ? (
              <UserLock className="size-3.5 shrink-0" />
            ) : (
              <Users className="size-3.5 shrink-0" />
            )}
            <span className="truncate">
              {chat.chat_config.is_private
                ? t("chat_context.private")
                : t("chat_context.group")}
            </span>
          </span>
        </div>
      </div>
      {showChatPicker && (
        <Button
          type="button"
          variant="utility"
          size="sm"
          className="size-9 shrink-0 cursor-pointer rounded-full px-0 sm:h-8 sm:w-auto sm:px-3"
          aria-label={t("your_chats")}
          onClick={handleOpenNavigation}
        >
          <MessageCircleMore />
          <span className="hidden sm:inline">{t("your_chats")}</span>
        </Button>
      )}
    </div>
  );
};

export default ChatContextBar;
