import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SettingActionBar from "@/components/SettingActionBar";
import ErrorMessage from "@/components/ErrorMessage";
import SettingsPageSkeleton from "@/components/SettingsPageSkeleton";
import GenericPageSkeleton from "@/components/GenericPageSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_LANGUAGE, INTERFACE_LANGUAGES } from "@/lib/languages";
import { t } from "@/lib/translations";
import { usePageSession } from "@/hooks/usePageSession";
import { useChats } from "@/hooks/useChats";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNavigation } from "@/hooks/useNavigation";
import { ChatSettings } from "@/services/chat-settings-service";
import { PageError, cn } from "@/lib/utils";
import { useIsSticky } from "@/hooks/useIsSticky";
import {
  getSettingsPageTitle,
  type SettingsPage,
} from "@/lib/settings-pages";

const ACTION_BAR_TOP_OFFSET = 80;

export interface BaseSettingsPageRef {
  openDrawer: () => void;
}

interface BaseSettingsPageProps {
  page: SettingsPage;
  children: React.ReactNode;
  cardTitle?: string;
  onActionClicked?: () => void;
  actionDisabled?: boolean;
  followupContent?: React.ReactNode;
  showActionButton?: boolean;
  actionIcon?: React.ReactNode;
  actionButtonText?: string;
  showSecondaryButton?: boolean;
  onSecondaryClicked?: () => void;
  secondaryDisabled?: boolean;
  secondaryIcon?: React.ReactNode;
  secondaryText?: string;
  secondaryClassName?: string;
  showCancelButton?: boolean;
  onCancelClicked?: () => void;
  cancelDisabled?: boolean;
  cancelIcon?: React.ReactNode;
  cancelTooltipText?: string;
  isContentLoading?: boolean;
  selectedChat?: ChatSettings;
  showProfileButton?: boolean;
  showSponsorshipsButton?: boolean;
  externalError?: PageError | null;
  onExternalErrorDismiss?: () => void;
  cardClassName?: string;
  topBanner?: React.ReactNode;
  contentVariant?: "card" | "flow";
}

const BaseSettingsPage = forwardRef<BaseSettingsPageRef, BaseSettingsPageProps>(
  (
    {
      page,
      children,
      cardTitle,
      onActionClicked = () => {},
      actionDisabled = false,
      followupContent,
      showActionButton = true,
      actionIcon,
      actionButtonText,
      showSecondaryButton = false,
      onSecondaryClicked = () => {},
      secondaryDisabled = false,
      secondaryIcon,
      secondaryText,
      secondaryClassName,
      showCancelButton = false,
      onCancelClicked = () => {},
      cancelDisabled = false,
      cancelIcon,
      cancelTooltipText,
      isContentLoading = false,
      selectedChat,
      showProfileButton = true,
      showSponsorshipsButton = true,
      externalError = null,
      onExternalErrorDismiss,
      cardClassName,
      topBanner,
      contentVariant = "card",
    },
    ref,
  ) => {
    const { lang_iso_code } = useParams<{
      lang_iso_code: string;
    }>();
    const { error, accessToken, isLoadingState, handleTokenExpired, setError } =
      usePageSession();

    const { navigateToOnboarding, navigateToProfile } = useNavigation();

    const effectiveUserId = accessToken?.decoded?.sub;

    // Fetch user settings for gate check (uses cache, so child pages avoid duplicate network calls)
    const { userSettings: gateSettings, isLoading: isGateLoading } =
      useUserSettings(effectiveUserId, accessToken?.raw);
    const isHelpLocked =
      page === "help" &&
      gateSettings !== null &&
      !gateSettings.are_policies_accepted;
    const isShellLocked =
      page === "onboarding" ||
      (page === "help" && (!accessToken || isHelpLocked));

    // Gate: redirect based on policies accepted state
    useEffect(() => {
      if (!accessToken || !effectiveUserId || !lang_iso_code || !gateSettings)
        return;

      if (page !== "onboarding" && page !== "help" && !gateSettings.are_policies_accepted) {
        navigateToOnboarding(effectiveUserId, lang_iso_code);
      } else if (
        page === "onboarding" &&
        gateSettings.are_policies_accepted
      ) {
        navigateToProfile(effectiveUserId, lang_iso_code);
      }
    }, [
      page,
      gateSettings,
      effectiveUserId,
      lang_iso_code,
      accessToken,
      navigateToOnboarding,
      navigateToProfile,
    ]);

    // Fetch chats once at this level to avoid duplicate calls
    const { chats, isLoading: isChatsLoading } = useChats(accessToken?.decoded?.sub, accessToken?.raw);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const stickySentinelRef = useRef<HTMLDivElement>(null);
    const isActionBarSticky = useIsSticky(
      stickySentinelRef,
      ACTION_BAR_TOP_OFFSET,
    );

    // retain the last non-null banner so settings-reveal can animate it out
    const lastBannerRef = useRef<React.ReactNode>(null);
    if (topBanner) {
      lastBannerRef.current = topBanner;
    }
    const bannerVisible = !!topBanner;
    const bannerContent = topBanner ?? lastBannerRef.current;

    useImperativeHandle(ref, () => ({
      openDrawer: () => setDrawerOpen(true),
    }));

    // prioritize external error if provided
    const displayError = externalError || error;
    const getErrorText = (
      error: PageError | null,
    ): string | React.ReactNode => {
      if (!error?.errorData) return "";
      if (error.errorData.htmlContent) {
        return error.errorData.htmlContent;
      }
      if (error.errorData.translationKey) {
        return t(
          error.errorData.translationKey,
          error.errorData.variables || {},
        );
      }
      return "";
    };

    // show the early loading state (before token or during gate check)
    if ((!accessToken && !error) || isGateLoading) {
      console.info("Rendering the loading state!");
      return (
        <div className="container mx-auto px-4 py-4 h-screen">
          <div className="flex flex-col items-center space-y-6 h-full justify-center p-9">
            <GenericPageSkeleton />
          </div>
        </div>
      );
    }

    const contentContainerClassName =
      "mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-10";
    if (page === "onboarding") {
      return (
        <Header
          page={page}
          chats={chats}
          chatsLoading={isChatsLoading}
          userId={accessToken?.decoded?.sub}
          rawAccessToken={accessToken?.raw}
          decodedToken={accessToken?.decoded}
          selectedLanguage={
            INTERFACE_LANGUAGES.find(
              (lang) => lang.isoCode === lang_iso_code,
            ) || DEFAULT_LANGUAGE
          }
          expiryTimestamp={accessToken?.decoded?.exp}
          onTokenExpired={handleTokenExpired}
          isLocked
          showLanguageDropdown={false}
          showHelpButton={false}
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
        >
          <div className="flex min-h-[calc(100svh-5rem)] flex-1 flex-col">
            <main className="flex flex-1 justify-center px-5 py-8 sm:px-8 sm:py-12">
              <div className="w-full max-w-3xl">
                {isLoadingState || isContentLoading ? (
                  <Card variant="section" className="py-8">
                    <CardContent>
                      <SettingsPageSkeleton />
                    </CardContent>
                  </Card>
                ) : (
                  children
                )}
              </div>
            </main>

            {displayError && (
              <ErrorMessage
                title={t("errors.oh_no")}
                description={getErrorText(displayError)}
                genericMessage={
                  displayError.showGenericAppendix
                    ? t("errors.check_link")
                    : undefined
                }
                isBlocker={displayError.isBlocker}
                onDismiss={
                  externalError && onExternalErrorDismiss
                    ? onExternalErrorDismiss
                    : !displayError.isBlocker
                      ? () => setError(null)
                      : undefined
                }
              />
            )}
          </div>
        </Header>
      );
    }


    const renderActionBar = (
      barLeadingContent?: React.ReactNode,
      className?: string,
    ) => (
      <SettingActionBar
        className={className}
        onActionClicked={onActionClicked}
        actionDisabled={
          actionDisabled || isLoadingState || !!displayError?.isBlocker
        }
        leadingContent={barLeadingContent}
        showActionButton={showActionButton}
        actionIcon={actionIcon}
        actionButtonText={actionButtonText}
        showSecondaryButton={showSecondaryButton}
        onSecondaryClicked={onSecondaryClicked}
        secondaryDisabled={
          secondaryDisabled || isLoadingState || !!displayError?.isBlocker
        }
        secondaryIcon={secondaryIcon}
        secondaryText={secondaryText}
        secondaryClassName={secondaryClassName}
        showCancelButton={showCancelButton}
        onCancelClicked={onCancelClicked}
        cancelDisabled={
          cancelDisabled || isLoadingState || !!displayError?.isBlocker
        }
        cancelIcon={cancelIcon}
        cancelTooltipText={cancelTooltipText}
      />
    );

    // render the main content
    return (
      <Header
        page={page}
        selectedChat={selectedChat}
        chats={chats}
        chatsLoading={isChatsLoading}
        userId={accessToken?.decoded?.sub}
        rawAccessToken={accessToken?.raw}
        decodedToken={accessToken?.decoded}
        selectedLanguage={
          INTERFACE_LANGUAGES.find(
            (lang) => lang.isoCode === lang_iso_code,
          ) || DEFAULT_LANGUAGE
        }
        expiryTimestamp={accessToken?.decoded?.exp}
        onTokenExpired={handleTokenExpired}
        showProfileButton={showProfileButton}
        showSponsorshipsButton={showSponsorshipsButton}
        isLocked={isShellLocked}
        showLanguageDropdown
        onGoToOnboarding={
          isHelpLocked && effectiveUserId && lang_iso_code
            ? () => navigateToOnboarding(effectiveUserId, lang_iso_code)
            : undefined
        }
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <main className="py-8 sm:py-10">
            <div className={contentContainerClassName}>

              <div className="flex min-w-0 items-center justify-between gap-[0.75rem]">
                <h1 className="min-w-0 shrink font-semibold tracking-tighter text-foreground text-[clamp(1.1rem,4.5vw,2.25rem)]">
                  {getSettingsPageTitle(page)}
                </h1>

                {!isActionBarSticky && (
                  <div className="shrink-0">
                    {renderActionBar(undefined, "w-auto")}
                  </div>
                )}
              </div>

              <div ref={stickySentinelRef} className="h-px" />
            </div>

            <div className="sticky top-20 z-30 h-0 w-full">
              {isActionBarSticky && (
                <div className="absolute top-0 left-0 w-full animate-in border-b border-border bg-background/94 bg-[radial-gradient(28rem_10rem_at_0%_50%,oklch(0.4_0.12_326/18%),transparent_70%)] py-3 shadow-[0_16px_34px_oklch(0.05_0.01_292/0.24)] fade-in-0 slide-in-from-top-1 duration-200 ease-out backdrop-blur-xl">
                  <div className={contentContainerClassName}>
                    {renderActionBar(
                      <span className="truncate text-base font-semibold tracking-tight text-foreground">
                        {getSettingsPageTitle(page)}
                      </span>,
                    )}
                  </div>
                </div>
              )}
            </div>

            {cardTitle && (
              <>
                <div aria-hidden="true" className="h-2" />
                <div className={contentContainerClassName}>
                  <p className="text-[0.85rem] font-semibold uppercase tracking-[0.06em] text-primary">
                    {cardTitle}
                  </p>
                </div>
              </>
            )}

              <div
                className={cn(contentContainerClassName, "settings-reveal")}
                data-expanded={bannerVisible}
              >
                <div className="pt-[1.25rem]">{bannerContent}</div>
              </div>

            <div
              className={cn(
                contentContainerClassName,
                "flex flex-col gap-4 pt-10 sm:gap-5 sm:pt-12",
              )}
            >
              {isLoadingState || isContentLoading ? (
                <Card variant="section" className="py-8">
                  <CardContent>
                    <SettingsPageSkeleton />
                  </CardContent>
                </Card>
              ) : contentVariant === "flow" ? (
                <div className={cardClassName}>{children}</div>
              ) : (
                <Card
                  className={cn(
                    "rounded-2xl border-border/80 bg-card/82 px-2 py-8 shadow-[0_18px_70px_oklch(0.05_0.01_292/0.2)] md:px-6 md:py-10",
                    cardClassName,
                  )}
                >
                  <CardContent className="space-y-4">{children}</CardContent>
                </Card>
              )}

              {followupContent && !isLoadingState && !isContentLoading && (
                <div className="flex flex-wrap items-center gap-2 px-0.5">
                  {followupContent}
                </div>
              )}
            </div>
          </main>

          {displayError && (
            <ErrorMessage
              title={t("errors.oh_no")}
              description={getErrorText(displayError)}
              genericMessage={
                displayError?.showGenericAppendix
                  ? t("errors.check_link")
                  : undefined
              }
              isBlocker={displayError.isBlocker}
              onDismiss={
                externalError && onExternalErrorDismiss
                  ? onExternalErrorDismiss
                  : !displayError.isBlocker
                    ? () => setError(null)
                    : undefined
              }
            />
          )}

          <Footer />
        </div>
      </Header>
    );
  },
);

BaseSettingsPage.displayName = "BaseSettingsPage";

export default BaseSettingsPage;
