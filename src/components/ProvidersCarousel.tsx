import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import SettingInput from "@/components/SettingInput";
import SettingsSection from "@/components/settings/SettingsSection";
import { t } from "@/lib/translations";
import { ExternalToolProvider } from "@/services/external-tools-service";
import {
  UserSettings,
  getSettingsFieldName,
} from "@/services/user-settings-service";
import { formatToolsForDisplay as format } from "@/services/external-tools-service";
import ProviderIcon from "@/components/ProviderIcon";

interface ProvidersCarouselProps {
  providers: ExternalToolProvider[];
  userSettings: UserSettings | null;
  onSettingChange: (providerId: string, value: string) => void;
  disabled?: boolean;
  setNavigationApi?: (navigateTo: (providerId: string) => void) => void;
  setApi?: (api: CarouselApi) => void;
}

const ProvidersCarousel: React.FC<ProvidersCarouselProps> = ({
  providers,
  userSettings,
  onSettingChange,
  disabled = false,
  setNavigationApi,
  setApi: setParentApi,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });

    // Expose API to parent
    if (setParentApi) {
      setParentApi(api);
    }
  }, [api, setParentApi]);

  // Provide navigation API to parent component
  React.useEffect(() => {
    if (!api || !setNavigationApi) return;

    const navigateTo = (providerId: string) => {
      const index = providers.findIndex((p) => p.id === providerId);
      if (index !== -1) {
        api.scrollTo(index);
      }
    };

    setNavigationApi(navigateTo);
  }, [api, providers, setNavigationApi]);

  if (providers.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        {t("errors.not_found")}
      </div>
    );
  }

  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  return (
    <Carousel setApi={setApi} className="w-full">
      <CarouselContent className="ms-0">
        {providers.map((provider) => {
          return (
            <CarouselItem key={provider.id} className="ps-0">
              <SettingsSection className="relative overflow-hidden">
                {/* gradient edge nav — sm+ only */}
                {canScrollPrev && !disabled && (
                  <button
                    onClick={() => api?.scrollPrev()}
                    aria-label={t("back")}
                    className="absolute inset-y-0 start-0 z-10 hidden w-20 cursor-pointer items-center justify-start ps-4 bg-gradient-to-r from-[oklch(0.16_0.021_292)] to-transparent sm:flex"
                  >
                    <ChevronsLeft className="h-5 w-5 text-foreground/50 transition-all duration-200 hover:text-foreground/90 hover:drop-shadow-[0_0_6px_oklch(0.6_0.15_285/0.6)]" />
                  </button>
                )}
                {canScrollNext && !disabled && (
                  <button
                    onClick={() => api?.scrollNext()}
                    aria-label={t("next")}
                    className="absolute inset-y-0 end-0 z-10 hidden w-20 cursor-pointer items-center justify-end pe-4 bg-gradient-to-l from-[oklch(0.16_0.021_292)] to-transparent sm:flex"
                  >
                    <ChevronsRight className="h-5 w-5 text-foreground/50 transition-all duration-200 hover:text-foreground/90 hover:drop-shadow-[0_0_6px_oklch(0.6_0.15_285/0.6)]" />
                  </button>
                )}

                <div className="flex flex-col items-center gap-6 sm:mx-20">
                  {/* header with logo and inline nav (narrow only) */}
                  <div className="relative flex w-full items-center justify-center px-10 py-1 sm:px-0">
                    {canScrollPrev && !disabled && (
                      <Button
                        variant="utility"
                        size="icon"
                        className="absolute start-0 h-8 w-8 rounded-full sm:hidden"
                        onClick={() => api?.scrollPrev()}
                        aria-label={t("back")}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    )}

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center">
                        <ProviderIcon
                          providerId={provider.id}
                          className="w-full h-full"
                          alt={`${provider.name} logo`}
                        />
                      </div>
                      <span className="text-base font-bold text-foreground/90 text-center">
                        {provider.name}
                      </span>
                    </div>

                    {canScrollNext && !disabled && (
                      <Button
                        variant="utility"
                        size="icon"
                        className="absolute end-0 h-8 w-8 rounded-full sm:hidden"
                        onClick={() => api?.scrollNext()}
                        aria-label={t("next")}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {/* setting input */}
                  <SettingInput
                    id={`token-${provider.id}`}
                    label={t("provider_needed_for", {
                      botName,
                      tools: format(provider.tools),
                    })}
                    value={
                      (userSettings?.[
                        getSettingsFieldName(
                          provider.id,
                        ) as keyof typeof userSettings
                      ] as string) || ""
                    }
                    onChange={(value) => onSettingChange(provider.id, value)}
                    disabled={disabled}
                    placeholder={provider.token_format}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    inputClassName="font-mono"
                    onClear={() => onSettingChange(provider.id, "")}
                    variant="section"
                    className="settings-field"
                  />

                  {/* info link */}
                  <a
                    href={provider.token_management_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ms-1 inline-flex items-center gap-2 text-sm text-blue-200/80 underline underline-offset-3 decoration-blue-300/40 transition-colors hover:text-blue-100"
                  >
                    {t("where_is_my_key", {
                      providerName: provider.name,
                    })}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </SettingsSection>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

export default ProvidersCarousel;
