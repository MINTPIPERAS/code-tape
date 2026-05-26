import type { RecordingEvent, ReplayReducer, ReplayStableState } from "@/shared/recording-schema";

/**
 * Pure reducer that folds a single event into the replay's stable state.
 *
 * Stable state only includes things you'd want to see when seeking — code,
 * cursor, language, scroll, media toggles, last runtime output. Transient
 * effects (mouse position, shortcut badge flashes, runtime stdout streaming
 * inside a single run) are layered on top by the ReplayScheduler at render
 * time, NOT by this reducer.
 */
export const replayReducer: ReplayReducer = (
  state: ReplayStableState,
  event: RecordingEvent,
): ReplayStableState => {
  switch (event.type) {
    case "content-change":
      return {
        ...state,
        editor: {
          ...state.editor,
          code: event.payload.code,
          language: event.payload.language,
        },
      };
    case "language-change":
      return {
        ...state,
        editor: { ...state.editor, language: event.payload.to },
      };
    case "selection-change":
      return {
        ...state,
        editor: {
          ...state.editor,
          cursor: event.payload.cursor,
          selection: event.payload.selection,
        },
      };
    case "editor-scroll":
      return {
        ...state,
        editor: {
          ...state.editor,
          scrollTop: event.payload.scrollTop,
          scrollLeft: event.payload.scrollLeft,
        },
      };
    case "media-toggle":
      return {
        ...state,
        media: {
          ...state.media,
          microphoneEnabled: event.payload.microphoneEnabled,
          cameraEnabled: event.payload.cameraEnabled,
        },
      };
    case "camera-position":
      return {
        ...state,
        media: { ...state.media, cameraPosition: { x: event.payload.x, y: event.payload.y } },
      };
    case "run-start":
      return {
        ...state,
        runtime: { status: "running", stdout: [], stderr: [], previewHtml: null, errorMessage: null },
      };
    case "run-output":
      return {
        ...state,
        runtime: {
          status: "success",
          stdout: event.payload.stdout,
          stderr: event.payload.stderr,
          previewHtml: event.payload.previewHtml,
          errorMessage: null,
        },
      };
    case "run-error":
      return {
        ...state,
        runtime: {
          status: "error",
          stdout: event.payload.stdout,
          stderr: event.payload.stderr,
          previewHtml: event.payload.previewHtml,
          errorMessage: event.payload.message,
        },
      };
    case "resume-baseline":
      return event.payload.snapshot;
    // Transient / lifecycle events do not change stable state.
    case "record-start":
    case "record-pause":
    case "record-resume":
    case "record-stop":
    case "mouse-move":
    case "mouse-click":
    case "shortcut":
    case "media-warning":
    case "chapter-marker":
      return state;
    default: {
      // Exhaustiveness — TS will complain if a new event type is added without handling.
      const _unhandled: never = event;
      void _unhandled;
      return state;
    }
  }
};

/** Affected event types — stable events only. Used by replayIndex.stableEventsByTime. */
export const STABLE_EVENT_TYPES = new Set([
  "content-change",
  "language-change",
  "selection-change",
  "editor-scroll",
  "media-toggle",
  "camera-position",
  "run-start",
  "run-output",
  "run-error",
  "resume-baseline",
]);
