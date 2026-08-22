import React from "react";
import { Platform } from "@/lib/platform";
import TelegramIcon from "@/components/TelegramIcon";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  showText?: boolean;
  tone?: "default" | "brand";
}

const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = "h-4 w-4",
  showText = false,
  tone = "default",
}) => {
  const iconClassName = cn(
    className,
    tone === "brand" &&
      (platform === Platform.TELEGRAM
        ? "text-[#29ABE2]"
        : platform === Platform.WHATSAPP
          ? "text-[#40D876]"
          : "text-foreground-muted"),
  );

  const getPlatformInfo = (platform: Platform) => {
    switch (platform) {
      case Platform.TELEGRAM:
        return {
          name: Platform.getName(platform),
          icon: <TelegramIcon className={iconClassName} />,
        };
      case Platform.WHATSAPP:
        return {
          name: Platform.getName(platform),
          icon: <WhatsAppIcon className={iconClassName} />,
        };
      default:
        return {
          name: Platform.getName(platform),
          icon: <Radio className={iconClassName} />,
        };
    }
  };

  const platformInfo = getPlatformInfo(platform);

  if (showText) {
    return (
      <span className="flex items-center gap-2">
        {platformInfo.icon}
        <span>{platformInfo.name}</span>
      </span>
    );
  }

  return platformInfo.icon;
};

export default PlatformIcon;
