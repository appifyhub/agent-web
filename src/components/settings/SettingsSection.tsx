import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  title,
  className,
  contentClassName,
}) => (
  <Card variant="section" className={cn("gap-0 py-0", className)}>
    {/* the card header adds bottom padding whenever it also carries a bottom
        border; this header centers its title in a fixed height instead, so that
        variant padding is cancelled rather than fought with `py-0` alone */}
    {title && (
      <CardHeader className="flex min-h-14 items-center border-b border-border/70 bg-[radial-gradient(20rem_6rem_at_0%_50%,oklch(0.42_0.11_285/30%),transparent_76%)] px-5 py-0 sm:px-7 [.border-b]:pb-0">
        <CardTitle className="ps-1 font-mono text-[0.8rem] leading-5 font-semibold tracking-normal text-foreground uppercase">
          {title}
        </CardTitle>
      </CardHeader>
    )}
    <CardContent
      className={cn(
        "settings-section-content flex flex-col gap-8 px-5 py-6 sm:px-7 sm:py-8",
        contentClassName,
      )}
    >
      {children}
    </CardContent>
  </Card>
);

export default SettingsSection;
