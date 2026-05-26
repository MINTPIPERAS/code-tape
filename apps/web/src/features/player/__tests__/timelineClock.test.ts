import { describe, expect, it } from "vitest";
import { createTimelineClock } from "../timelineClock";

function makeClock() {
  let wall = 0;
  const clock = createTimelineClock({ nowProvider: () => wall });
  const advance = (ms: number) => {
    wall += ms;
  };
  return { clock, advance };
}

describe("createTimelineClock", () => {
  it("starts at 0 and stays put when paused", () => {
    const { clock, advance } = makeClock();
    expect(clock.now()).toBe(0);
    advance(500);
    expect(clock.now()).toBe(0);
  });

  it("advances at rate * wall delta when playing", () => {
    const { clock, advance } = makeClock();
    clock.play();
    advance(1000);
    expect(clock.now()).toBe(1000);
    clock.setRate(2);
    advance(500);
    expect(clock.now()).toBe(2000);
  });

  it("setBase moves the timeline cursor without affecting wall delta", () => {
    const { clock, advance } = makeClock();
    clock.setBase(5000);
    expect(clock.now()).toBe(5000);
    clock.play();
    advance(1000);
    expect(clock.now()).toBe(6000);
  });

  it("pause freezes time at current value", () => {
    const { clock, advance } = makeClock();
    clock.play();
    advance(700);
    clock.pause();
    advance(9999);
    expect(clock.now()).toBe(700);
  });

  it("notifies subscribers on play/pause/setBase/setRate", () => {
    const { clock } = makeClock();
    const seen: number[] = [];
    clock.subscribe((t) => seen.push(t));
    clock.play();
    clock.pause();
    clock.setBase(1000);
    clock.setRate(1.5);
    expect(seen.length).toBeGreaterThanOrEqual(4);
  });
});
