import type {
  ReplayPlaybackRate,
  ReplaySchedulerState,
} from "@/shared/recording-schema";
import { formatDurationMs } from "@/shared/time/duration";

export type ReplayControlsProps = {
  state: ReplaySchedulerState;
  durationMs: number;
  onPlayPause(): void;
  onSeek(targetMs: number): void;
  onRate(rate: ReplayPlaybackRate): void;
};

/**
 * ReplayControls — playback bar (play/pause, progress, time, rate, volume).
 *
 * STUB. Real implementation belongs to issue
 * `[P0] ReplayControls 控制条 UI（含倍速/音量/进度条）`.
 *
 * 实装要点：
 *   - Slider 用 shared/ui/Slider；onChange = light seek (UI only), onCommit = real seek
 *   - 倍速：0.5 / 1 / 1.5 / 2 用 Popover 暴露
 *   - 音量：Slider 0-100；mute Toggle
 *   - 章节标记：从 schedulerState 衍生（实际上得用 index.markersByTime），在 issue 内
 *     接通；当前只显示空 tick 槽
 *   - 状态色：playing=primary, seeking=warning, ended=success, error=danger
 *   - 时间字号用 font-mono 保持等宽
 */
export function ReplayControls({ state, durationMs }: ReplayControlsProps) {
  return (
    <div className="flex h-12 items-center gap-3 border-t border-border bg-surface/80 px-4">
      <span className="font-mono text-sm text-muted">{formatDurationMs(state.timelineTimeMs)}</span>
      <div className="flex-1">
        <div className="h-1 w-full rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-100"
            style={{
              width: durationMs > 0
                ? `${Math.min(100, (state.timelineTimeMs / durationMs) * 100)}%`
                : "0%",
            }}
          />
        </div>
      </div>
      <span className="font-mono text-sm text-muted">{formatDurationMs(durationMs)}</span>
      <span className="text-xs uppercase tracking-wide text-muted">
        {state.status} · {state.playbackRate}x
      </span>
      <span className="text-xs text-muted">
        ReplayControls stub · 待 issue 实装
      </span>
    </div>
  );
}
