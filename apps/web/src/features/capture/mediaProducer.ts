import type { CreateMediaProducer, MediaProducerHandle } from "./types";

/**
 * MediaProducer — emits media-toggle / media-warning / camera-position.
 *
 * STUB. Real implementation belongs to issue `[P0] mediaProducer 实装 + CameraPreview 拖拽`.
 *
 * 实装时需要：
 *   - 订阅 deps.devices.subscribe(capability)：capability 变化时若降级为 denied/busy
 *     → emit media-warning
 *   - setMicrophoneEnabled / setCameraEnabled：调用 devices.setTrackEnabled
 *     + emit media-toggle（payload 含两个 track 的最新状态）
 *   - reportCameraPosition：throttle 50ms → camera-position
 *   - pause() 期间禁用上述输入（ADR-022：暂停期间冻结影响回放状态的输入）
 *   - dispose() 调 devices.release()
 */
export const createMediaProducer: CreateMediaProducer = (_deps): MediaProducerHandle => {
  return {
    start() {},
    pause() {},
    resume() {},
    stop() {},
    dispose() {},
    setMicrophoneEnabled(_enabled) {},
    setCameraEnabled(_enabled) {},
    reportCameraPosition(_position) {},
  };
};
