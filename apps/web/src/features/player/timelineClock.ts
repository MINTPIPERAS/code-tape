import type { TimelineClock } from "@/shared/recording-schema";

export type TimelineClockOptions = {
  nowProvider?: () => number;
};

/**
 * TimelineClock — drives the player. Maps wall time to timeline (recording) time
 * with `setRate(rate)` for playback speed and `setBase(t)` for seek.
 *
 * The internal model:
 *   timelineNow = baseTimelineMs + (wallNow - baseWallMs) * rate     when playing
 *   timelineNow = baseTimelineMs                                      when paused
 *
 * Subscribers are notified on play/pause/setBase/setRate so the UI can re-render
 * its progress indicator without polling.
 */
export function createTimelineClock(options: TimelineClockOptions = {}): TimelineClock {
  const now = options.nowProvider ?? (() => Date.now());

  let playing = false;
  let baseTimelineMs = 0;
  let baseWallMs = now();
  let rate = 1;
  const listeners = new Set<(t: number) => void>();

  const compute = (): number => {
    if (!playing) return baseTimelineMs;
    return baseTimelineMs + (now() - baseWallMs) * rate;
  };

  const publish = () => {
    const value = compute();
    listeners.forEach((listener) => listener(value));
  };

  return {
    play() {
      if (playing) return;
      baseWallMs = now();
      playing = true;
      publish();
    },
    pause() {
      if (!playing) return;
      baseTimelineMs = compute();
      playing = false;
      publish();
    },
    setBase(target) {
      baseTimelineMs = target;
      baseWallMs = now();
      publish();
    },
    setRate(nextRate) {
      baseTimelineMs = compute();
      baseWallMs = now();
      rate = nextRate;
      publish();
    },
    now: compute,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
