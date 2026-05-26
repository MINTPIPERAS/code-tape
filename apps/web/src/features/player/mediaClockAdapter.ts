import type { MediaClockAdapter, MediaTimelineSegment } from "@/shared/recording-schema";

export type MediaClockAdapterOptions = {
  segments: MediaTimelineSegment[];
  /** Seek the underlying HTMLMediaElement; receives mediaTime in ms. */
  seekHandler?: (segment: MediaTimelineSegment, mediaTimeMs: number) => Promise<void> | void;
  /** Adjust playback rate of the underlying HTMLMediaElement. */
  rateHandler?: (rate: number) => void;
};

/**
 * MediaClockAdapter — bidirectional mapping between the recording's "effective"
 * timeline (which excludes paused intervals) and one or more media segments
 * (which are real wall-time WebM blobs concatenated).
 *
 * For P0, recordings typically have exactly one segment. The adapter still
 * accepts multiple segments so a future "concat pause islands" optimization
 * doesn't require an interface bump.
 */
export function createMediaClockAdapter(options: MediaClockAdapterOptions): MediaClockAdapter {
  const segments = options.segments.slice().sort((a, b) => a.timelineStartMs - b.timelineStartMs);

  const findSegmentForTimeline = (targetMs: number): MediaTimelineSegment | null => {
    let lo = 0;
    let hi = segments.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const seg = segments[mid];
      if (targetMs < seg.timelineStartMs) hi = mid - 1;
      else if (targetMs > seg.timelineEndMs) lo = mid + 1;
      else return seg;
    }
    return null;
  };

  return {
    segments,
    timelineToMediaTime(targetMs) {
      const seg = findSegmentForTimeline(targetMs);
      if (!seg) return null;
      return seg.mediaStartMs + (targetMs - seg.timelineStartMs);
    },
    mediaToTimelineTime(mediaCurrentTimeSec) {
      const mediaMs = mediaCurrentTimeSec * 1000;
      for (const seg of segments) {
        if (mediaMs >= seg.mediaStartMs && mediaMs <= seg.mediaEndMs) {
          return seg.timelineStartMs + (mediaMs - seg.mediaStartMs);
        }
      }
      return null;
    },
    async seek(targetMs) {
      const seg = findSegmentForTimeline(targetMs);
      if (!seg) return;
      const mediaTimeMs = seg.mediaStartMs + (targetMs - seg.timelineStartMs);
      await options.seekHandler?.(seg, mediaTimeMs);
    },
    setRate(rate) {
      options.rateHandler?.(rate);
    },
  };
}
