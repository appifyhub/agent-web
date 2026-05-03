import React from "react";
import { Users, ShieldCheck, UserLock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatSettings } from "@/services/chat-settings-service";
import { Platform } from "@/lib/platform";
import PlatformIcon from "@/components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/translations";

interface ChatListItemProps {
  chat: ChatSettings;
  isSelected: boolean;
  onSelect: (chatId: string) => void;
  className?: string;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onSelect,
  className,
}) => {
  const platform = Platform.fromString(chat.chat_config.platform);
  const platformIconClass =
    platform === Platform.WHATSAPP
      ? "h-5 w-5 scale-125 text-[#40D876]"
      : platform === Platform.TELEGRAM
        ? "h-5 w-5 text-[#29ABE2]"
        : "h-5 w-5 text-foreground-muted";
  return (
    <Button
      variant="ghost"
      disabled={isSelected}
      onClick={() => onSelect(chat.chat_config.chat_id)}
      className={cn(
        "w-full justify-start gap-3 text-base h-12 rounded-xl px-8 font-normal",
        isSelected
          ? "bg-accent/70 cursor-default opacity-100"
          : "text-white hover:bg-white/10 cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-center w-6 h-6 shrink-0">
        <PlatformIcon platform={platform} className={platformIconClass} />
      </div>
      <span className="flex-1 truncate text-left min-w-0">
        {chat.chat_config.title || t("untitled")}
      </span>
      <div className="flex items-center justify-center w-6 h-6">
        {chat.chat_config.is_private ? (
          <UserLock className="h-5 w-5 text-foreground-muted opacity-60" />
        ) : chat.chat_config.is_own ? (
          <ShieldCheck className="h-6 w-6 text-accent-amber opacity-60" />
        ) : (
          <Users className="h-6 w-6 text-foreground-muted opacity-60" />
        )}
      </div>
    </Button>
  );
};

export default ChatListItem;
