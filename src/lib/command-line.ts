export const COMMAND_LINE_NAME = import.meta.env.VITE_APP_CLI_NAME || "abot";
export const COMMAND_LINE_ALIAS = `@${COMMAND_LINE_NAME}`;

export const COMMAND_LINE_RELEASES_URL =
  "https://github.com/appifyhub/agent-cli/releases";

export const VERIFY_COMMAND = `${COMMAND_LINE_NAME} --version`;

export type CommandLineOs = "macos" | "linux" | "windows";

export type InstallOptionId =
  | "homebrew"
  | "apt"
  | "dnf"
  | "scoop_bucket"
  | "scoop";

export interface InstallCommand {
  id: InstallOptionId;
  command: string;
}

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const detectCommandLineOs = (userAgent: string): CommandLineOs => {
  if (MOBILE_USER_AGENT_PATTERN.test(userAgent)) return "macos";
  if (/Windows/i.test(userAgent)) return "windows";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macos";
  if (/Linux|X11/i.test(userAgent)) return "linux";
  return "macos";
};

export const INSTALL_COMMANDS: Record<CommandLineOs, InstallCommand[]> = {
  macos: [{ id: "homebrew", command: `brew install appifyhub/tap/${COMMAND_LINE_NAME}` }],
  linux: [
    { id: "homebrew", command: `brew install appifyhub/tap/${COMMAND_LINE_NAME}` },
    { id: "apt", command: `sudo apt install ./${COMMAND_LINE_NAME}_*.deb` },
    { id: "dnf", command: `sudo dnf install ./${COMMAND_LINE_NAME}-*.rpm` },
  ],
  windows: [
    {
      id: "scoop_bucket",
      command:
        "scoop bucket add appifyhub https://github.com/appifyhub/scoop-bucket",
    },
    { id: "scoop", command: `scoop install ${COMMAND_LINE_NAME}` },
  ],
};

export const buildConnectCommand = (formattedKey: string): string =>
  `${COMMAND_LINE_NAME} connect ${formattedKey}`;
