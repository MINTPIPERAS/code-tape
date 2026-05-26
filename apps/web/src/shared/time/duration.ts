/**
 * Format milliseconds as `hh:mm:ss` or `mm:ss` (when under one hour).
 *
 * 用于录制时长和回放进度显示。负值会被 clamp 到 0；超过 100 小时仍正确显示
 * （但 UI 期望由录制时长上限约束在合理范围）。
 */
export function formatDurationMs(durationMs: number): string {
  const total = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/** Clamp ms into [min, max], coercing NaN to min. */
export function clampMs(ms: number, min: number, max: number): number {
  if (Number.isNaN(ms)) return min;
  if (ms < min) return min;
  if (ms > max) return max;
  return ms;
}

/** Convert seconds (e.g. HTMLMediaElement.currentTime) to ms with rounding. */
export function secondsToMs(seconds: number): number {
  return Math.round(seconds * 1000);
}

/** Convert ms to seconds (for HTMLMediaElement.currentTime setters). */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}
