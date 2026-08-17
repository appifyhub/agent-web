import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, INTERFACE_LANGUAGES } from "@/lib/languages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageDropdownProps {
  selectedLanguage: Language;
  onLangChange?: (lang: string) => void;
  className?: string;
  trigger?: React.ReactNode;
}

export const LanguageItemContent: React.FC<{ lang: Language }> = ({ lang }) => (
  <span className="inline-flex items-center gap-2">
    {lang.flagEmoji}
    <span className="font-semibold">{lang.localizedName}</span>
    <span className="ml-2 text-xs text-muted-foreground">
      ({lang.defaultName})
    </span>
  </span>
);

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onLangChange = () => {},
  className,
  trigger,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="utility"
            size="icon"
            className={cn(
              "w-auto cursor-pointer rounded-full px-3 text-base",
              className,
            )}
          >
            {selectedLanguage.flagEmoji}
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl border-border bg-popover p-2 shadow-2xl"
      >
        {INTERFACE_LANGUAGES.map((lang: Language) => (
          <DropdownMenuItem
            key={lang.isoCode}
            onClick={() => onLangChange?.(lang.isoCode)}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-2.5 text-foreground",
              lang.isoCode === selectedLanguage.isoCode ? "bg-accent" : "",
            )}
            disabled={lang.isoCode === selectedLanguage.isoCode}
          >
            <LanguageItemContent lang={lang} />
            {lang.isoCode === selectedLanguage.isoCode && (
              <CheckIcon className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageDropdown;
