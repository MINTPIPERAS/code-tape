import { describe, expect, it } from "vitest";
import { clampMs, formatDurationMs, msToSeconds, secondsToMs } from "../duration";

describe("formatDurationMs", () => {
  it("formats sub-hour as mm:ss", () => {
    expect(formatDurationMs(0)).toBe("00:00");
    expect(formatDurationMs(1_000)).toBe("00:01");
    expect(formatDurationMs(65_000)).toBe("01:05");
  });
  it("formats hour-plus as hh:mm:ss", () => {
    expect(formatDurationMs(3_600_000)).toBe("1:00:00");
    expect(formatDurationMs(3_725_000)).toBe("1:02:05");
  });
  it("clamps negatives to zero", () => {
    expect(formatDurationMs(-1)).toBe("00:00");
  });
});

describe("clampMs", () => {
  it("clamps below min", () => {
    expect(clampMs(-1, 0, 100)).toBe(0);
  });
  it("clamps above max", () => {
    expect(clampMs(101, 0, 100)).toBe(100);
  });
  it("coerces NaN to min", () => {
    expect(clampMs(Number.NaN, 5, 10)).toBe(5);
  });
});

describe("secondsToMs / msToSeconds", () => {
  it("round-trips for whole seconds", () => {
    expect(secondsToMs(1.234)).toBe(1234);
    expect(msToSeconds(1234)).toBeCloseTo(1.234);
  });
});
