import type {
  MediaClockAdapter,
  RecordingEvent,
  RecordingPackageV1,
  ReplayPlaybackRate,
  ReplayScheduler,
  ReplaySchedulerState,
  ReplayStableState,
  TimelineClock,
} from "@/shared/recording-schema";
import { buildInitialState, cloneState } from "./initialState";
import { findSnapshotAtMost, buildReplayIndex } from "./replayIndex";
import { replayReducer } from "./replayReducer";
import { createTimelineClock } from "./timelineClock";

export type TickListener = (
  state: ReplayStableState,
  transientEvents: RecordingEvent[],
  timelineTimeMs: number,
) => void;

export type ReplaySchedulerOptions = {
  clock?: TimelineClock;
  mediaAdapter?: MediaClockAdapter | null;
  /**
   * Drives the rendering loop. Tests pass a synchronous ticker; the runtime
   * driver passes a requestAnimationFrame-based ticker.
   */
  tickStrategy?: TickStrategy;
  /** Notify on each tick — receives the new stable state and any transient
   *  events (mouse-move/shortcut flashes) that arrived during the tick. */
  onTick?: TickListener;
};

export type TickStrategy = {
  start(onFrame: () => void): void;
  stop(): void;
};

const DEFAULT_RAF_INTERVAL_MS = 1000 / 60;

export function defaultTickStrategy(): TickStrategy {
  let handle: number | null = null;
  return {
    start(onFrame) {
      if (handle !== null) return;
      const loop = () => {
        onFrame();
        if (typeof requestAnimationFrame === "function") {
          handle = requestAnimationFrame(loop) as unknown as number;
        } else {
          handle = setTimeout(loop, DEFAULT_RAF_INTERVAL_MS) as unknown as number;
        }
      };
      handle = typeof requestAnimationFrame === "function"
        ? (requestAnimationFrame(loop) as unknown as number)
        : (setTimeout(loop, DEFAULT_RAF_INTERVAL_MS) as unknown as number);
    },
    stop() {
      if (handle === null) return;
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(handle);
      else clearTimeout(handle);
      handle = null;
    },
  };
}

/**
 * Replay scheduler — owns:
 *   - timeline clock (advances replay time per playback rate)
 *   - replay index (events by seq/type/time)
 *   - replay state (current stable state + last applied seq)
 *   - tick loop (consumes scheduled events between two timestamps)
 *
 * Seek algorithm (matches ADR-011 inclusive-snapshot strategy):
 *   1. Find snapshot S with timestamp <= target. State = snapshot's state.
 *   2. Apply every stable event whose seq > S.eventSeq and timestamp <= target.
 *   3. Set lastAppliedSeq to the highest event applied (or S.eventSeq if none).
 */
export function createReplayScheduler(options: ReplaySchedulerOptions = {}): ReplayScheduler & {
  /** Test hook — runs a single tick without the driver loop. */
  tick(): void;
  /** Test hook — exposes the latest stable state. */
  getStableState(): ReplayStableState;
} {
  const clock = options.clock ?? createTimelineClock();
  const tickStrategy = options.tickStrategy ?? defaultTickStrategy();
  const stateListeners = new Set<(s: ReplaySchedulerState) => void>();
  let pkg: RecordingPackageV1 | null = null;
  let index = emptyIndex();
  let initial: ReplayStableState = emptyState();
  let stableState: ReplayStableState = emptyState();
  let driving = false;

  let schedulerState: ReplaySchedulerState = {
    status: "loading",
    timelineTimeMs: 0,
    playbackRate: 1,
    lastAppliedSeq: 0,
    mediaStatus: options.mediaAdapter ? "loading" : "none",
    driftMs: 0,
  };

  const publish = () => stateListeners.forEach((fn) => fn(schedulerState));
  const updateState = (patch: Partial<ReplaySchedulerState>) => {
    schedulerState = { ...schedulerState, ...patch };
    publish();
  };

  const recomputeFromTime = (targetMs: number): { state: ReplayStableState; lastSeq: number } => {
    const snapshot = findSnapshotAtMost(index.snapshotsByTime, targetMs);
    let state = snapshot ? cloneState(snapshot.state) : cloneState(initial);
    let lastSeq = snapshot ? snapshot.eventSeq : 0;
    for (const event of index.stableEventsByTime) {
      if (event.timestampMs > targetMs) break;
      if (event.seq <= lastSeq) continue;
      state = replayReducer(state, event);
      lastSeq = Math.max(lastSeq, event.seq);
    }
    return { state, lastSeq };
  };

  const tickOnce = () => {
    if (!pkg) return;
    const now = clock.now();
    if (now <= schedulerState.timelineTimeMs) {
      updateState({ timelineTimeMs: Math.max(0, now) });
      options.onTick?.(stableState, [], now);
      return;
    }
    const transientEvents: RecordingEvent[] = [];
    let lastSeq = schedulerState.lastAppliedSeq;
    for (const event of index.eventsBySeq) {
      if (event.seq <= lastSeq) continue;
      if (event.timestampMs > now) break;
      if (
        event.type === "mouse-move" ||
        event.type === "mouse-click" ||
        event.type === "shortcut" ||
        event.type === "chapter-marker"
      ) {
        transientEvents.push(event);
      } else {
        stableState = replayReducer(stableState, event);
      }
      lastSeq = event.seq;
    }
    const ended = pkg.meta.durationMs > 0 && now >= pkg.meta.durationMs;
    updateState({
      timelineTimeMs: ended ? pkg.meta.durationMs : now,
      lastAppliedSeq: lastSeq,
      status: ended ? "ended" : schedulerState.status,
    });
    if (ended) {
      tickStrategy.stop();
      driving = false;
    }
    options.onTick?.(stableState, transientEvents, schedulerState.timelineTimeMs);
  };

  const ensureDriving = () => {
    if (driving) return;
    driving = true;
    tickStrategy.start(tickOnce);
  };

  return {
    async load(input) {
      pkg = input;
      index = buildReplayIndex(input);
      initial = buildInitialState(input);
      stableState = cloneState(initial);
      tickStrategy.stop();
      driving = false;
      updateState({
        status: "ready",
        timelineTimeMs: 0,
        lastAppliedSeq: 0,
        mediaStatus: input.media ? "loading" : "none",
      });
    },
    play() {
      if (!pkg) return;
      clock.play();
      updateState({ status: "playing" });
      ensureDriving();
    },
    pause() {
      clock.pause();
      tickStrategy.stop();
      driving = false;
      updateState({ status: "paused" });
    },
    async seek(targetMs) {
      if (!pkg) return;
      tickStrategy.stop();
      driving = false;
      updateState({ status: "seeking" });
      const clamped = Math.max(0, Math.min(targetMs, pkg.meta.durationMs));
      const { state, lastSeq } = recomputeFromTime(clamped);
      stableState = state;
      clock.setBase(clamped);
      if (options.mediaAdapter) await options.mediaAdapter.seek(clamped);
      updateState({
        timelineTimeMs: clamped,
        lastAppliedSeq: lastSeq,
        status: "paused",
      });
      options.onTick?.(stableState, [], clamped);
    },
    setRate(rate: ReplayPlaybackRate) {
      clock.setRate(rate);
      options.mediaAdapter?.setRate(rate);
      updateState({ playbackRate: rate });
    },
    setVolume(_volume) {
      /* Forwarded by the HTMLMediaElement driver — schedulerState doesn't track it. */
    },
    setMuted(_muted) {
      /* Forwarded by the HTMLMediaElement driver. */
    },
    destroy() {
      tickStrategy.stop();
      stateListeners.clear();
      driving = false;
      pkg = null;
    },
    subscribe(listener) {
      stateListeners.add(listener);
      listener(schedulerState);
      return () => stateListeners.delete(listener);
    },
    tick: tickOnce,
    getStableState: () => stableState,
  };
}

function emptyIndex() {
  return {
    eventsBySeq: [],
    eventsByType: new Map(),
    snapshotsByTime: [],
    stableEventsByTime: [],
    markersByTime: [],
  } as const as ReturnType<typeof buildReplayIndex>;
}

function emptyState(): ReplayStableState {
  return {
    editor: {
      code: "",
      language: "javascript",
      cursor: null,
      selection: null,
      scrollTop: 0,
      scrollLeft: 0,
      fontSize: 14,
      theme: "dark",
    },
    pointer: null,
    media: { microphoneEnabled: false, cameraEnabled: false, cameraPosition: { x: 0, y: 0 } },
    runtime: { status: "idle", stdout: [], stderr: [], previewHtml: null, errorMessage: null },
  };
}
