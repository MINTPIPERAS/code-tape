import { createContext } from "react";
import type { themeTokens, ThemeMode, ThemePreference } from "./themeTokens";

export type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ThemeMode;
  setPreference(preference: ThemePreference): void;
  toggle(): void;
  tokens: typeof themeTokens;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
