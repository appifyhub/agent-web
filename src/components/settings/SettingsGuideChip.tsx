import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsGuideChipProps {
  icon: LucideIcon;
  label: string;
  onActionClicked: () => void;
}

// a subdued next-step link that sits below a settings section rather than in the
// primary action area, so it never competes with Save
const SettingsGuideChip: React.FC<SettingsGuideChipProps> = ({
  icon: Icon,
  label,
  onActionClicked,
}) => (
  <Button
    variant="utility"
    size="sm"
    className="h-8 shrink-0 rounded-full border-blue-300/25 bg-blue-300/10 px-3 text-xs text-blue-200 hover:border-blue-300/40 hover:bg-blue-300/15 hover:text-blue-100"
    onClick={onActionClicked}
  >
    <Icon className="!size-3" />
    {label}
  </Button>
);

export default SettingsGuideChip;
