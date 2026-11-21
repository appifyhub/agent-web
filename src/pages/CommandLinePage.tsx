import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Apple, Bird, CircleCheck, Download, Grid2X2, Package, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CardSelector from "@/components/CardSelector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ConfirmDialog from "@/components/ConfirmDialog";
import CopyableCommand from "@/components/CopyableCommand";
import SettingsSection from "@/components/settings/SettingsSection";
import BaseSettingsPage from "@/pages/BaseSettingsPage";
import { usePageSession } from "@/hooks/usePageSession";
import { getErrorDetails, trackFeatureAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api-error";
import {
  buildConnectCommand,
  COMMAND_LINE_ALIAS,
  COMMAND_LINE_NAME,
  COMMAND_LINE_RELEASES_URL,
  detectCommandLineOs,
  INSTALL_COMMANDS,
  VERIFY_COMMAND,
  type CommandLineOs,
  type InstallOptionId,
} from "@/lib/command-line";
import { formatConnectKey } from "@/lib/connect-key";
import { t } from "@/lib/translations";
import { PageError, cn } from "@/lib/utils";
import { revokeCliTokens } from "@/services/cli-access-service";
import {
  getConnectKey,
  regenerateConnectKey,
} from "@/services/connect-key-service";


const getInstallStepText = (id: InstallOptionId): string => {
  switch (id) {
    case "homebrew":
      return t("command_line.install_homebrew");
    case "apt":
      return t("command_line.install_apt");
    case "dnf":
      return t("command_line.install_dnf");
    case "scoop_bucket":
      return t("command_line.install_scoop_bucket");
    case "scoop":
      return t("command_line.install_scoop");
  }
};

const BODY_TEXT_CLASS =
  "text-[1.05rem] font-light md:text-justify [hyphens:auto] opacity-80";

const INSTALL_LINK_CLASS =
  "font-medium text-primary underline underline-offset-4 hover:text-primary/80";

const formatInstallText = (
  text: string,
  variables: Record<string, React.ReactNode>,
): React.ReactNode => text.split(/(\{\w+\})/g).map((part, index) => (
  <React.Fragment key={index}>
    {part.startsWith("{") ? variables[part.slice(1, -1)] ?? part : part}
  </React.Fragment>
));

const CommandLinePage: React.FC = () => {
  const { user_id } = useParams<{
    user_id: string;
  }>();

  const { error, accessToken, isLoadingState, setError, setIsLoadingState } =
    usePageSession();

  const [connectKey, setConnectKey] = useState<string | null>(null);
  const [selectedOs, setSelectedOs] = useState<CommandLineOs>(() =>
    detectCommandLineOs(navigator.userAgent),
  );
  const [isCopyDisabled, setIsCopyDisabled] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const botName = import.meta.env.VITE_APP_NAME_SHORT;

  useEffect(() => {
    if (!accessToken || !user_id || error) return;

    const fetchData = async () => {
      setIsLoadingState(true);
      setError(null);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await getConnectKey({
          apiBaseUrl,
          user_id,
          rawToken: accessToken.raw,
        });
        console.info("Fetched connect key!");
        setConnectKey(response.connect_key);
      } catch (err) {
        console.error("Error fetching connect key!", err);
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

  const handleCopyFailed = () => setIsCopyDisabled(true);

  const handleCopyKey = () => {
    trackFeatureAction({
      featureId: "cli_connect_key",
      action: "copy",
      optionId: "key",
      sourceArea: "command_line",
    });
  };

  const handleRegenerateKey = async () => {
    if (!user_id || !accessToken) return;

    setIsRegenerating(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await regenerateConnectKey({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
      });
      console.info("Regenerated connect key!");
      setConnectKey(response.connect_key);
      trackFeatureAction({
        featureId: "cli_connect_key",
        action: "regenerate",
        result: "success",
        sourceArea: "command_line",
      });
      toast.success(t("command_line.regenerate_success"));
    } catch (err) {
      console.error("Error regenerating connect key!", err);
      trackFeatureAction({
        featureId: "cli_connect_key",
        action: "regenerate",
        result: "failure",
        sourceArea: "command_line",
        ...getErrorDetails(err),
      });
      setError(
        err instanceof ApiError
          ? PageError.fromApiError(err)
          : PageError.simple("command_line.generic_error"),
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRevokeDialogOpenChange = (open: boolean) => {
    if (!open) {
      trackFeatureAction({
        featureId: "cli_access",
        action: "cancel",
        sourceArea: "command_line",
      });
    }
    setIsRevokeDialogOpen(open);
  };

  const handleOpenRevokeDialog = () => {
    trackFeatureAction({
      featureId: "cli_access",
      action: "open",
      sourceArea: "command_line",
    });
    setIsRevokeDialogOpen(true);
  };

  const handleRevoke = async () => {
    if (!user_id || !accessToken || isRevoking) return;

    setIsRevoking(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await revokeCliTokens({
        apiBaseUrl,
        user_id,
        rawToken: accessToken.raw,
      });
      console.info("Revoked all CLI access!");
      setIsRevokeDialogOpen(false);
      toast.success(t("command_line.revoke_success"));
      trackFeatureAction({
        featureId: "cli_access",
        action: "revoke",
        result: "success",
        sourceArea: "command_line",
      });
    } catch (err) {
      console.error("Error revoking CLI access!", err);
      setIsRevokeDialogOpen(false);
      setError(
        err instanceof ApiError
          ? PageError.fromApiError(err)
          : PageError.simple("command_line.generic_error"),
      );
      trackFeatureAction({
        featureId: "cli_access",
        action: "revoke",
        result: "failure",
        sourceArea: "command_line",
        ...getErrorDetails(err),
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const isBlocked = !!error?.isBlocker;
  const formattedKey = connectKey ? formatConnectKey(connectKey) : null;
  const aliasNote = formatInstallText(t("command_line.install_alias_note"), {
    cliAlias: <code dir="ltr" className="font-mono text-accent-amber">{COMMAND_LINE_ALIAS}</code>,
    cliName: <code dir="ltr" className="font-mono text-accent-amber">{COMMAND_LINE_NAME}</code>,
  });
  const packageManagerNote = formatInstallText(t("command_line.install_manager_note"), {
    packageManager: (
      <a
        href={selectedOs === "windows" ? "https://scoop.sh" : "https://brew.sh"}
        target="_blank"
        rel="noopener noreferrer"
        className={INSTALL_LINK_CLASS}
      >
        {selectedOs === "windows" ? "Scoop" : "Homebrew"}
      </a>
    ),
  });
  const renderInstallCommand = (step: { id: InstallOptionId; command: string }) => (
    <div key={step.id} className="flex flex-col gap-2">
      <p className={BODY_TEXT_CLASS}>{getInstallStepText(step.id)}</p>
      <CopyableCommand
        command={step.command}
        copyDisabled={isCopyDisabled || isBlocked}
        onCopyFailed={handleCopyFailed}
        onCopied={() => trackFeatureAction({
          featureId: "cli_install",
          action: "copy",
          optionId: step.id,
          sourceArea: "command_line",
        })}
      />
    </div>
  );
  const manualInstall = (
    <div className="flex flex-col gap-4">
      <p className={BODY_TEXT_CLASS}>
        <a
          href={COMMAND_LINE_RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={INSTALL_LINK_CLASS}
          onClick={() =>
            trackFeatureAction({
              featureId: "cli_install",
              action: "open",
              optionId: "releases",
              sourceArea: "command_line",
            })
          }
        >
          {t("command_line.releases_link")}
        </a>
      </p>
      <p className={BODY_TEXT_CLASS}>
        {formatInstallText(t("command_line.install_manual_steps"), {
          archiveType: <code dir="ltr" className="font-mono text-accent-amber">{selectedOs === "windows" ? ".zip" : ".tar.gz"}</code>,
          cliName: <code dir="ltr" className="font-mono text-accent-amber">{COMMAND_LINE_NAME}{selectedOs === "windows" ? ".exe" : ""}</code>,
        })}
      </p>
      {selectedOs === "macos" && (
        <>
          <p className={BODY_TEXT_CLASS}>{t("command_line.install_manual_macos_note")}</p>
          <CopyableCommand
            command={`xattr -d com.apple.quarantine ./${COMMAND_LINE_NAME}`}
            copyDisabled={isCopyDisabled || isBlocked}
            onCopyFailed={handleCopyFailed}
          />
        </>
      )}
      {selectedOs === "windows" && (
        <p className={BODY_TEXT_CLASS}>{t("command_line.install_manual_windows_note")}</p>
      )}
      {selectedOs === "linux" && (
        <>
          <p className={BODY_TEXT_CLASS}>{t("command_line.install_package_note")}</p>
          {INSTALL_COMMANDS.linux.filter((step) => step.id === "apt" || step.id === "dnf").map(renderInstallCommand)}
        </>
      )}
    </div>
  );

  return (
    <BaseSettingsPage
      page="command_line"
      cardTitle={t("command_line.card_title")}
      showActionButton={false}
      isContentLoading={isLoadingState}
      externalError={error}
      onExternalErrorDismiss={() => setError(null)}
      contentVariant="flow"
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <SettingsSection title={t("command_line.about_title")}>
          <p className={BODY_TEXT_CLASS}>
            {t("command_line.about_description", { botName })}
          </p>
          <p className={BODY_TEXT_CLASS}>{t("command_line.about_privacy")}</p>
        </SettingsSection>

        <SettingsSection title={t("command_line.install_title")}>
          <p className={BODY_TEXT_CLASS}>{t("command_line.install_intro")}</p>
          <CardSelector
            showSelectedCheckmark={false}
            value={selectedOs}
            onChange={(value) => setSelectedOs(value as CommandLineOs)}
            disabled={isBlocked}
            options={[
              { value: "macos", icon: Apple, title: t("command_line.os_macos"), description: aliasNote },
              { value: "linux", icon: Bird, title: t("command_line.os_linux"), description: aliasNote },
              { value: "windows", icon: Grid2X2, title: t("command_line.os_windows") },
            ]}
          />
          <Accordion type="single" collapsible defaultValue="package-managers">
            <AccordionItem value="package-managers" className="border-border/60">
              <AccordionTrigger className="group rounded-none px-5 py-4 text-left hover:no-underline data-[state=open]:bg-blue-300/5 sm:rounded-md sm:px-7 sm:py-5 sm:data-[state=open]:mt-[0.5rem] [&>svg]:size-5 [&>svg]:self-center [&>svg]:translate-y-0 [&[data-state=open]>svg]:text-blue-200">
                <span className="flex min-w-0 items-center gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/25 bg-blue-300/8">
                    <Package className="h-5 w-5 text-blue-200" />
                  </span>
                  <span className="text-base font-semibold tracking-tight text-foreground transition-colors group-data-[state=open]:text-blue-200">
                    {t("command_line.install_manager_title")}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pt-[1.25rem] pb-[1.5rem] sm:px-7 sm:pt-[1.5rem] sm:pb-[1.75rem]">
                <div className="flex flex-col gap-4">
                  <p className={BODY_TEXT_CLASS}>{packageManagerNote}</p>
                  {INSTALL_COMMANDS[selectedOs]
                    .filter((step) => step.id !== "apt" && step.id !== "dnf")
                    .map(renderInstallCommand)}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="manual" className="border-border/60">
              <AccordionTrigger className="group rounded-none px-5 py-4 text-left hover:no-underline data-[state=open]:bg-blue-300/5 sm:rounded-md sm:px-7 sm:py-5 sm:data-[state=open]:mt-[0.5rem] [&>svg]:size-5 [&>svg]:self-center [&>svg]:translate-y-0 [&[data-state=open]>svg]:text-blue-200">
                <span className="flex min-w-0 items-center gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300/25 bg-blue-300/8">
                    <Download className="h-5 w-5 text-blue-200" />
                  </span>
                  <span className="text-base font-semibold tracking-tight text-foreground transition-colors group-data-[state=open]:text-blue-200">
                    {t("command_line.install_manual_title")}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pt-[1.25rem] pb-[1.5rem] sm:px-7 sm:pt-[1.5rem] sm:pb-[1.75rem]">
                {manualInstall}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="verify" className="border-border/60">
              <AccordionTrigger className="group rounded-none px-5 py-4 text-left text-success hover:no-underline data-[state=open]:bg-success/5 sm:rounded-md sm:px-7 sm:py-5 sm:data-[state=open]:mt-[0.5rem] [&>svg]:size-5 [&>svg]:self-center [&>svg]:translate-y-0 [&>svg]:text-success">
                <span className="flex min-w-0 items-center gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-success/25 bg-success/8">
                    <CircleCheck className="h-5 w-5 text-success" />
                  </span>
                  <span className="text-base font-semibold tracking-tight">
                    {t("command_line.install_verify")}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pt-[1.25rem] pb-[1.5rem] sm:px-7 sm:pt-[1.5rem] sm:pb-[1.75rem]">
                <CopyableCommand
                  command={VERIFY_COMMAND}
                  copyDisabled={isCopyDisabled || isBlocked}
                  onCopyFailed={handleCopyFailed}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SettingsSection>

        {formattedKey && (
          <SettingsSection title={t("command_line.connect_title")}>
            <div className="flex flex-col gap-2">
              <Label className="ps-0 text-[1.05rem] font-medium">
                {t("command_line.key_label")}
              </Label>
              <CopyableCommand
                command={formattedKey}
                textClassName="text-accent-amber"
                onCopied={handleCopyKey}
                onCopyFailed={handleCopyFailed}
                copyDisabled={isBlocked || isCopyDisabled}
                copyTooltipText={t("command_line.copy_key")}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-surface-raised/50 border border-border/60 rounded-xl h-12 w-12 cursor-pointer"
                      onClick={handleRegenerateKey}
                      disabled={isBlocked || isRegenerating}
                    >
                      <RefreshCw
                        className={cn("h-4 w-4", isRegenerating && "animate-spin")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("command_line.regenerate_key")}
                  </TooltipContent>
                </Tooltip>
              </CopyableCommand>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="ps-0 text-[1.05rem] font-medium">
                {t("command_line.command_label")}
              </Label>
              <p className={BODY_TEXT_CLASS}>{t("command_line.connect_intro")}</p>
              <CopyableCommand
                command={buildConnectCommand(formattedKey)}
                copyDisabled={isCopyDisabled || isBlocked}
                onCopyFailed={handleCopyFailed}
                onCopied={() =>
                  trackFeatureAction({
                    featureId: "cli_connect_key",
                    action: "copy",
                    optionId: "command",
                    sourceArea: "command_line",
                  })
                }
              />
            </div>
            <p className={BODY_TEXT_CLASS}>
              {t("command_line.key_rotation_note")}
            </p>
            <p className={BODY_TEXT_CLASS}>{t("command_line.key_secret_note")}</p>
          </SettingsSection>
        )}

        <SettingsSection
          title={t("command_line.revoke_title")}
          className="border-destructive/40"
        >
          <p className={BODY_TEXT_CLASS}>
            {t("command_line.revoke_description")}
          </p>
          <Button
            variant="destructive"
            className="self-start cursor-pointer"
            onClick={handleOpenRevokeDialog}
            disabled={isBlocked || isRevoking}
          >
            <ShieldAlert className="h-4 w-4" />
            {t("command_line.revoke_button")}
          </Button>
        </SettingsSection>
      </div>

      <ConfirmDialog
        open={isRevokeDialogOpen}
        onOpenChange={handleRevokeDialogOpenChange}
        title={t("command_line.revoke_dialog_title")}
        description={t("command_line.revoke_dialog_description")}
        actionButtonText={
          isRevoking
            ? t("command_line.revoke_in_progress")
            : t("command_line.revoke_confirm")
        }
        onActionClicked={handleRevoke}
        actionDisabled={isBlocked}
        isActionPending={isRevoking}
        destructive
      />
    </BaseSettingsPage>
  );
};

export default CommandLinePage;
