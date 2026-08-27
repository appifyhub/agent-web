import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCent,
  ChevronRight,
  Gift,
  Key,
  LifeBuoy,
  Merge,
  ShoppingCart,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import ChatsCollapsible from "@/components/ChatsCollapsible";
import CountdownTimer from "@/components/CountdownTimer";
import LanguageDropdown from "@/components/LanguageDropdown";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuText,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import logoVector from "@/assets/logo-vector.svg";
import { trackFeatureAction } from "@/lib/analytics";
import { useNavigation } from "@/hooks/useNavigation";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { Language } from "@/lib/languages";
import type { SettingsPage } from "@/lib/settings-pages";
import type { DecodedToken } from "@/lib/tokens";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import type { ChatSettings } from "@/services/chat-settings-service";

interface HeaderProps {
  page: SettingsPage;
  children: React.ReactNode;
  selectedChat?: ChatSettings;
  chats?: ChatSettings[];
  chatsLoading?: boolean;
  userId?: string;
  rawAccessToken?: string;
  selectedLanguage: Language;
  decodedToken?: DecodedToken;
  expiryTimestamp?: number;
  onTokenExpired?: () => void;
  showProfileButton?: boolean;
  showSponsorshipsButton?: boolean;
  showChatsDropdown?: boolean;
  showHelpButton?: boolean;
  showLanguageDropdown?: boolean;
  isLocked?: boolean;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
}

interface NavigationItem {
  page: SettingsPage;
  label: string;
  icon: LucideIcon;
  visible: boolean;
  onSelect: () => void;
}

interface NavigationSection {
  id: "personal" | "agent" | "resources" | "people";
  label: string;
  items: NavigationItem[];
  showChats?: boolean;
}

interface NavigationPanelProps {
  currentPage: SettingsPage;
  sections: NavigationSection[];
  chats: ChatSettings[];
  selectedChat?: ChatSettings;
  onChatChange: (chatId: string) => void;
}

interface SidebarBrandProps {
  appName: string;
  selectedLanguage: Language;
  showLanguageDropdown: boolean;
  onActionClicked: () => void;
  onLanguageChange: (isoCode: string) => void;
}

interface BrandLogoButtonProps {
  onActionClicked: () => void;
  className?: string;
}

const headerIconHighlightClassName =
  "hover:shadow-[0_0_8px] hover:shadow-primary/20 focus-visible:shadow-[0_0_8px] focus-visible:shadow-primary/20";

const BrandLogoButton: React.FC<BrandLogoButtonProps> = ({
  onActionClicked,
  className,
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className={cn(
      "size-10 shrink-0 rounded-full transition-shadow hover:bg-transparent",
      headerIconHighlightClassName,
      className,
    )}
    aria-label={t("profile")}
    onClick={onActionClicked}
  >
    <img src={logoVector} alt="" className="size-8" />
  </Button>
);

const SidebarBrand: React.FC<SidebarBrandProps> = ({
  appName,
  selectedLanguage,
  showLanguageDropdown,
  onActionClicked,
  onLanguageChange,
}) => {
  const { isCompact, isMobile, openMobile, setOpenMobile, state } =
    useSidebar();
  const showBrandDetails = isMobile || state === "expanded";
  const showCloseButton = isMobile || (isCompact && openMobile);

  return (
    <SidebarHeader
      className={`h-20 justify-center border-b border-border/80 bg-background py-0 transition-[padding] duration-200 ease-linear ${
        showBrandDetails ? "px-4" : "px-[0.875rem]"
      }`}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <BrandLogoButton
          onActionClicked={() => {
            onActionClicked();
            setOpenMobile(false);
          }}
        />
        {showBrandDetails && (
          <span className="min-w-0 flex-1 truncate text-base leading-none font-semibold tracking-[-0.03em] text-sidebar-foreground md:text-lg">
            {appName}
          </span>
        )}
        {showBrandDetails && showLanguageDropdown && (
          <LanguageDropdown
            selectedLanguage={selectedLanguage}
            onLangChange={onLanguageChange}
          />
        )}
        {showCloseButton && (
          <SidebarTrigger
            className="ml-auto"
            label={t("navigation.toggle_sidebar")}
            panelSide={isMobile ? "right" : "left"}
          />
        )}
      </div>
    </SidebarHeader>
  );
};

interface ShellTitleProps {
  appName: string;
  sectionLabel: string;
}

const ShellTitle: React.FC<ShellTitleProps> = ({
  appName,
  sectionLabel,
}) => {
  const { isMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <span className="hidden truncate text-sm font-semibold tracking-tight text-foreground sm:block">
        {sectionLabel}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold tracking-tight text-foreground">
      {state === "collapsed" && (
        <>
          <span>{appName}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        </>
      )}
      <span className="truncate">{sectionLabel}</span>
    </span>
  );
};

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  currentPage,
  sections,
  chats,
  selectedChat,
  onChatChange,
}) => {
  const { setOpenMobile } = useSidebar();

  const handleSelect = (onSelect: () => void) => {
    onSelect();
    setOpenMobile(false);
  };

  return (
    <nav aria-label={t("navigation.title")}>
      {sections.map((section) => (
        <SidebarGroup key={section.id}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.page === currentPage;

                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      type="button"
                      tooltip={item.label}
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      disabled={isActive}
                      onClick={() => handleSelect(item.onSelect)}
                    >
                      <Icon />
                      <SidebarMenuText>{item.label}</SidebarMenuText>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {section.showChats && chats.length > 0 && (
                <ChatsCollapsible
                  chats={chats}
                  selectedChat={selectedChat}
                  onChatChange={(chatId) => {
                    onChatChange(chatId);
                    setOpenMobile(false);
                  }}
                  defaultOpen={currentPage === "chat"}
                />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
};

const Header: React.FC<HeaderProps> = ({
  page,
  children,
  selectedChat,
  chats: externalChats = [],
  chatsLoading = false,
  userId: propUserId,
  rawAccessToken,
  selectedLanguage,
  decodedToken,
  expiryTimestamp,
  onTokenExpired,
  showProfileButton = true,
  showSponsorshipsButton = true,
  showChatsDropdown = true,
  showHelpButton = true,
  showLanguageDropdown = true,
  isLocked = false,
  drawerOpen,
  onDrawerOpenChange,
}) => {
  const { lang_iso_code, user_id, chat_id } = useParams<{
    lang_iso_code: string;
    user_id?: string;
    chat_id?: string;
  }>();
  const location = useLocation();
  const {
    navigateToChat,
    navigateToProfile,
    navigateToAccess,
    navigateToIntelligence,
    navigateToSponsorships,
    navigateToLinkedProfiles,
    navigateToUsage,
    navigateToPurchases,
    navigateToHelp,
    navigateWithLanguageChange,
  } = useNavigation();
  const chats = externalChats;
  const chatsAvailable = chatsLoading || chats.length > 0;
  const effectiveUserId =
    user_id || propUserId || localStorage.getItem("user_id");
  const { userSettings } = useUserSettings(
    effectiveUserId || undefined,
    rawAccessToken,
  );
  const resolvedSelectedChat =
    selectedChat ||
    chats.find((chat) => chat.chat_config.chat_id === chat_id);
  const isOnboarding = page === "onboarding";
  const effectiveShowProfileButton = !isLocked && showProfileButton;
  const effectiveShowSponsorshipsButton =
    !isLocked && showSponsorshipsButton;
  const effectiveShowChatsDropdown =
    !isLocked && showChatsDropdown && chatsAvailable;
  const showHelpInline = isLocked && page !== "help" && showHelpButton;
  const showHelpInNavigation = !isLocked && showHelpButton;
  const canNavigateToUserPages = !isLocked && Boolean(effectiveUserId);
  const appName = import.meta.env.VITE_APP_NAME_SHORT;
  const currentSectionLabel =
    page === "profile" || page === "chat"
      ? t("menu_section.personal")
      : page === "intelligence" ||
          page === "help" ||
          page === "onboarding"
        ? t("menu_section.agent")
        : page === "usage" || page === "purchases" || page === "access"
          ? t("menu_section.resources")
          : t("menu_section.people");
  const hasSessionTimer =
    expiryTimestamp !== undefined && onTokenExpired !== undefined;

  const handleLangChange = (isoCode: string) => {
    if (!lang_iso_code) {
      console.warn("Cannot navigate without lang_iso_code");
      return;
    }

    trackFeatureAction({
      featureId: "interface_language",
      action: "change",
      optionId: isoCode,
      sourceArea: page,
    });
    navigateWithLanguageChange(isoCode, location.pathname);
  };

  const handleChatChange = (chatId: string) => {
    if (!lang_iso_code) {
      console.warn("Cannot navigate without lang_iso_code");
      return;
    }

    navigateToChat(chatId, lang_iso_code);
  };

  const navigateToUserPage = (
    destination:
      | "profile"
      | "access"
      | "intelligence"
      | "sponsorships"
      | "linked_profiles"
      | "usage"
      | "purchases",
  ) => {
    if (!lang_iso_code || !effectiveUserId) {
      console.warn(`Cannot navigate to ${destination} without user_id`);
      return;
    }

    const navigationByDestination = {
      profile: navigateToProfile,
      access: navigateToAccess,
      intelligence: navigateToIntelligence,
      sponsorships: navigateToSponsorships,
      linked_profiles: navigateToLinkedProfiles,
      usage: navigateToUsage,
      purchases: navigateToPurchases,
    };

    navigationByDestination[destination](effectiveUserId, lang_iso_code);
  };

  const handleHelpClick = () => {
    if (!lang_iso_code) {
      console.warn("Cannot navigate to help without lang_iso_code");
      return;
    }

    navigateToHelp(lang_iso_code);
  };

  const handleLogoClick = () => {
    if (page !== "profile") {
      navigateToUserPage("profile");
    }
  };

  const navigationSections = ([
    {
      id: "personal",
      label: t("menu_section.personal"),
      showChats: effectiveShowChatsDropdown,
      items: [
        {
          page: "profile",
          label: t("profile"),
          icon: UserRound,
          visible: effectiveShowProfileButton,
          onSelect: () => navigateToUserPage("profile"),
        },
      ],
    },
    {
      id: "agent",
      label: t("menu_section.agent"),
      items: [
        {
          page: "intelligence",
          label: t("intelligence"),
          icon: Sparkles,
          visible: canNavigateToUserPages,
          onSelect: () => navigateToUserPage("intelligence"),
        },
        {
          page: "help",
          label: t("help"),
          icon: LifeBuoy,
          visible: showHelpInNavigation,
          onSelect: handleHelpClick,
        },
      ],
    },
    {
      id: "resources",
      label: t("menu_section.resources"),
      items: [
        {
          page: "usage",
          label: t("usage.page_title"),
          icon: BadgeCent,
          visible: canNavigateToUserPages,
          onSelect: () => navigateToUserPage("usage"),
        },
        {
          page: "purchases",
          label: t("purchases.page_title"),
          icon: ShoppingCart,
          visible: canNavigateToUserPages,
          onSelect: () => navigateToUserPage("purchases"),
        },
        {
          page: "access",
          label: t("access"),
          icon: Key,
          visible: canNavigateToUserPages,
          onSelect: () => navigateToUserPage("access"),
        },
      ],
    },
    {
      id: "people",
      label: t("menu_section.people"),
      items: [
        {
          page: "sponsorships",
          label: t("sponsorships"),
          icon: Gift,
          visible: effectiveShowSponsorshipsButton,
          onSelect: () => navigateToUserPage("sponsorships"),
        },
        {
          page: "linked_profiles",
          label: t("linked_profiles.page_title"),
          icon: Merge,
          visible: canNavigateToUserPages,
          onSelect: () => navigateToUserPage("linked_profiles"),
        },
      ],
    },
  ] satisfies NavigationSection[])
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.visible),
    }))
    .filter((section) => section.items.length > 0 || section.showChats);
  const hasNavigation = navigationSections.length > 0;

  return (
    <SidebarProvider
      openMobile={drawerOpen}
      onOpenMobileChange={onDrawerOpenChange}
    >
      {hasNavigation && (
        <Sidebar
          side="left"
          mobileSide="right"
          collapsible="icon"
          mobileTitle={t("navigation.title")}
          mobileDescription={t("navigation.description")}
        >
          <SidebarBrand
            appName={appName}
            selectedLanguage={selectedLanguage}
            showLanguageDropdown={showLanguageDropdown}
            onActionClicked={handleLogoClick}
            onLanguageChange={handleLangChange}
          />
          <SidebarContent className="border-sidebar-border px-4 py-2 transition-[padding] duration-200 ease-linear sm:border-r group-data-[collapsible=icon]:px-0">
            <NavigationPanel
              currentPage={page}
              sections={navigationSections}
              chats={chats}
              selectedChat={resolvedSelectedChat}
              onChatChange={handleChatChange}
            />
          </SidebarContent>
          <SidebarRail label={t("navigation.toggle_sidebar")} />
        </Sidebar>
      )}

      <SidebarInset className="settings-pane-atmosphere">
        <header className="sticky top-0 z-40 h-20 border-b border-border/80 bg-background">
          <div
            className={cn(
              "flex h-full w-full items-center gap-3 px-4",
              !isOnboarding && "sm:pl-1",
            )}
          >
            {hasNavigation && (
              <div className="flex shrink-0 items-center gap-2 sm:contents">
                <BrandLogoButton
                  className={cn(
                    "-ml-1 transition-opacity duration-200 sm:hidden",
                    drawerOpen && "pointer-events-none opacity-0",
                  )}
                  onActionClicked={handleLogoClick}
                />
                <span
                  className={cn(
                    "max-w-20 truncate text-sm font-semibold tracking-tight text-foreground transition-opacity duration-200 sm:hidden",
                    drawerOpen && "opacity-0",
                  )}
                >
                  {appName}
                </span>
                <SidebarTrigger
                  className={cn(
                    "hidden border-transparent bg-transparent hover:bg-transparent [&_svg]:size-5 sm:ml-0 sm:inline-flex",
                    headerIconHighlightClassName,
                  )}
                  label={t("navigation.toggle_sidebar")}
                />
              </div>
            )}
            {isOnboarding ? (
              <img
                src={logoVector}
                alt={appName}
                className="ms-[0.3125rem] size-8 shrink-0"
              />
            ) : (
              <ShellTitle
                appName={appName}
                sectionLabel={currentSectionLabel}
              />
            )}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {!isLocked && userSettings?.credit_balance !== undefined && (
                <Button
                  variant="utility"
                  size="sm"
                  className="rounded-full font-mono text-xs"
                  data-active={page === "usage"}
                  disabled={page === "usage"}
                  onClick={() => navigateToUserPage("usage")}
                >
                  <BadgeCent className="text-accent-amber" />
                  {userSettings.credit_balance.toFixed(2)}
                </Button>
              )}
              {showHelpInline && (
                <Button
                  variant="utility"
                  size="icon"
                  className="rounded-full"
                  onClick={handleHelpClick}
                >
                  <LifeBuoy />
                  <span className="sr-only">{t("help")}</span>
                </Button>
              )}
              {showLanguageDropdown && !hasNavigation && (
                <LanguageDropdown
                  selectedLanguage={selectedLanguage}
                  onLangChange={handleLangChange}
                />
              )}
              {hasSessionTimer && (
                <CountdownTimer
                  expiryTimestamp={expiryTimestamp}
                  decodedToken={decodedToken}
                  onExpire={onTokenExpired}
                  compactOnNarrow
                />
              )}
              {hasNavigation && (
                <SidebarTrigger
                  className="sm:hidden"
                  label={t("navigation.toggle_sidebar")}
                  panelSide="right"
                />
              )}
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Header;
