import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { toast } from "sonner";
import { Undo2, Sparkles, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { PageError, buildSponsoredBlockerError } from "@/lib/utils";
import { t } from "@/lib/translations";
import WarningBanner from "@/components/WarningBanner";
import ProvidersCarousel from "@/components/ProvidersCarousel";
import ProviderTabs from "@/components/ProviderTabs";
import SettingsGuideChip from "@/components/settings/SettingsGuideChip";
import {
  saveUserSettings,
  UserSettings,
  getSettingsFieldName,
  buildChangedPayload,
  areSettingsChanged,
  hasAnyApiKey,
  type UserSettingsPayload,
} from "@/services/user-settings-service";
import {
  trackUserSettingsFailed,
  trackUserSettingsSaved,
} from "@/lib/analytics-settings";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  fetchExternalTools,
  ExternalToolProvider,
} from "@/services/external-tools-service";
import { usePageSession } from "@/hooks/usePageSession";
import { useNavigation } from "@/hooks/useNavigation";
import { CarouselApi } from "@/components/ui/carousel";

const AccessSettingsPage: React.FC = () => {
  const { user_id, lang_iso_code } = useParams<{
    lang_iso_code: string;
    user_id: string;
  }>();

  const { error, accessToken, isLoadingState, setError, setIsLoadingState } =
    usePageSession();

  const { navigateToIntelligence, navigateToProfile } = useNavigation();

  const { userSettings: remoteSettings, updateSettingsCache } = useUserSettings(
    user_id,
    accessToken?.raw,
  );

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [externalToolProviders, setExternalToolProviders] = useState<
    ExternalToolProvider[]
  >([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const isRestoringPosition = useRef(false);
  const hasLoadedOnce = useRef(false);
  const indexToRestore = useRef<number | null>(null);

  if (remoteSettings && !userSettings) {
    setUserSettings(remoteSettings);
  }

  // Fetch external tools and check sponsorship when session and settings are ready
  useEffect(() => {
    if (!accessToken || !user_id || error?.isBlocker || !remoteSettings) return;

    if (remoteSettings.is_sponsored) {
      setError(buildSponsoredBlockerError(lang_iso_code!, user_id!));
      return;
    }

    const fetchData = async () => {
      setIsLoadingState(true);
      setError(null);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const externalTools = await fetchExternalTools({
          apiBaseUrl,
          user_id,
          rawToken: accessToken.raw,
        });
        console.info("Fetched external tools!", externalTools);
        const visibleProviders = externalTools.providers.filter(
          (p) => p.definition.id !== "internal",
        );
        setExternalToolProviders(
          visibleProviders.map((p) => p.definition),
        );
        hasLoadedOnce.current = true;
      } catch (err) {
        console.error("Error fetching data!", err);
        setError(
          err instanceof ApiError
            ? PageError.fromApiError(err, true)
            : PageError.blocker("errors.fetch_failed"),
        );
      } finally {
        setIsLoadingState(false);
      }
    };

    fetchData();
  }, [
    accessToken,
    user_id,
    lang_iso_code,
    error,
    setError,
    setIsLoadingState,
    remoteSettings,
  ]);

  // Track carousel position (only on user interaction, not programmatic scrolls)
  useEffect(() => {
    if (!carouselApi) return;

    const updateIndex = () => {
      const currentIndex = carouselApi.selectedScrollSnap();
      setCurrentProviderIndex(currentIndex);

      if (!isRestoringPosition.current) {
        // Store index for potential restore after save
        indexToRestore.current = currentIndex;
      }
      isRestoringPosition.current = false;
    };

    // Set initial index
    updateIndex();

    carouselApi.on("select", updateIndex);

    return () => {
      carouselApi.off("select", updateIndex);
    };
  }, [carouselApi]);

  // Restore carousel position when providers change (only after save/refetch, not on user navigation)
  useEffect(() => {
    if (!carouselApi || externalToolProviders.length === 0) return;

    const scrollToProviderId = sessionStorage.getItem("scrollToProvider");
    if (scrollToProviderId) {
      // Navigation from Intelligence page - scroll to that provider (works on first load too)
      const index = externalToolProviders.findIndex(
        (p) => p.id === scrollToProviderId,
      );
      if (index !== -1) {
        isRestoringPosition.current = true;
        setTimeout(() => {
          carouselApi.scrollTo(index);
          indexToRestore.current = index;
          sessionStorage.removeItem("scrollToProvider");
        }, 100);
      } else {
        sessionStorage.removeItem("scrollToProvider");
      }
    } else if (hasLoadedOnce.current && indexToRestore.current !== null) {
      // Restore position after save/refetch (only if we have a stored index)
      // Use jump=true to restore instantly without animation
      const targetIndex = Math.min(
        indexToRestore.current,
        externalToolProviders.length - 1,
      );
      if (targetIndex >= 0 && targetIndex < externalToolProviders.length) {
        isRestoringPosition.current = true;
        setTimeout(() => {
          carouselApi.scrollTo(targetIndex, true);
        }, 50);
      }
    }
  }, [carouselApi, externalToolProviders]);

  const hasSettingsChanged = !!(
    userSettings &&
    remoteSettings &&
    areSettingsChanged(userSettings, remoteSettings)
  );

  const handleSave = async () => {
    if (!userSettings || !remoteSettings || !user_id || !accessToken) return;

    setIsLoadingState(true);
    setError(null);
    let payload: UserSettingsPayload = {};
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      // Only send fields that have actually changed (smart diffing)
      payload = buildChangedPayload(userSettings, remoteSettings);

      await saveUserSettings({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
        payload,
      });
      trackUserSettingsSaved("access", payload);

      // Refetch external tools data to get updated is_configured status
      const updatedExternalTools = await fetchExternalTools({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
      });

      updateSettingsCache(userSettings!);
      const updatedVisibleProviders = updatedExternalTools.providers.filter(
        (p) => p.definition.id !== "internal",
      );
      setExternalToolProviders(
        updatedVisibleProviders.map((p) => p.definition),
      );
      toast(t("saved"));
    } catch (saveError) {
      console.error("Error saving settings!", saveError);
      trackUserSettingsFailed("access", payload, saveError);
      setError(
        saveError instanceof ApiError
          ? PageError.fromApiError(saveError)
          : PageError.simple("errors.save_failed"),
      );
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleProviderTabClick = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  const hasCredits = (userSettings?.credit_balance ?? 0) > 0;
  const showCreditsWarning =
    hasCredits &&
    !!userSettings &&
    hasAnyApiKey(userSettings) &&
    !isWarningDismissed;

  const handleRemoveAllApiKeys = () => {
    if (!userSettings) return;

    const clearedSettings = { ...userSettings };
    // Clear all API keys
    delete clearedSettings.open_ai_key;
    delete clearedSettings.anthropic_key;
    delete clearedSettings.google_ai_key;
    delete clearedSettings.perplexity_key;
    delete clearedSettings.replicate_key;
    delete clearedSettings.rapid_api_key;
    delete clearedSettings.coinmarketcap_key;
    delete clearedSettings.twelve_data_api_key;
    delete clearedSettings.x_key;
    delete clearedSettings.x_ai_key;

    setUserSettings(clearedSettings);
    toast(t("access_keys_cleared_message"));
  };

  const handleRestoreSettings = () => {
    if (!remoteSettings) return;
    setUserSettings(remoteSettings);
  };

  return (
    <BaseSettingsPage
      page="access"
      cardTitle={t("access_card_title", { botName })}
      onActionClicked={handleSave}
      actionDisabled={!hasSettingsChanged}
      showCancelButton={hasSettingsChanged}
      onCancelClicked={handleRestoreSettings}
      cancelIcon={<Undo2 className="h-6 w-6" />}
      cancelTooltipText={t("restore")}
      isContentLoading={isLoadingState}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
      contentVariant="flow"
      followupContent={
        <>
          <SettingsGuideChip
            icon={UserRound}
            label={t("configure_profile")}
            onActionClicked={() => {
              if (user_id && lang_iso_code) {
                navigateToProfile(user_id, lang_iso_code);
              }
            }}
          />
          <SettingsGuideChip
            icon={Sparkles}
            label={t("configure_intelligence")}
            onActionClicked={() => {
              if (user_id && lang_iso_code) {
                navigateToIntelligence(user_id, lang_iso_code);
              }
            }}
          />
        </>
      }
      topBanner={
        showCreditsWarning ? (
          <WarningBanner
            message={t("access_use_credits_warning_prefix")}
            destructiveLabel={t("access_remove_all_keys")}
            destructiveOnClick={handleRemoveAllApiKeys}
            onDismiss={() => setIsWarningDismissed(true)}
          />
        ) : undefined
      }
    >
      <ProviderTabs
        providers={externalToolProviders}
        selectedIndex={currentProviderIndex}
        onProviderClick={handleProviderTabClick}
        disabled={!!error?.isBlocker}
      />

      <ProvidersCarousel
        providers={externalToolProviders}
        userSettings={userSettings}
        onSettingChange={(providerId, value) => {
          const key = getSettingsFieldName(providerId);
          if (!key) return;
          setUserSettings((prev) =>
            prev
              ? {
                  ...prev,
                  [key]: value,
                }
              : prev,
          );
        }}
        disabled={!!error?.isBlocker}
        setApi={setCarouselApi}
      />
    </BaseSettingsPage>
  );
};

export default AccessSettingsPage;
