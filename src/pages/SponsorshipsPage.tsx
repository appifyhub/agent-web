import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Link,
  UsersRound,
} from "lucide-react";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { ApiError } from "@/lib/api-error";
import { PageError, cleanUsername } from "@/lib/utils";
import { toast } from "sonner";
import { t } from "@/lib/translations";
import { getErrorDetails, trackFeatureAction } from "@/lib/analytics";
import {
  fetchUserSponsorships,
  createSponsorship,
  removeSponsorship,
  removeSelfSponsorship,
  SponsorshipResponse,
} from "@/services/sponsorships-service";
import { Platform } from "@/lib/platform";
import { usePageSession } from "@/hooks/usePageSession";
import { useUserSettings } from "@/hooks/useUserSettings";
import PlatformHandleInput from "@/components/PlatformHandleInput";
import SponsorshipItem from "@/components/SponsorshipItem";
import SettingsSection from "@/components/settings/SettingsSection";
import { fetchExternalTools } from "@/services/external-tools-service";

const SponsorshipsPage: React.FC = () => {
  const { user_id } = useParams<{
    lang_iso_code: string;
    user_id: string;
  }>();

  const { error, accessToken, isLoadingState, setError, setIsLoadingState } =
    usePageSession();

  const { userSettings, refreshSettings } = useUserSettings(user_id, accessToken?.raw);

  const [sponsorships, setSponsorships] = useState<SponsorshipResponse[]>([]);
  const [maxSponsorships, setMaxSponsorships] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [collapsingIndex, setCollapsingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [platformHandle, setPlatformHandle] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    Platform.TELEGRAM
  );
  const [hasApiKeysConfigured, setHasApiKeysConfigured] =
    useState<boolean>(false);

  const sortSponsorships = (
    sponsorships: SponsorshipResponse[]
  ): SponsorshipResponse[] => {
    return [...sponsorships].sort((a, b) => {
      // 1. accepted_at (null goes first, then newest first)
      if (a.accepted_at === null && b.accepted_at !== null) return -1;
      if (a.accepted_at !== null && b.accepted_at === null) return 1;
      if (a.accepted_at !== null && b.accepted_at !== null) {
        const acceptedCompare =
          new Date(b.accepted_at).getTime() - new Date(a.accepted_at).getTime();
        if (acceptedCompare !== 0) return acceptedCompare;
      }

      // 2. sponsored_at (newest first)
      const sponsoredCompare =
        new Date(b.sponsored_at).getTime() - new Date(a.sponsored_at).getTime();
      if (sponsoredCompare !== 0) return sponsoredCompare;

      // 3. Display name (full_name or username)
      const aName = (a.full_name || a.platform_handle || "").toLowerCase();
      const bName = (b.full_name || b.platform_handle || "").toLowerCase();
      return aName.localeCompare(bName);
    });
  };

  // Fetch sponsorships and external tools when session is ready
  useEffect(() => {
    if (!accessToken || !user_id || error) return;

    const fetchData = async () => {
      setIsLoadingState(true);
      setError(null);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const [sponsorshipsData, externalTools] = await Promise.all([
          fetchUserSponsorships({
            apiBaseUrl,
            resource_id: user_id,
            rawToken: accessToken.raw,
          }),
          fetchExternalTools({
            apiBaseUrl,
            user_id,
            rawToken: accessToken.raw,
          }),
        ]);
        console.info("Fetched sponsorships!", sponsorshipsData);
        console.info("Fetched external tools!", externalTools);
        setSponsorships(sortSponsorships(sponsorshipsData.sponsorships));
        setMaxSponsorships(sponsorshipsData.max_sponsorships);

        // Check if any provider has API keys configured
        const hasConfiguredProviders = externalTools.providers.some(
          (provider) => provider.is_configured
        );
        setHasApiKeysConfigured(hasConfiguredProviders);
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
  }, [accessToken, user_id, error, setError, setIsLoadingState]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setPlatformHandle("");
    trackFeatureAction({
      featureId: "sponsorship",
      action: "open",
      sourceArea: "sponsorships",
    });
  };

  const handleCancelEditing = () => {
    trackFeatureAction({
      featureId: "sponsorship",
      action: "cancel",
      sourceArea: "sponsorships",
    });
    setIsEditing(false);
    setPlatformHandle("");
    setSelectedPlatform(Platform.TELEGRAM);
  };

  const handleSaveSponsorship = async () => {
    const cleanPlatformHandle = cleanUsername(platformHandle);
    if (!cleanPlatformHandle || !user_id || !accessToken) return;

    setIsLoadingState(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const result = await createSponsorship({
        apiBaseUrl,
        resource_id: user_id,
        rawToken: accessToken.raw,
        platform_handle: cleanPlatformHandle,
        platform: selectedPlatform,
      });

      trackFeatureAction({
        featureId: "sponsorship",
        action: "add",
        result: "success",
        optionId: selectedPlatform,
        sourceArea: "sponsorships",
      });
      setSponsorships((prev) => sortSponsorships([...prev, result.sponsorship]));

      // Exit editing mode and show success
      setIsEditing(false);
      setPlatformHandle("");
      setSelectedPlatform(Platform.TELEGRAM);
      toast(t("saved"));
    } catch (err) {
      console.error("Error saving sponsorship!", err);
      trackFeatureAction({
        featureId: "sponsorship",
        action: "add",
        result: "failure",
        optionId: selectedPlatform,
        sourceArea: "sponsorships",
        ...getErrorDetails(err),
      });
      setError(
        err instanceof ApiError
          ? PageError.fromApiError(err)
          : PageError.simple("errors.save_failed"),
      );
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleUnsponsor = async (sponsorship: SponsorshipResponse, index: number) => {
    if (!sponsorship.platform_handle || !sponsorship.platform || !user_id || !accessToken) return;

    setRemovingIndex(index);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await removeSponsorship({
        apiBaseUrl,
        resource_id: user_id,
        platform_handle: cleanUsername(sponsorship.platform_handle),
        platform: sponsorship.platform,
        rawToken: accessToken.raw,
      });
      trackFeatureAction({
        featureId: "sponsorship",
        action: "remove",
        result: "success",
        optionId: sponsorship.platform,
        sourceArea: "sponsorships",
      });

      toast(t("saved"));

      // animate out, then remove from state
      setCollapsingIndex(index);
      setTimeout(() => {
        setSponsorships((prev) =>
          sortSponsorships(prev.filter((s) => s !== sponsorship))
        );
        setExpandedItems(new Set());
        setRemovingIndex(null);
        setCollapsingIndex(null);
      }, 300);
    } catch (err) {
      console.error("Error saving sponsorship!", err);
      trackFeatureAction({
        featureId: "sponsorship",
        action: "remove",
        result: "failure",
        optionId: sponsorship.platform,
        sourceArea: "sponsorships",
        ...getErrorDetails(err),
      });
      setRemovingIndex(null);
      setError(
        err instanceof ApiError
          ? PageError.fromApiError(err)
          : PageError.simple("errors.save_failed"),
      );
    }
  };

  const handleUnlinkSelf = async () => {
    if (!user_id || !accessToken) return;

    setIsLoadingState(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await removeSelfSponsorship({
        apiBaseUrl,
        resource_id: user_id,
        rawToken: accessToken.raw,
      });
      trackFeatureAction({
        featureId: "sponsorship",
        action: "unlink",
        result: "success",
        sourceArea: "sponsorships",
      });
      toast(t("saved"));
      await refreshSettings();
    } catch (err) {
      console.error("Error saving sponsorship!", err);
      trackFeatureAction({
        featureId: "sponsorship",
        action: "unlink",
        result: "failure",
        sourceArea: "sponsorships",
        ...getErrorDetails(err),
      });
      setError(
        err instanceof ApiError
          ? PageError.fromApiError(err)
          : PageError.simple("errors.save_failed"),
      );
    } finally {
      setIsLoadingState(false);
    }
  };


  // Action button logic
  const getActionButtonText = () => {
    if (userSettings?.is_sponsored) {
      return t("sponsorship.unlink");
    }
    return isEditing ? t("save") : t("sponsorship.add_sponsorship");
  };

  const getActionHandler = () => {
    if (userSettings?.is_sponsored) {
      return handleUnlinkSelf;
    }
    return isEditing ? handleSaveSponsorship : handleStartEditing;
  };

  const isActionDisabled = () => {
    if (removingIndex !== null) return true;
    // Disable if no API keys configured (only when trying to sponsor, not when unlinking)
    if (
      !userSettings?.is_sponsored &&
      !isEditing &&
      !hasApiKeysConfigured
    ) {
      return true;
    }
    if (
      !userSettings?.is_sponsored &&
      !isEditing &&
      sponsorships.length >= maxSponsorships
    ) {
      return true;
    }
    if (
      !userSettings?.is_sponsored &&
      isEditing &&
      !cleanUsername(platformHandle).length
    ) {
      return true;
    }
    return false;
  };

  const shouldShowCancelButton =
    isEditing && !userSettings?.is_sponsored;


  return (
    <BaseSettingsPage
      page="sponsorships"
      cardTitle={
        userSettings?.is_sponsored
          ? t("sponsorship.you_are_sponsored")
          : isEditing
          ? t("sponsorship.add_sponsorship")
          : t("sponsorship.users_you_sponsor")
      }
      onActionClicked={getActionHandler()}
      actionDisabled={isActionDisabled()}
      actionButtonText={getActionButtonText()}
      showCancelButton={shouldShowCancelButton}
      onCancelClicked={handleCancelEditing}
      isContentLoading={isLoadingState}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
      contentVariant="flow"
    >
      {userSettings?.is_sponsored ? (
        <>
          {/* Sponsored user message */}
          <div className="flex flex-col items-center space-y-10 text-center mt-12">
            <Link className="h-12 w-12 text-accent-amber" />
            <p className="text-[1.05rem] font-light md:text-justify [hyphens:auto] opacity-80">
              {t("sponsorship.unlink_message")}
            </p>
          </div>
        </>
      ) : isEditing ? (
        <SettingsSection contentClassName="gap-6">
          <div className="flex flex-col items-center gap-6">
            <PlatformHandleInput
              label={t("sponsorship.platform_handle_label")}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
              platformHandle={platformHandle}
              onPlatformHandleChange={setPlatformHandle}
              disabled={!!error?.isBlocker}
              className="w-full sm:w-auto"
              onKeyboardConfirm={() => {
                if (!error?.isBlocker) {
                  handleSaveSponsorship();
                }
              }}
            />
          </div>
        </SettingsSection>
      ) : (
        <SettingsSection
          title={t("sponsorship.profiles_i_sponsor")}
          contentClassName="gap-0 py-2 sm:py-3"
        >
          {sponsorships.length === 0 ? (
            <div className="flex flex-col items-center space-y-10 text-center py-6">
              <UsersRound className="h-12 w-12 text-accent-amber" />
              <p className="text-foreground/80 font-light">
                {!hasApiKeysConfigured
                  ? t("sponsorship.configure_ai_access_first")
                  : t("sponsorship.no_sponsorships_found")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {sponsorships.map((sponsorship, index) => {
                const isExpanded = expandedItems.has(index);
                const toggleExpanded = () => {
                  const newExpandedItems = new Set(expandedItems);
                  if (isExpanded) {
                    newExpandedItems.delete(index);
                  } else {
                    newExpandedItems.add(index);
                  }
                  setExpandedItems(newExpandedItems);
                };

                return (
                  <SponsorshipItem
                    key={index}
                    sponsorship={sponsorship}
                    isExpanded={isExpanded}
                    isCollapsing={collapsingIndex === index}
                    disabled={!!error?.isBlocker || removingIndex !== null}
                    onToggle={toggleExpanded}
                    onUnsponsor={() => handleUnsponsor(sponsorship, index)}
                  />
                );
              })}
            </div>
          )}
        </SettingsSection>
      )}
    </BaseSettingsPage>
  );
};

export default SponsorshipsPage;
