/**
 * Token registry mirroring `src/styles/tokens.css`.
 *
 * Components access tokens via `useTheme()` or `themeTokens.<name>` rather than
 * typing raw CSS variable names, so renames stay safe.
 */
export const themeTokens = {
  background: "var(--ct-color-background)",
  foreground: "var(--ct-color-foreground)",
  surface: "var(--ct-color-surface)",
  surfaceRaised: "var(--ct-color-surface-raised)",
  border: "var(--ct-color-border)",
  muted: "var(--ct-color-muted)",
  primary: "var(--ct-color-primary)",
  primaryForeground: "var(--ct-color-primary-foreground)",
  danger: "var(--ct-color-danger)",
  warning: "var(--ct-color-warning)",
  success: "var(--ct-color-success)",
  focus: "var(--ct-color-focus)",
  tooltip: "var(--ct-color-tooltip)",
  tooltipForeground: "var(--ct-color-tooltip-foreground)",
  popover: "var(--ct-color-popover)",
  popoverForeground: "var(--ct-color-popover-foreground)",
  record: "var(--ct-color-record)",
  pause: "var(--ct-color-pause)",
} as const;

export type ThemeTokenName = keyof typeof themeTokens;

export type ThemeMode = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";
