import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { t } from "@/lib/translations";
import { usePageSession } from "@/hooks/usePageSession";
import { ApiError } from "@/lib/api-error";
import { PageError } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronsRight } from "lucide-react";
import {
  fetchUserSettings,
  saveUserSettings,
  UserSettings,
  buildChangedPayload,
  areSettingsChanged,
  hasAnyApiKey,
} from "@/services/user-settings-service";
import { useNavigation } from "@/hooks/useNavigation";
import SettingTextarea from "@/components/SettingTextarea";
import SettingInput from "@/components/SettingInput";

const UserSettingsPage: React.FC = () => {
  const { user_id, lang_iso_code } = useParams<{
    user_id: string;
    lang_iso_code: string;
  }>();

  const { error, accessToken, isLoadingState, setError, setIsLoadingState } =
    usePageSession();

  const { navigateToAccess, navigateToIntelligence, navigateToPurchases } = useNavigation();

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [remoteSettings, setRemoteSettings] = useState<UserSettings | null>(
    null
  );
  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  // Fetch user settings and external tools when session is ready
  useEffect(() => {
    if (!accessToken || !user_id || error) return;

    const fetchData = async () => {
      setIsLoadingState(true);
      setError(null);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const settings = await fetchUserSettings({
          apiBaseUrl,
          user_id,
          rawToken: accessToken.raw,
        });
        console.info("Fetched settings!", settings);
        setUserSettings(settings);
        setRemoteSettings(settings);
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

  const hasSettingsChanged = !!(
    userSettings &&
    remoteSettings &&
    areSettingsChanged(userSettings, remoteSettings)
  );

  const handleSave = async () => {
    if (!userSettings || !remoteSettings || !user_id || !accessToken) return;

    setIsLoadingState(true);
    setError(null);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      // Trim whitespace from text fields on submit (don't mutate form state pre-request)
      const trimmedSettings: UserSettings = {
        ...userSettings,
        full_name:
          userSettings.full_name === undefined
            ? undefined
            : userSettings.full_name.trim(),
        about_me:
          userSettings.about_me === undefined
            ? undefined
            : userSettings.about_me.trim(),
        custom_prompt:
          userSettings.custom_prompt === undefined
            ? undefined
            : userSettings.custom_prompt.trim(),
      };

      // Only send fields that have actually changed (smart diffing)
      const payload = buildChangedPayload(trimmedSettings, remoteSettings);

      await saveUserSettings({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
        payload,
      });

      // Sync UI state to what we actually saved (trimmed)
      setUserSettings(trimmedSettings);
      setRemoteSettings(trimmedSettings);
      toast(t("saved"));
    } catch (saveError) {
      console.error("Error saving settings!", saveError);
      setError(
        saveError instanceof ApiError
          ? PageError.fromApiError(saveError)
          : PageError.simple("errors.save_failed"),
      );
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <BaseSettingsPage
      page="profile"
      cardTitle={t("profile_card_title", { botName })}
      onActionClicked={handleSave}
      actionDisabled={!hasSettingsChanged}
      isContentLoading={isLoadingState}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Full name input */}
        <SettingInput
          id="full-name"
          label={t("profile_full_name_label", { botName })}
          value={userSettings?.full_name || ""}
          onChange={(value) =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    full_name: value,
                  }
                : prev
            )
          }
          onClear={() =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    full_name: "",
                  }
                : prev
            )
          }
          disabled={!!error?.isBlocker}
          placeholder={t("profile_full_name_placeholder")}
          className="w-full sm:w-auto"
          onKeyboardConfirm={() => {
            if (!error?.isBlocker && hasSettingsChanged) {
              handleSave();
            }
          }}
        />

        {/* About me textarea */}
        <SettingTextarea
          id="about-me"
          label={t("about_me_label", { botName })}
          value={userSettings?.about_me || ""}
          onChange={(value) =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    about_me: value,
                  }
                : prev
            )
          }
          onClear={() =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    about_me: "",
                  }
                : prev
            )
          }
          disabled={!!error?.isBlocker}
          placeholder={
            error?.isBlocker
              ? "—"
              : t("about_me_placeholder", {
                  name: userSettings?.full_name || t("about_me_name_fallback"),
                })
          }
          minRows={2}
          maxRows={6}
          className="w-full sm:w-auto"
        />

        {/* Custom prompt textarea */}
        <SettingTextarea
          id="custom-prompt"
          label={t("custom_prompt_label", { botName })}
          value={userSettings?.custom_prompt || ""}
          onChange={(value) =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    custom_prompt: value,
                  }
                : prev
            )
          }
          onClear={() =>
            setUserSettings((prev) =>
              prev
                ? {
                    ...prev,
                    custom_prompt: "",
                  }
                : prev
            )
          }
          disabled={!!error?.isBlocker}
          placeholder={
            error?.isBlocker
              ? "—"
              : t("custom_prompt_placeholder", { botName })
          }
          minRows={2}
          maxRows={6}
          className="w-full sm:w-auto"
        />

        {/* Navigation links based on user setup status */}
        {(() => {
          if (!userSettings) return null;

          const hasApiKeys = hasAnyApiKey(userSettings);
          const hasCredits = (userSettings.credit_balance ?? 0) > 0;

          const linkClass =
            "underline underline-offset-3 decoration-accent-amber/70 text-accent-amber/70 hover:text-accent-amber cursor-pointer";
          const rowClass = "flex items-center gap-2 text-sm text-muted-foreground";

          if (hasApiKeys || hasCredits) {
            return (
              <div className={rowClass}>
                <ChevronsRight className="h-4 w-4 text-accent-amber/70" />
                <button
                  onClick={() => {
                    if (user_id && lang_iso_code) {
                      navigateToIntelligence(user_id, lang_iso_code);
                    }
                  }}
                  className={linkClass}
                >
                  {t("configure_intelligence")}
                </button>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-2">
              <div className={rowClass}>
                <ChevronsRight className="h-4 w-4 text-accent-amber/70" />
                <button
                  onClick={() => {
                    if (user_id && lang_iso_code) {
                      navigateToPurchases(user_id, lang_iso_code);
                    }
                  }}
                  className={linkClass}
                >
                  {t("purchases.buy_credits")}
                </button>
              </div>
              <div className={rowClass}>
                <ChevronsRight className="h-4 w-4 text-accent-amber/70" />
                <button
                  onClick={() => {
                    if (user_id && lang_iso_code) {
                      navigateToAccess(user_id, lang_iso_code);
                    }
                  }}
                  className={linkClass}
                >
                  {t("configure_access_keys")}
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </BaseSettingsPage>
  );
};

export default UserSettingsPage;
