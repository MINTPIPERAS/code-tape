import type { RecordingPackageV1, ReplayStableState } from "@/shared/recording-schema";

/** Compute the t=0 ReplayStableState before any event has been applied. */
export function buildInitialState(pkg: RecordingPackageV1): ReplayStableState {
  return {
    editor: {
      code: "",
      language: pkg.meta.initialLanguage,
      cursor: null,
      selection: null,
      scrollTop: 0,
      scrollLeft: 0,
      fontSize: pkg.meta.initialFontSize,
      theme: pkg.meta.initialTheme,
    },
    pointer: null,
    media: {
      microphoneEnabled: false,
      cameraEnabled: false,
      cameraPosition: { x: 0, y: 0 },
    },
    runtime: {
      status: "idle",
      stdout: [],
      stderr: [],
      previewHtml: null,
      errorMessage: null,
    },
  };
}

/** Deep clone (structuredClone if available; JSON fallback otherwise). */
export function cloneState(state: ReplayStableState): ReplayStableState {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state)) as ReplayStableState;
}
