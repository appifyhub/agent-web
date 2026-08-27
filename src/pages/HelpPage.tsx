import { useState } from "react";
import { useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCent,
  BrainCircuit,
  Gift,
  Images,
  KeyRound,
  Merge,
  Rocket,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { trackFeatureAction } from "@/lib/analytics";
import SettingsSection from "@/components/settings/SettingsSection";
import SettingsGuideChip from "@/components/settings/SettingsGuideChip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigation } from "@/hooks/useNavigation";
import { usePageSession } from "@/hooks/usePageSession";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ApiError } from "@/lib/api-error";
import { t } from "@/lib/translations";
import { PageError } from "@/lib/utils";

const guideIds = [
  "setup",
  "intelligence",
  "behavior",
  "capabilities",
  "costs",
  "sponsorships",
  "profiles",
] as const;

type GuideId = (typeof guideIds)[number];
type Destination =
  | "profile"
  | "access"
  | "intelligence"
  | "usage"
  | "purchases"
  | "sponsorships"
  | "linked_profiles";

const guideIcons: Record<GuideId, LucideIcon> = {
  setup: Rocket,
  intelligence: BrainCircuit,
  behavior: SlidersHorizontal,
  capabilities: Images,
  costs: BadgeCent,
  sponsorships: Gift,
  profiles: Merge,
};

const destinationIcons: Record<Destination, LucideIcon> = {
  profile: UserRound,
  access: KeyRound,
  intelligence: Sparkles,
  usage: BadgeCent,
  purchases: ShoppingCart,
  sponsorships: Gift,
  linked_profiles: Merge,
};

const guideActions: Record<GuideId, Destination[]> = {
  setup: ["profile", "access"],
  intelligence: ["intelligence", "access"],
  behavior: ["profile"],
  capabilities: ["intelligence"],
  costs: ["purchases", "usage"],
  sponsorships: ["sponsorships"],
  profiles: ["linked_profiles"],
};

export default function HelpPage() {
  const { lang_iso_code } = useParams<{ lang_iso_code: string }>();
  const { accessToken } = usePageSession();
  const {
    userSettings,
    isLoading: isSettingsLoading,
    error: settingsError,
  } = useUserSettings(accessToken?.decoded.sub, accessToken?.raw);
  const {
    navigateToProfile,
    navigateToAccess,
    navigateToIntelligence,
    navigateToUsage,
    navigateToPurchases,
    navigateToSponsorships,
    navigateToLinkedProfiles,
  } = useNavigation();
  const [openGuide, setOpenGuide] = useState<GuideId | "">("");

  const userId = accessToken?.decoded.sub;
  const botName = import.meta.env.VITE_APP_NAME_SHORT;
  const pageError = settingsError
    ? settingsError instanceof ApiError
      ? PageError.fromApiError(settingsError, true)
      : PageError.blocker("errors.fetch_failed")
    : null;

  const navigateToDestination = (destination: Destination) => {
    if (!userId || !lang_iso_code) return;

    const navigationByDestination = {
      profile: navigateToProfile,
      access: navigateToAccess,
      intelligence: navigateToIntelligence,
      usage: navigateToUsage,
      purchases: navigateToPurchases,
      sponsorships: navigateToSponsorships,
      linked_profiles: navigateToLinkedProfiles,
    };

    trackFeatureAction({
      featureId: "help_guide",
      action: "open",
      optionId: destination,
      sourceArea: "help",
    });

    navigationByDestination[destination](userId, lang_iso_code);
  };


  const destinationLabels: Record<Destination, string> = {
    profile: t("profile"),
    access: t("access"),
    intelligence: t("intelligence"),
    usage: t("usage.page_title"),
    purchases: t("purchases.page_title"),
    sponsorships: t("sponsorships"),
    linked_profiles: t("linked_profiles.page_title"),
  };
  const guideCopy = {
    setup: {
      title: t("help_page.guides.setup.title", { botName }),
      summary: t("help_page.guides.setup.summary"),
      example: t("help_page.guides.setup.example"),
      guide: t("help_page.guides.setup.guide", { botName }),
      note: t("help_page.guides.setup.note"),
    },
    intelligence: {
      title: t("help_page.guides.intelligence.title"),
      summary: t("help_page.guides.intelligence.summary"),
      example: t("help_page.guides.intelligence.example"),
      guide: t("help_page.guides.intelligence.guide"),
      note: t("help_page.guides.intelligence.note"),
    },
    behavior: {
      title: t("help_page.guides.behavior.title"),
      summary: t("help_page.guides.behavior.summary"),
      example: t("help_page.guides.behavior.example"),
      guide: t("help_page.guides.behavior.guide"),
      note: t("help_page.guides.behavior.note"),
    },
    capabilities: {
      title: t("help_page.guides.capabilities.title"),
      summary: t("help_page.guides.capabilities.summary"),
      example: t("help_page.guides.capabilities.example"),
      guide: t("help_page.guides.capabilities.guide"),
      note: t("help_page.guides.capabilities.note"),
    },
    costs: {
      title: t("help_page.guides.costs.title"),
      summary: t("help_page.guides.costs.summary"),
      example: t("help_page.guides.costs.example"),
      guide: t("help_page.guides.costs.guide"),
      note: t("help_page.guides.costs.note"),
    },
    sponsorships: {
      title: t("help_page.guides.sponsorships.title"),
      summary: t("help_page.guides.sponsorships.summary"),
      example: t("help_page.guides.sponsorships.example"),
      guide: t("help_page.guides.sponsorships.guide"),
      note: t("help_page.guides.sponsorships.note"),
    },
    profiles: {
      title: t("help_page.guides.profiles.title"),
      summary: t("help_page.guides.profiles.summary"),
      example: t("help_page.guides.profiles.example"),
      guide: t("help_page.guides.profiles.guide"),
      note: t("help_page.guides.profiles.note"),
    },
  };


  return (
    <BaseSettingsPage
      page="help"
      cardTitle={t("help_page.intro_eyebrow")}
      showActionButton={false}
      isContentLoading={isSettingsLoading}
      externalError={pageError}
      contentVariant="flow"
      cardClassName="flex flex-col gap-5 sm:gap-6"
    >
      {accessToken &&
      userSettings?.are_policies_accepted &&
      !settingsError ? (
        <>
          <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface-raised/78 shadow-[0_18px_70px_oklch(0.05_0.01_292/0.18)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(38rem_18rem_at_0%_0%,oklch(0.42_0.12_285/22%),transparent_72%)]"
            />
            <div className="relative px-5 py-7 sm:px-8 sm:py-9">
              <h2 className="max-w-3xl text-[clamp(1.45rem,4vw,2.35rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-foreground">
                {t("help_page.intro_title", { botName })}
              </h2>
              <p className="mt-[1rem] max-w-3xl text-base leading-relaxed font-light text-foreground/75 md:text-justify [hyphens:auto]">
                {t("help_page.intro_description")}
              </p>
            </div>
            <div className="relative border-t border-border/60 bg-[oklch(0.22_0.02_292)] px-5 py-5 sm:px-8">
              <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-blue-200">
                {t("help_page.principle_label")}
              </p>
              <p className="mt-[0.5rem] text-lg font-semibold tracking-tight text-foreground">
                {t("help_page.principle_title")}
              </p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-foreground/70">
                {t("help_page.principle_description", { botName })}
              </p>
            </div>
          </section>

          <div>
            <SettingsSection
              title={t("help_page.guides_title")}
              contentClassName="gap-0 px-0 py-0"
            >
              <Accordion
                type="single"
                collapsible
                value={openGuide}
                onValueChange={(value) => {
                  if (value) {
                    trackFeatureAction({
                      featureId: "help_guide",
                      action: "view",
                      optionId: value,
                      sourceArea: "help",
                    });
                  }
                  setOpenGuide(value as GuideId | "");
                }}
              >
                {guideIds.map((guideId) => {
                  const Icon = guideIcons[guideId];

                  return (
                    <AccordionItem
                      key={guideId}
                      value={guideId}
                      className="border-border/60"
                    >
                      <AccordionTrigger className="group rounded-none px-5 py-4 text-left hover:no-underline data-[state=open]:bg-blue-300/5 sm:rounded-md sm:px-7 sm:py-5 sm:data-[state=open]:mt-[0.5rem] [&>svg]:size-5 [&>svg]:self-center [&>svg]:translate-y-0 [&[data-state=open]>svg]:text-blue-200">
                        <span className="flex min-w-0 items-center gap-5">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/25 bg-blue-300/8">
                            <Icon className="h-5 w-5 text-blue-200" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-base font-semibold tracking-tight text-foreground transition-colors group-data-[state=open]:text-blue-200">
                              {guideCopy[guideId].title}
                            </span>
                            <span className="mt-1 block text-[0.92rem] leading-relaxed font-normal text-foreground/68 transition-colors group-data-[state=open]:text-blue-200/75">
                              {guideCopy[guideId].summary}
                            </span>
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pt-[1.25rem] pb-[1.5rem] sm:px-7 sm:pt-[1.5rem] sm:pb-[1.75rem]">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.62fr)]">
                          <div className="space-y-5">
                            <blockquote className="border-s-2 border-accent-amber/45 ps-4">
                              <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-accent-amber">
                                {t("help_page.example")}
                              </p>
                              <p className="mt-[0.5rem] text-sm leading-relaxed text-foreground/90">
                                {guideCopy[guideId].example}
                              </p>
                            </blockquote>
                            <div>
                              <h3 className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-foreground">
                                {t("help_page.how_it_works")}
                              </h3>
                              <p className="mt-[0.5rem] text-[0.95rem] leading-relaxed font-light text-foreground/75 md:text-justify [hyphens:auto]">
                                {guideCopy[guideId].guide}
                              </p>
                            </div>
                          </div>
                          <aside className="rounded-xl border border-border/60 bg-[oklch(0.22_0.02_292)] p-[1rem]">
                            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-blue-200">
                              {t("help_page.keep_in_mind")}
                            </p>
                            <p className="mt-[0.5rem] text-[0.95rem] leading-relaxed text-foreground/72">
                              {guideCopy[guideId].note}
                            </p>
                          </aside>
                        </div>

                          <div className="mt-[1.5rem] flex flex-wrap gap-2">
                            {guideActions[guideId].map((destination) => (
                              <SettingsGuideChip
                                key={destination}
                                icon={destinationIcons[destination]}
                                label={t("help_page.open_destination", {
                                  destination:
                                    destinationLabels[destination],
                                })}
                                onActionClicked={() =>
                                  navigateToDestination(destination)
                                }
                              />
                            ))}
                          </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </SettingsSection>
          </div>
        </>
      ) : null}
    </BaseSettingsPage>
  );
}
