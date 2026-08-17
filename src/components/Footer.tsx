import { t } from "@/lib/translations";
import logoVector from "@/assets/logo-vector.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > 2024 ? `2024 - ${currentYear}` : "2024";
  const brandName = t("footer.brand_name");

  return (
    <footer className="mt-auto border-t border-border/70 bg-background/55">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-8">
          {/* Brand section */}
          <div className="flex items-center">
            <a href={import.meta.env.VITE_LANDING_PAGE_URL}>
              <img
                width="24"
                height="24"
                src={logoVector}
                alt={t("footer.logo_alt")}
                className="opacity-80 transition-opacity hover:opacity-100"
              />
            </a>
          </div>

          {/* Links section */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:justify-start">
            <a
              href="https://www.appifyhub.com/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {t("footer.terms")}
            </a>
            <a
              href="https://www.appifyhub.com/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {t("footer.privacy")}
            </a>
            <span className="text-muted-foreground">
              {t("footer.powered_by")}{" "}
              <a
                href="https://www.appifyhub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                {brandName}
              </a>
            </span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground md:ml-auto">
            {yearRange} © {brandName} · {t("footer.rights_reserved")}
          </div>
        </div>
      </div>
    </footer>
  );
}
