import { Button } from "@/components/ui/button";
import logoVector from "@/assets/logo-vector.svg";
import { trackFeatureAction } from "@/lib/analytics";
import type { SettingsPage } from "@/lib/settings-pages";
import { t } from "@/lib/translations";

interface AuthRequiredPageProps {
  sourcePage: SettingsPage;
}

export const AuthRequiredPage = ({ sourcePage }: AuthRequiredPageProps) => (
  <main className="settings-pane-atmosphere flex min-h-dvh items-center justify-center px-[1rem] py-[3rem]">
    <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-surface-raised/78 shadow-[0_24px_90px_oklch(0.04_0.01_292/0.32)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(32rem_18rem_at_50%_0%,oklch(0.42_0.12_285/24%),transparent_72%)]"
      />
      <div className="relative flex flex-col items-center px-[1.5rem] py-[3rem] text-center sm:px-[3rem] sm:py-[4rem]">
        <img src={logoVector} alt="" className="size-16" />
        <p className="mt-[1.5rem] font-mono text-sm font-semibold tracking-[0.18em] text-blue-300">
          401
        </p>
        <h1 className="mt-[0.75rem] text-[clamp(1.875rem,7vw,3rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground">
          {t("auth_required_page.title")}
        </h1>
        <p className="mt-[1rem] max-w-md text-base leading-7 text-muted-foreground">
          {t("auth_required_page.description")}
        </p>
        <Button asChild size="lg" className="mt-[2rem] rounded-xl">
          <a
            href={import.meta.env.VITE_LANDING_PAGE_URL}
            onClick={() =>
              trackFeatureAction({
                featureId: "auth_required_recovery",
                action: "return",
                sourceArea: sourcePage,
              })
            }
          >
            {t("auth_required_page.action")}
          </a>
        </Button>
      </div>
    </section>
  </main>
);
