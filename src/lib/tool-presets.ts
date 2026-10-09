import {
  ApiPresetChoices,
  IntelligencePreset,
  isSelectableToolType,
  PresetChoices,
  ToolType,
  UsagePurpose,
} from "@/services/external-tools-service";
import { UserSettings } from "@/services/user-settings-service";

export type ToolPreset = IntelligencePreset | "custom";
export type ApiPresets = Record<IntelligencePreset, ApiPresetChoices>;

function getSelectableChoices(choices: ApiPresetChoices): PresetChoices {
  const selectableChoices: PresetChoices = {};
  for (const toolType of Object.keys(choices) as UsagePurpose[]) {
    if (isSelectableToolType(toolType)) {
      selectableChoices[toolType] = choices[toolType];
    }
  }
  return selectableChoices;
}

export function computePresetChoices(
  preset: IntelligencePreset,
  apiPresets: ApiPresets,
): PresetChoices {
  const choices = apiPresets[preset];
  if (!choices || Object.keys(choices).length === 0) {
    console.warn(`Preset "${preset}" has no tool choices configured`);
    return {};
  }
  return getSelectableChoices(choices);
}

export function detectCurrentPreset(
  currentSettings: UserSettings,
  apiPresets: ApiPresets,
): ToolPreset {
  const presetNames = Object.keys(apiPresets) as IntelligencePreset[];

  for (const preset of presetNames) {
    const choices = getSelectableChoices(apiPresets[preset]);
    const typesWithChoices = Object.keys(choices) as ToolType[];
    if (typesWithChoices.length === 0) continue;

    const matches = typesWithChoices.every((toolType) => {
      const fieldName = `tool_choice_${toolType}` as keyof UserSettings;
      return currentSettings[fieldName] === choices[toolType];
    });

    if (matches) return preset;
  }

  return "custom";
}
