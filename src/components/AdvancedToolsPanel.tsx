import React, { useState } from "react";
import {
  MessageCircle,
  Lightbulb,
  Brush,
  Eye,
  Ear,
  WandSparkles,
  Clapperboard,
  Binoculars,
  DatabaseZap,
  Euro,
  Bitcoin,
  ChartCandlestick,
  Bird,
  ArrowLeftRight,
  BookOpenText,
  BrainCog,
  Image,
  Blocks,
} from "lucide-react";
import { t } from "@/lib/translations";
import { TranslationKey } from "@/lib/translation-keys";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionedSelector, {
  SectionedSelectorSection,
} from "@/components/SectionedSelector";
import {
  ExternalToolResponse,
  ExternalToolProviderResponse,
  ToolType,
} from "@/services/external-tools-service";
import { UserSettings } from "@/services/user-settings-service";

interface AdvancedToolsPanelProps {
  tools: ExternalToolResponse[];
  providers: ExternalToolProviderResponse[];
  userSettings: UserSettings | null;
  remoteSettings?: UserSettings | null;
  onToolChoiceChange: (toolType: ToolType, toolId: string) => void;
  onProviderNavigate?: (providerId: string) => void;
  hasCredits?: boolean;
  disabled?: boolean;
  openSection?: string;
  onOpenSectionChange?: (section: string) => void;
}

type ToolGroupCategory =
  | "text_intelligence"
  | "content_analysis"
  | "image_tools"
  | "integrations";

interface ToolCategoryGroup {
  category: ToolGroupCategory;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  toolTypes: ToolTypeGroup[];
}

interface ToolTypeGroup {
  type: ToolType;
  title: string;
  description: string;
  sections: SectionedSelectorSection[];
  currentValue: string | undefined;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface ToolTypeRowProps {
  group: ToolTypeGroup;
  changed: boolean;
  remoteChoice?: string;
  disabled?: boolean;
  hasCredits?: boolean;
  onToolChoiceChange: (toolType: ToolType, toolId: string) => void;
  onProviderNavigate?: (providerId: string) => void;
}

// one tool type: its icon, name, description, and the selector for choosing a tool.
// the icon sits above the text on narrow containers so the description is not
// squeezed into a few words per line, and moves beside it once there is room.
// while stacked it centers and grows, since it owns that row by itself. once
// beside the text it is grouped with the title so the two share a center line,
// and the body copy below aligns to the title by matching the icon width plus gap
const ToolTypeRow: React.FC<ToolTypeRowProps> = ({
  group,
  changed,
  remoteChoice,
  disabled,
  hasCredits,
  onToolChoiceChange,
  onProviderNavigate,
}) => {
  const ToolIcon = group.icon;
  const totalOptions = group.sections.reduce(
    (count, section) => count + section.options.length,
    0,
  );
  const isSingleOption = totalOptions === 1;
  const singleOption = isSingleOption ? group.sections[0].options[0] : null;

  return (
    <div className="rounded-xl border border-border/70 bg-background/35 px-5 py-5">
      <div className="flex flex-col items-stretch gap-3 @min-[30rem]:gap-2">
        <div className="flex flex-col items-stretch gap-3 @min-[30rem]:flex-row @min-[30rem]:items-center @min-[30rem]:gap-4">
          {ToolIcon && (
            <span className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background/70 text-brand-coral-light @min-[30rem]:mx-0 @min-[30rem]:h-8 @min-[30rem]:w-8">
              <ToolIcon
                className="h-5 w-5 @min-[30rem]:h-4 @min-[30rem]:w-4"
                strokeWidth={2.5}
              />
            </span>
          )}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 @min-[30rem]:justify-start">
            <h4 className="text-center text-base font-semibold tracking-tight text-foreground @min-[30rem]:ps-1 @min-[30rem]:text-start">
              {group.title}
              {changed && (
                <span className="ms-1 inline-block text-sm leading-none text-accent-amber">
                  *
                </span>
              )}
            </h4>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-2 @min-[30rem]:ps-12">
          <p className="ps-1 text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>

          {group.sections.length > 0 ? (
            <SectionedSelector
              accessibleName={t("tools.select_tool")}
              value={
                isSingleOption && singleOption
                  ? singleOption.value
                  : group.currentValue
              }
              onChange={(toolId) => onToolChoiceChange(group.type, toolId)}
              onUndo={
                changed && remoteChoice
                  ? () => onToolChoiceChange(group.type, remoteChoice)
                  : undefined
              }
              sections={group.sections}
              disabled={disabled || isSingleOption}
              placeholder={t("tools.select_tool")}
              notConfiguredLabel={t("tools.not_configured_with_prefix")}
              onProviderNavigate={onProviderNavigate}
              hasCredits={hasCredits}
              className="settings-field"
            />
          ) : (
            <div className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
              {t("tools.no_tools_available")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Map tool types to their category
const getToolGroupCategory = (toolType: ToolType): ToolGroupCategory => {
  const categoryMap: Record<ToolType, ToolGroupCategory> = {
    chat: "text_intelligence",
    reasoning: "text_intelligence",
    copywriting: "text_intelligence",
    vision: "image_tools",
    hearing: "content_analysis",
    embedding: "content_analysis",
    images_gen: "image_tools",
    videos_gen: "image_tools",
    search: "integrations",
    api_fiat_exchange: "integrations",
    api_crypto_exchange: "integrations",
    api_stock_quote: "integrations",
    api_twitter: "integrations",
    credit_transfer: "integrations",
    deprecated: "integrations",
  };
  return categoryMap[toolType];
};

// Get icon for category
const getToolGroupIcon = (
  category: ToolGroupCategory
): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<
    ToolGroupCategory,
    React.ComponentType<{ className?: string }>
  > = {
    text_intelligence: BookOpenText,
    content_analysis: BrainCog,
    image_tools: Image,
    integrations: Blocks,
  };
  return iconMap[category];
};

const AdvancedToolsPanel: React.FC<AdvancedToolsPanelProps> = ({
  tools,
  providers,
  userSettings,
  remoteSettings,
  onToolChoiceChange,
  onProviderNavigate,
  hasCredits = false,
  disabled = false,
  openSection: controlledOpenSection,
  onOpenSectionChange: controlledOnOpenSectionChange,
}) => {
  const [internalOpenSection, setInternalOpenSection] = useState<string>("");

  // Use controlled props if provided, otherwise use internal state
  const openSection = controlledOpenSection !== undefined ? controlledOpenSection : internalOpenSection;
  const setOpenSection = controlledOnOpenSectionChange !== undefined ? controlledOnOpenSectionChange : setInternalOpenSection;

  // Helper function to get the current tool choice value for a tool type
  const getCurrentToolChoice = (toolType: ToolType): string | undefined => {
    const fieldName = `tool_choice_${toolType}` as keyof UserSettings;
    return userSettings?.[fieldName] as string | undefined;
  };

  // Helper function to check if a provider is configured
  const isProviderConfigured = (providerId: string): boolean => {
    const providerResponse = providers.find(
      (p) => p.definition.id === providerId
    );
    return providerResponse?.is_configured ?? false;
  };

  // Helper function to check if a tool is configured
  const isToolConfigured = (toolId: string): boolean => {
    const toolResponse = tools.find((t) => t.definition.id === toolId);
    return toolResponse?.is_configured ?? false;
  };

  const isToolTypeChanged = (toolType: ToolType): boolean => {
    if (!remoteSettings) return false;
    const fieldName = `tool_choice_${toolType}` as keyof UserSettings;
    return userSettings?.[fieldName] !== remoteSettings[fieldName];
  };

  const getRemoteToolChoice = (toolType: ToolType): string | undefined => {
    if (!remoteSettings) return undefined;
    const fieldName = `tool_choice_${toolType}` as keyof UserSettings;
    return remoteSettings[fieldName] as string | undefined;
  };

  const isCategoryChanged = (category: ToolGroupCategory): boolean => {
    const categoryToolTypes = Object.entries({
      chat: "text_intelligence",
      reasoning: "text_intelligence",
      copywriting: "text_intelligence",
      vision: "image_tools",
      hearing: "content_analysis",
      embedding: "content_analysis",
      images_gen: "image_tools",
      videos_gen: "image_tools",
      search: "integrations",
      api_fiat_exchange: "integrations",
      api_crypto_exchange: "integrations",
      api_stock_quote: "integrations",
      api_twitter: "integrations",
      credit_transfer: "integrations",
    } as Record<ToolType, ToolGroupCategory>)
      .filter(([, cat]) => cat === category)
      .map(([type]) => type as ToolType);
    return categoryToolTypes.some(isToolTypeChanged);
  };

  // Icon mapping for tool types
  const getToolTypeIcon = (
    toolType: ToolType
  ): React.ComponentType<{ className?: string }> | undefined => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      chat: MessageCircle,
      reasoning: Lightbulb,
      copywriting: Brush,
      vision: Eye,
      hearing: Ear,
      images_gen: WandSparkles,
      videos_gen: Clapperboard,
      search: Binoculars,
      embedding: DatabaseZap,
      api_fiat_exchange: Euro,
      api_crypto_exchange: Bitcoin,
      api_stock_quote: ChartCandlestick,
      api_twitter: Bird,
      credit_transfer: ArrowLeftRight,
    };
    return iconMap[toolType];
  };

  // Group tools by type and then by provider
  const groupToolsByType = (): ToolTypeGroup[] => {
    const typeGroups: Map<ToolType, ToolTypeGroup> = new Map();

    // First, collect all unique tool types from the tools in API order
    const allToolTypes: ToolType[] = [];
    tools.forEach((tool) => {
      tool.definition.types.forEach((type) => {
        if (!allToolTypes.includes(type)) {
          allToolTypes.push(type);
        }
      });
    });

    // Create groups for each tool type
    allToolTypes.forEach((toolType) => {
      // Check if we have translations for this tool type
      const titleKey = `tools.types.${toolType}.title` as TranslationKey;
      const descKey = `tools.types.${toolType}.description` as TranslationKey;

      // Skip if no translation available (as requested)
      try {
        const title = t(titleKey);
        const description = t(descKey);

        // If translation returns the key itself, it means no translation found
        if (title === titleKey || description === descKey) {
          return; // Skip this tool type
        }

        // Group tools by provider for this tool type
        const providerGroups: Map<string, SectionedSelectorSection> = new Map();

        tools.forEach((tool) => {
          if (tool.definition.types.includes(toolType)) {
            const providerId = tool.definition.provider.id;
            const providerName = tool.definition.provider.name;

            if (!providerGroups.has(providerId)) {
              providerGroups.set(providerId, {
                sectionTitle: providerName,
                providerId: providerId,
                isConfigured: isProviderConfigured(providerId),
                options: [],
              });
            }

            const section = providerGroups.get(providerId)!;
            section.options.push({
              value: tool.definition.id,
              label: tool.definition.name,
              isConfigured: isToolConfigured(tool.definition.id),
              providerId: providerId, // for logo lookup
              costEstimate: tool.definition.cost_estimate,
              toolName: tool.definition.name,
              maxInputImages: tool.definition.max_input_images,
            });
          }
        });

        // Convert to array and maintain API order
        const sections = Array.from(providerGroups.values());

        typeGroups.set(toolType, {
          type: toolType,
          title,
          description,
          sections,
          currentValue: getCurrentToolChoice(toolType),
          icon: getToolTypeIcon(toolType),
        });
      } catch {
        // Skip tool types without translations
        console.warn(`Skipping tool type ${toolType} - no translation found`);
        return;
      }
    });

    return Array.from(typeGroups.values());
  };

  // Group tool types by category
  const groupToolsByCategory = (): ToolCategoryGroup[] => {
    const toolTypeGroups = groupToolsByType();
    const categoryGroups: Map<ToolGroupCategory, ToolCategoryGroup> = new Map();

    // Define category order
    const categoryOrder: ToolGroupCategory[] = [
      "text_intelligence",
      "content_analysis",
      "image_tools",
      "integrations",
    ];

    // Group tool types by category
    toolTypeGroups.forEach((toolTypeGroup) => {
      const category = getToolGroupCategory(toolTypeGroup.type);

      if (!categoryGroups.has(category)) {
        const titleKey = `tools.groups.${category}.title` as TranslationKey;
        const title = t(titleKey);

        categoryGroups.set(category, {
          category,
          title,
          icon: getToolGroupIcon(category),
          toolTypes: [],
        });
      }

      const categoryGroup = categoryGroups.get(category)!;
      categoryGroup.toolTypes.push(toolTypeGroup);
    });

    // Return in defined order, filtering out empty categories
    return categoryOrder
      .map((category) => categoryGroups.get(category))
      .filter(
        (group): group is ToolCategoryGroup =>
          group !== undefined && group.toolTypes.length > 0
      );
  };

  const categoryGroups = groupToolsByCategory();

  if (categoryGroups.length === 0) {
    return null; // Don't render if no valid tool types
  }

  return (
    <div className="w-full">
      <Accordion
        type="single"
        collapsible
        className="flex w-full flex-col gap-3"
        value={openSection}
        onValueChange={setOpenSection}
      >
        {categoryGroups.map((categoryGroup) => {
          const CategoryIcon = categoryGroup.icon;
          const isCurrentlyOpen = openSection === categoryGroup.category;
          const shouldReduceOpacity = openSection && !isCurrentlyOpen;
          const categoryChanged = isCategoryChanged(categoryGroup.category);

          return (
            <AccordionItem
              key={categoryGroup.category}
              value={categoryGroup.category}
              className={cn(
                // the accordion base drops the bottom border on the last item for
                // divided lists; these are discrete cards, so each keeps all four
                "overflow-hidden rounded-2xl border border-border bg-surface-subtle/70 shadow-[0_14px_42px_oklch(0.05_0.01_292/0.12)] last:border-b",
                isCurrentlyOpen && "border-primary/40 bg-secondary/48",
                shouldReduceOpacity && "opacity-55",
              )}
            >
              <AccordionTrigger
                className={cn(
                  "items-center px-5 py-4 text-left hover:no-underline sm:px-6",
                  "transition-opacity duration-200",
                  "[&>svg]:translate-y-0 [&>svg]:text-muted-foreground",
                )}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background/70 text-brand-coral-light",
                      isCurrentlyOpen && "border-primary/60 bg-background/85",
                    )}
                  >
                    <CategoryIcon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-base font-semibold tracking-tight text-foreground",
                        isCurrentlyOpen && "text-primary",
                      )}
                    >
                      {categoryGroup.title}
                      {categoryChanged && (
                        <span className="ml-1 inline-block text-sm leading-none text-accent-amber">
                          *
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="flex flex-col gap-5 px-5 pb-[1.5rem] sm:px-6">
                  {categoryGroup.toolTypes.map((toolTypeGroup) => (
                    <ToolTypeRow
                      key={toolTypeGroup.type}
                      group={toolTypeGroup}
                      changed={isToolTypeChanged(toolTypeGroup.type)}
                      remoteChoice={getRemoteToolChoice(toolTypeGroup.type)}
                      disabled={disabled}
                      hasCredits={hasCredits}
                      onToolChoiceChange={onToolChoiceChange}
                      onProviderNavigate={onProviderNavigate}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AdvancedToolsPanel;
