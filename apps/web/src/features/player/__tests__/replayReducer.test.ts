import { describe, expect, it } from "vitest";
import { replayReducer, STABLE_EVENT_TYPES } from "../replayReducer";
import { buildInitialState } from "../initialState";
import type { RecordingEvent, RecordingPackageV1 } from "@/shared/recording-schema";
import { RECORDING_SCHEMA_VERSION } from "@/shared/recording-schema";

function makePkg(): RecordingPackageV1 {
  return {
    schemaVersion: RECORDING_SCHEMA_VERSION,
    manifest: {
      packageId: "p",
      schemaVersion: RECORDING_SCHEMA_VERSION,
      status: "complete",
      createdAt: "2026-05-24T00:00:00.000Z",
      completedAt: null,
      checksums: { eventsSha256: "", snapshotsSha256: "" },
    },
    meta: {
      id: "rec",
      title: "t",
      createdAt: "2026-05-24T00:00:00.000Z",
      durationMs: 1000,
      appVersion: "0",
      ownerId: null,
      creatorInfo: null,
      initialLanguage: "javascript",
      initialFontSize: 14,
      initialTheme: "dark",
      mediaCapability: {
        audio: "available",
        camera: "available",
        selectedAudioDeviceId: null,
        selectedCameraDeviceId: null,
      },
    },
    events: [],
    snapshots: [],
    media: null,
  };
}

function contentEvent(seq: number, code: string): RecordingEvent {
  return {
    id: `e-${seq}`,
    seq,
    timestampMs: seq * 100,
    source: "editor",
    track: "main",
    type: "content-change",
    payload: {
      fileId: "main",
      version: seq,
      code,
      contentHash: code,
      language: "typescript",
      changeReason: "input",
      changeCount: 1,
      flushedBy: "debounce",
    },
  };
}

describe("replayReducer", () => {
  it("applies content-change to editor.code and language", () => {
    let state = buildInitialState(makePkg());
    state = replayReducer(state, contentEvent(1, "const x = 1;"));
    expect(state.editor.code).toBe("const x = 1;");
    expect(state.editor.language).toBe("typescript");
  });

  it("ignores transient events (mouse-move, shortcut, marker)", () => {
    const state = buildInitialState(makePkg());
    const move: RecordingEvent = {
      id: "m",
      seq: 1,
      timestampMs: 100,
      source: "pointer",
      track: "ui",
      type: "mouse-move",
      payload: { x: 1, y: 2, containerWidth: 1024, containerHeight: 768 },
    };
    const next = replayReducer(state, move);
    expect(next).toBe(state);
  });

  it("STABLE_EVENT_TYPES covers exactly the reducer-handled set", () => {
    expect(STABLE_EVENT_TYPES.has("content-change")).toBe(true);
    expect(STABLE_EVENT_TYPES.has("mouse-move")).toBe(false);
    expect(STABLE_EVENT_TYPES.has("shortcut")).toBe(false);
    expect(STABLE_EVENT_TYPES.has("record-pause")).toBe(false);
  });
});
