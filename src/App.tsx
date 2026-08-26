import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatSettingsPage from "@/pages/ChatSettingsPage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import AccessSettingsPage from "@/pages/AccessSettingsPage";
import IntelligenceSettingsPage from "@/pages/IntelligenceSettingsPage";
import SponsorshipsPage from "@/pages/SponsorshipsPage";
import LinkedProfilesPage from "@/pages/LinkedProfilesPage";
import UsagePage from "@/pages/UsagePage";
import PurchasesPage from "@/pages/PurchasesPage";
import HelpPage from "@/pages/HelpPage";
import OnboardingPage from "@/pages/OnboardingPage";
import logoVector from "@/assets/logo-vector.svg";
import { DEFAULT_LANGUAGE } from "@/lib/languages";
import { t } from "@/lib/translations";
import {
  trackFeatureAction,
  trackPageError,
  trackPageView,
} from "@/lib/analytics";

function RootRedirect() {
  useEffect(() => {
    window.location.replace(import.meta.env.VITE_LANDING_PAGE_URL);
  }, []);

  return null;
}

function NotFoundPage() {
  const location = useLocation();

  useEffect(() => {
    trackPageView({
      pageId: "not_found",
      pageState: "not_found",
      occurrenceId: location.key,
      interfaceLanguage: DEFAULT_LANGUAGE.isoCode,
    });
    trackPageError({
      pageId: "not_found",
      occurrenceId: location.key,
      errorCategory: "not_found",
      errorCode: "route_not_found",
    });
  }, [location.key]);

  return (
    <main className="settings-pane-atmosphere flex min-h-dvh items-center justify-center px-[1rem] py-[3rem]">
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-surface-raised/78 shadow-[0_24px_90px_oklch(0.04_0.01_292/0.32)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(32rem_18rem_at_50%_0%,oklch(0.42_0.12_285/24%),transparent_72%)]"
        />
        <div className="relative flex flex-col items-center px-[1.5rem] py-[3rem] text-center sm:px-[3rem] sm:py-[4rem]">
          <img src={logoVector} alt="" className="size-16" />
          <p className="mt-[1.5rem] font-mono text-sm font-semibold tracking-[0.18em] text-blue-300">
            404
          </p>
          <h1 className="mt-[0.75rem] text-[clamp(1.875rem,7vw,3rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground">
            {t("not_found_page.title")}
          </h1>
          <p className="mt-[1rem] max-w-md text-base leading-7 text-muted-foreground">
            {t("not_found_page.description")}
          </p>
          <Button asChild size="lg" className="mt-[2rem] rounded-xl">
            <a
              href={import.meta.env.VITE_LANDING_PAGE_URL}
              onClick={() =>
                trackFeatureAction({
                  featureId: "not_found_recovery",
                  action: "return",
                  sourceArea: "not_found",
                })
              }
            >
              {t("not_found_page.action")}
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <>
      <Routes>
        {/* The settings pages */}
        <Route
          path="/:lang_iso_code/chat/:chat_id/settings"
          element={<ChatSettingsPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/settings"
          element={<UserSettingsPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/access"
          element={<AccessSettingsPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/intelligence"
          element={<IntelligenceSettingsPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/sponsorships"
          element={<SponsorshipsPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/linked-profiles"
          element={<LinkedProfilesPage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/usage"
          element={<UsagePage />}
        />
        <Route
          path="/:lang_iso_code/user/:user_id/purchases"
          element={<PurchasesPage />}
        />
        <Route path="/:lang_iso_code/help" element={<HelpPage />} />
        <Route
          path="/:lang_iso_code/user/:user_id/onboarding"
          element={<OnboardingPage />}
        />
        {/* Edge-cases */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
