import {
  IntelligencePreset,
  PresetChoices,
  ToolType,
} from "@/services/external-tools-service";
import { UserSettings } from "@/services/user-settings-service";

export type ToolPreset = IntelligencePreset | "custom";
export type ApiPresets = Record<IntelligencePreset, PresetChoices>;

export function computePresetChoices(
  preset: IntelligencePreset,
  apiPresets: ApiPresets,
): PresetChoices {
  const choices = apiPresets[preset];
  if (!choices || Object.keys(choices).length === 0) {
    console.warn(`Preset "${preset}" has no tool choices configured`);
    return {};
  }
  return choices;
}

export function detectCurrentPreset(
  currentSettings: UserSettings,
  apiPresets: ApiPresets,
): ToolPreset {
  const presetNames = Object.keys(apiPresets) as IntelligencePreset[];

  for (const preset of presetNames) {
    const choices = apiPresets[preset];
    const typesWithChoices = Object.keys(choices) as ToolType[];

    const matches = typesWithChoices.every((toolType) => {
      const fieldName = `tool_choice_${toolType}` as keyof UserSettings;
      return currentSettings[fieldName] === choices[toolType];
    });

    if (matches) return preset;
  }

  return "custom";
}
