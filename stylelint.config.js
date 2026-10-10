export default {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss"],
  rules: {
    "at-rule-no-unknown": null,
    "at-rule-no-deprecated": null,
    "at-rule-prelude-no-invalid": [
      true,
      {
        ignoreAtRules: ["apply"],
      },
    ],
    "color-function-notation": null,
    "hue-degree-notation": null,
    "lightness-notation": null,
  },
};
