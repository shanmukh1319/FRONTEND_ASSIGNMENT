import type { FormConfig } from "../types/form";
import loginFormConfig from "../config/loginForm.json";
import signupFormConfig from "../config/signupForm.json";

/**
 * Load form configuration from JSON files
 * This allows dynamic form configuration without code changes
 */
export function loadFormConfig(configName: "login" | "signup"): FormConfig {
  switch (configName) {
    case "login":
      return loginFormConfig as FormConfig;
    case "signup":
      return signupFormConfig as FormConfig;
    default:
      throw new Error(`Unknown config name: ${configName}`);
  }
}
