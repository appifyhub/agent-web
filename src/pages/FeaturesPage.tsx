import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Brain,
  LockOpen,
  DoorOpen,
  Search,
  Paperclip,
  Image,
  AlertTriangle,
  UserRound,
  MessageCircle,
  Gift,
  ExternalLink,
} from "lucide-react";
import { usePageSession } from "@/hooks/usePageSession";
import { useChats } from "@/hooks/useChats";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNavigation } from "@/hooks/useNavigation";
import { DEFAULT_LANGUAGE, INTERFACE_LANGUAGES } from "@/lib/languages";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/translations";

const featureKeys = [
  "language_intelligence",
  "independent",
  "privacy",
  "web_search",
  "media",
  "imaging",
  "monitoring",
  "profile",
  "chat_settings",
  "sponsorships",
] as const;

// Map each feature to its icon component
const iconsMap: Record<
  (typeof featureKeys)[number],
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  language_intelligence: Brain,
  independent: LockOpen,
  privacy: DoorOpen,
  web_search: Search,
  media: Paperclip,
  imaging: Image,
  monitoring: AlertTriangle,
  profile: UserRound,
  chat_settings: MessageCircle,
  sponsorships: Gift,
};

export default function FeaturesPage() {
  const { lang_iso_code } = useParams<{ lang_iso_code: string }>();
  const { accessToken, handleTokenExpired } = usePageSession();
  const { chats } = useChats(accessToken?.decoded.sub, accessToken?.raw);
  const { userSettings } = useUserSettings(
    accessToken?.decoded?.sub,
    accessToken?.raw,
  );
  const { navigateToOnboarding } = useNavigation();
  const language =
    INTERFACE_LANGUAGES.find((lang) => lang.isoCode === lang_iso_code) ||
    DEFAULT_LANGUAGE;
  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  const showNav = Boolean(accessToken);
  const isLocked =
    showNav && userSettings !== null && !userSettings?.are_policies_accepted;

  const handleProjectClick = () => {
    window.open(import.meta.env.VITE_LANDING_PAGE_URL, "_blank");
  };

  return (
    <Header
      page="features"
      chats={chats}
      userId={accessToken?.decoded?.sub}
      rawAccessToken={accessToken?.raw}
      decodedToken={accessToken?.decoded}
      selectedLanguage={language}
      expiryTimestamp={accessToken?.decoded?.exp}
      onTokenExpired={handleTokenExpired}
      showProfileButton={showNav}
      showSponsorshipsButton={showNav}
      showChatsDropdown={showNav}
      showHelpButton={showNav}
      isLocked={isLocked}
      onGoToOnboarding={
        isLocked && accessToken?.decoded?.sub && lang_iso_code
          ? () => navigateToOnboarding(accessToken.decoded.sub, lang_iso_code)
          : undefined
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="mb-16 text-center text-4xl">
              {t("features.title", { botName })}
            </h1>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {featureKeys.map((key) => {
                const Icon = iconsMap[key];
                return (
                  <Card
                    key={key}
                    className="glass mx-auto max-w-md rounded-3xl px-6 py-8"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <Icon className="h-10 w-10 text-accent-amber" />
                      <h3 className="text-center text-xl font-semibold">
                        {t(`features.items.${key}.title`, { botName })}
                      </h3>
                      <p className="text-m text-center font-light opacity-80">
                        {t(`features.items.${key}.description`, { botName })}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="block h-16" />

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="glass hover:glass-active flex cursor-pointer items-center gap-4 rounded-full px-4 py-8 text-lg font-medium transition-all hover:text-accent-amber"
                onClick={handleProjectClick}
              >
                <div className="block h-6" />
                <ExternalLink className="h-8 w-8" />
                {t("check_out_project")}
                <div className="block h-6" />
              </Button>
            </div>

            <div className="block h-16" />
          </div>
        </main>

        <Footer />
      </div>
    </Header>
  );
}
