import { describe, expect, it, beforeEach } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { ThemeProvider } from "../themeProvider";
import { useTheme } from "../useTheme";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "";
});

describe("ThemeProvider", () => {
  it("defaults to system preference and resolves to dark when matchMedia returns dark", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.preference).toBe("system");
    expect(result.current.resolved).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("persists preference to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.setPreference("light"));
    expect(window.localStorage.getItem("code-tape:theme")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("toggle flips between resolved themes", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.setPreference("dark"));
    expect(result.current.resolved).toBe("dark");
    act(() => result.current.toggle());
    expect(result.current.resolved).toBe("light");
  });

  it("throws when used outside provider", () => {
    function Probe() {
      useTheme();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(/inside <ThemeProvider>/);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
