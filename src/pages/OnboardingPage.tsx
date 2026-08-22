import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { t } from "@/lib/translations";
import { PageError, cn } from "@/lib/utils";
import { usePageSession } from "@/hooks/usePageSession";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useExternalTools } from "@/hooks/useExternalTools";
import { useNavigation } from "@/hooks/useNavigation";
import { useChats } from "@/hooks/useChats";
import {
  saveUserSettings,
  UserSettingsPayload,
} from "@/services/user-settings-service";
import { IntelligencePreset } from "@/services/external-tools-service";
import { clearUserSettingsCache } from "@/services/user-settings-cache";
import { computePresetChoices } from "@/lib/tool-presets";
import { ApiError } from "@/lib/api-error";
import { toast } from "sonner";
import { INTERFACE_LANGUAGES, LLM_LANGUAGES } from "@/lib/languages";
import { LanguageItemContent } from "@/components/LanguageDropdown";
import CardSelector from "@/components/CardSelector";
import { saveChatSettings } from "@/services/chat-settings-service";
import SettingToggle from "@/components/SettingToggle";
import SettingInput from "@/components/SettingInput";
import SettingTextarea from "@/components/SettingTextarea";
import SettingSelector from "@/components/SettingSelector";
import SettingsSection from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  BadgeCent,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
  Key,
  Scale,
  Sparkles,
  Wallet,
} from "lucide-react";

type AccessChoice = "api_keys" | "credits";

const TOTAL_STEPS = 4;
const TERMS_URL = "https://www.appifyhub.com/terms.html";
const PRIVACY_URL = "https://www.appifyhub.com/privacy.html";

const OnboardingPage: React.FC = () => {
  const { user_id, lang_iso_code } = useParams<{
    user_id: string;
    lang_iso_code: string;
  }>();
  const location = useLocation();
  const {
    error,
    accessToken,
    isLoadingState,
    setError,
    setIsLoadingState,
  } = usePageSession();
  const { userSettings: remoteSettings, updateSettingsCache } = useUserSettings(
    user_id,
    accessToken?.raw,
  );
  const {
    navigateToAccess,
    navigateToPurchases,
    navigateToSponsorships,
    navigateWithLanguageChange,
  } = useNavigation();
  const { externalTools } = useExternalTools(user_id, accessToken?.raw);
  const {
    chats,
    isLoading: areChatsLoading,
    error: chatsError,
  } = useChats(user_id, accessToken?.raw);

  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [hasSyncedRemote, setHasSyncedRemote] = useState(false);
  const [selectedPreset, setSelectedPreset] =
    useState<IntelligencePreset | null>("agent_choice");
  const [accessChoice, setAccessChoice] = useState<AccessChoice | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>();

  if (remoteSettings && !hasSyncedRemote) {
    setFullName(remoteSettings.full_name || "");
    setAboutMe(remoteSettings.about_me || "");
    setCustomPrompt(remoteSettings.custom_prompt || "");
    setHasSyncedRemote(true);
  }

  useEffect(() => {
    if (!carouselApi) return;

    const updateIndex = () => setCurrentStep(carouselApi.selectedScrollSnap());
    updateIndex();
    carouselApi.on("select", updateIndex);
    return () => {
      carouselApi.off("select", updateIndex);
    };
  }, [carouselApi]);

  const isWaitlisted = !!(
    remoteSettings?.is_on_waitlist && !remoteSettings?.is_invited_to_start
  );
  const isSponsored = !!remoteSettings?.is_sponsored;
  const hasPresets = externalTools?.presets !== undefined;
  const canFinish =
    isPolicyAccepted &&
    selectedPreset !== null &&
    hasPresets &&
    (isSponsored || accessChoice !== null) &&
    currentStep === TOTAL_STEPS - 1;
  const canContinue =
    currentStep === 0
      ? isPolicyAccepted
      : currentStep === 1
        ? true
        : currentStep === 2
          ? selectedPreset !== null && hasPresets
          : isSponsored || accessChoice !== null;
  const isInteractionDisabled = !!error?.isBlocker;

  const handleNext = () => {
    if (canContinue) carouselApi?.scrollNext();
  };
  const handlePrev = () => carouselApi?.scrollPrev();

  const handleFinish = async () => {
    const presets = externalTools?.presets;
    if (
      !user_id ||
      !lang_iso_code ||
      !accessToken ||
      !selectedPreset ||
      !presets
    )
      return;
    if (!isSponsored && !accessChoice) return;

    setIsLoadingState(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const presetChoices = computePresetChoices(selectedPreset, presets);

      const payload: UserSettingsPayload = { are_policies_accepted: true };
      if (fullName.trim()) payload.full_name = fullName.trim();
      if (aboutMe.trim()) payload.about_me = aboutMe.trim();
      if (customPrompt.trim()) payload.custom_prompt = customPrompt.trim();

      for (const [toolType, toolId] of Object.entries(presetChoices)) {
        const fieldName =
          `tool_choice_${toolType}` as keyof UserSettingsPayload;
        (payload as Record<string, unknown>)[fieldName] = toolId;
      }

      const llmLanguageMatch = LLM_LANGUAGES.find(
        (language) => language.isoCode === lang_iso_code,
      );
      if (!llmLanguageMatch) {
        throw new Error(
          `No LLM language matches interface language '${lang_iso_code}'`,
        );
      }
      if (areChatsLoading) {
        throw new Error("Chat settings are still loading");
      }
      if (chatsError) {
        throw chatsError;
      }

      const ownChats = chats.filter((chat) => chat.chat_config.is_own);
      if (ownChats.length === 0) {
        throw new Error(
          "No own chats are available for the language update",
        );
      }
      await Promise.all(
        ownChats.map((chat) =>
          saveChatSettings({
            apiBaseUrl,
            chat_id: chat.chat_config.chat_id,
            rawToken: accessToken.raw,
            chatConfig: {
              language_name: llmLanguageMatch.defaultName,
              language_iso_code: llmLanguageMatch.isoCode,
              reply_chance_percent: chat.chat_config.reply_chance_percent,
              release_notifications: chat.chat_config.release_notifications,
              media_mode: chat.chat_config.media_mode,
            },
          }),
        ),
      );

      await saveUserSettings({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
        payload,
      });

      if (remoteSettings) {
        updateSettingsCache({ ...remoteSettings, ...payload });
      } else {
        clearUserSettingsCache(user_id);
      }

      toast(t("onboarding.success", { botName }));
      if (isSponsored) {
        navigateToSponsorships(user_id, lang_iso_code);
      } else if (accessChoice === "api_keys") {
        navigateToAccess(user_id, lang_iso_code);
      } else {
        navigateToPurchases(user_id, lang_iso_code);
      }
    } catch (err) {
      console.error("Error during onboarding!", err);
      if (err instanceof ApiError) {
        setError(PageError.fromApiError(err));
      } else {
        setError(PageError.simple("errors.save_failed"));
      }
    } finally {
      setIsLoadingState(false);
    }
  };

  const botName = import.meta.env.VITE_APP_NAME_SHORT;
  const steps = [
    t("onboarding.steps.policies"),
    t("onboarding.steps.profile"),
    t("onboarding.steps.intelligence"),
    t("onboarding.steps.access"),
  ];
  const activeStep = steps[currentStep];

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="flex flex-col gap-7">
          <SettingSelector
            label={t("onboarding.interface_language_label", { botName })}
            value={lang_iso_code}
            onChange={(isoCode) =>
              navigateWithLanguageChange(isoCode, location.pathname)
            }
            options={INTERFACE_LANGUAGES.map((language) => ({
              value: language.isoCode,
              label: <LanguageItemContent lang={language} />,
              disabled: language.isoCode === lang_iso_code,
            }))}
            disabled={isInteractionDisabled}
            variant="section"
          />
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {t("onboarding.policy_prefix")}
              <span className="mt-[0.5rem] block">
                <a
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {t("footer.terms")}
                </a>
                {" · "}
                <a
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {t("footer.privacy")}
                </a>
              </span>
            </p>
            <SettingToggle
              id="policy-accept"
              label={t("onboarding.policy_label")}
              checked={isPolicyAccepted}
              onChange={(checked) => {
                setIsPolicyAccepted(checked);
                if (checked) {
                  window.setTimeout(() => carouselApi?.scrollNext(), 100);
                }
              }}
              disabled={isInteractionDisabled || isPolicyAccepted}
              variant="section"
            />
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="flex flex-col gap-6">
          <SettingInput
            id="full-name"
            label={t("profile_full_name_label", { botName })}
            value={fullName}
            onChange={setFullName}
            onClear={() => setFullName("")}
            disabled={isInteractionDisabled || !isPolicyAccepted}
            placeholder={t("profile_full_name_placeholder")}
            variant="section"
          />
          <SettingTextarea
            id="about-me"
            label={t("about_me_label", { botName })}
            value={aboutMe}
            onChange={setAboutMe}
            onClear={() => setAboutMe("")}
            disabled={isInteractionDisabled || !isPolicyAccepted}
            placeholder={
              isPolicyAccepted
                ? t("about_me_placeholder", {
                    name: fullName || t("about_me_name_fallback"),
                  })
                : "—"
            }
            minRows={2}
            maxRows={6}
            variant="section"
          />
          <SettingTextarea
            id="custom-prompt"
            label={t("custom_prompt_label", { botName })}
            value={customPrompt}
            onChange={setCustomPrompt}
            onClear={() => setCustomPrompt("")}
            disabled={isInteractionDisabled || !isPolicyAccepted}
            placeholder={
              isPolicyAccepted
                ? t("custom_prompt_placeholder", { botName })
                : "—"
            }
            minRows={2}
            maxRows={6}
            variant="section"
          />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <CardSelector
          value={selectedPreset}
          onChange={(value) =>
            setSelectedPreset(value as IntelligencePreset)
          }
          disabled={isInteractionDisabled || !isPolicyAccepted}
          variant="segmented"
          options={[
            {
              value: "lowest_price",
              icon: Wallet,
              title: t("intelligence_presets.lowest_price"),
              description: t(
                "intelligence_presets.lowest_price_description",
              ),
            },
            {
              value: "highest_price",
              icon: Sparkles,
              title: t("intelligence_presets.highest_price"),
              description: t(
                "intelligence_presets.highest_price_description",
              ),
            },
            {
              value: "agent_choice",
              icon: Scale,
              title: t("intelligence_presets.agent_choice"),
              description: t(
                "intelligence_presets.agent_choice_description",
              ),
            },
          ]}
        />
      );
    }

    if (isSponsored) {
      return (
        <div className="flex items-start gap-4 rounded-xl border border-success/25 bg-success/8 px-5 py-5">
          <HeartHandshake className="mt-0.5 size-6 shrink-0 text-success" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{t("sponsorships")}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("sponsorship.you_are_sponsored")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <CardSelector
        value={accessChoice}
        onChange={(value) => setAccessChoice(value as AccessChoice)}
        disabled={isInteractionDisabled || !isPolicyAccepted}
        variant="segmented"
        options={[
          {
            value: "credits",
            icon: BadgeCent,
            title: t("onboarding.access_credits_title"),
            description: t("onboarding.access_credits_description"),
          },
          {
            value: "api_keys",
            icon: Key,
            title: t("onboarding.access_api_keys_title"),
            description: t("onboarding.access_api_keys_description"),
          },
        ]}
      />
    );
  };

  return (
    <BaseSettingsPage
      page="onboarding"
      isContentLoading={isLoadingState}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
    >
      <div className="space-y-6 sm:space-y-8">
        <header className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">
            {t("onboarding.page_title")}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {t("onboarding.intro", { botName })}
          </p>
        </header>

        {isWaitlisted ? (
          <SettingsSection title={t("onboarding.waitlist_title")}>
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-amber/12">
                <Clock className="size-5 text-accent-amber" />
              </div>
              <p className="pt-1.5 text-sm leading-6 text-muted-foreground">
                {t("onboarding.waitlist_message")}
              </p>
            </div>
          </SettingsSection>
        ) : (
          <>
            <ol
              className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4"
              aria-label={t("onboarding.progress", {
                current: currentStep + 1,
                total: TOTAL_STEPS,
              })}
            >
              {steps.map((step, index) => (
                <li
                  key={step}
                  aria-current={index === currentStep ? "step" : undefined}
                  className={cn(
                    "flex min-w-0 items-center gap-2.5 border-t-2 pt-[0.75rem] transition-colors motion-reduce:transition-none",
                    index === currentStep
                      ? "border-primary text-foreground"
                      : index < currentStep
                        ? "border-primary/45 text-foreground"
                        : "border-border text-muted-foreground",
                  )}
                >
                  <span className="font-mono text-[0.68rem] font-semibold tracking-[0.08em] text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-xs font-medium sm:text-sm">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <SettingsSection title={activeStep} contentClassName="gap-6">
              <Carousel
                opts={{ watchDrag: false }}
                setApi={setCarouselApi}
                aria-live="polite"
              >
                <CarouselContent className="ml-0">
                  {steps.map((step, index) => (
                    <CarouselItem key={step} className="ps-0">
                      {index === currentStep ? renderStep() : null}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {(currentStep > 0 || isPolicyAccepted) && (
                <div
                  className={cn(
                    "flex items-center gap-3 border-t border-border/70 pt-[1.25rem]",
                    currentStep > 0 ? "justify-between" : "justify-end",
                  )}
                >
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="utility"
                      size="lg"
                      onClick={handlePrev}
                      disabled={isInteractionDisabled}
                    >
                      <ChevronLeft />
                      {t("back")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="brand"
                    size="lg"
                    onClick={
                      currentStep === TOTAL_STEPS - 1
                        ? handleFinish
                        : handleNext
                    }
                    disabled={
                      isInteractionDisabled ||
                      (currentStep === TOTAL_STEPS - 1
                        ? !canFinish
                        : !canContinue)
                    }
                  >
                    {currentStep === 0
                      ? t("next")
                      : currentStep === TOTAL_STEPS - 1
                        ? t("onboarding.finish")
                        : t("onboarding.continue")}
                    {currentStep < TOTAL_STEPS - 1 && <ChevronRight />}
                  </Button>
                </div>
              )}
            </SettingsSection>
          </>
        )}
      </div>
    </BaseSettingsPage>
  );
};

export default OnboardingPage;
