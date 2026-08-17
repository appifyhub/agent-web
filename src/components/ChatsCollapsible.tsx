import React, { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatSettings } from "@/services/chat-settings-service";
import ChatListItem from "@/components/ChatListItem";
import { t } from "@/lib/translations";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuText,
  useSidebar,
} from "@/components/ui/sidebar";

interface ChatsCollapsibleProps {
  chats: ChatSettings[];
  selectedChat?: ChatSettings;
  onChatChange: (chatId: string) => void;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const ChatsCollapsible: React.FC<ChatsCollapsibleProps> = ({
  chats,
  selectedChat,
  onChatChange,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isMobile, setOpen, state } = useSidebar();
  const hasSelectedChat = selectedChat !== undefined;

  const handleToggle = () => {
    const newState = state === "collapsed" && !isMobile ? true : !isOpen;
    if (state === "collapsed" && !isMobile) {
      setOpen(true);
    }
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        tooltip={t("your_chats")}
        onClick={handleToggle}
        className={cn(hasSelectedChat && "text-sidebar-primary")}
      >
        <MessageCircle />
        <SidebarMenuText>{t("your_chats")}</SidebarMenuText>
        <ChevronDown
          className={cn(
            "ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden",
            isOpen && "rotate-180",
          )}
        />
      </SidebarMenuButton>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {chats.map((chat) => (
          <ChatListItem
            key={chat.chat_config.chat_id}
            chat={chat}
            isSelected={
              chat.chat_config.chat_id === selectedChat?.chat_config.chat_id
            }
            onSelect={onChatChange}
          />
        ))}
      </div>
    </SidebarMenuItem>
  );
};

export default ChatsCollapsible;
