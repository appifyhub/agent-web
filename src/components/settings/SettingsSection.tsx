import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  className,
  contentClassName,
}) => (
  <Card variant="section" className={cn("py-0", className)}>
    <CardContent
      className={cn("flex flex-col gap-8 px-5 py-6 sm:px-7 sm:py-8", contentClassName)}
    >
      {children}
    </CardContent>
  </Card>
);

export default SettingsSection;
