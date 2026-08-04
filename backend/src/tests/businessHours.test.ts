import { describe, expect, it } from "vitest";
import { isBusinessOpen } from "../utils/buisnesshours";

function localDate(day: number, hour: number, minute = 0): Date {
  // 2026-08-02 is a Sunday; add `day` to select the JavaScript weekday.
  return new Date(2026, 7, 2 + day, hour, minute);
}

describe("isBusinessOpen", () => {
  it("is open from 09:00 until 18:00 on weekdays", () => {
    expect(isBusinessOpen(localDate(1, 8, 59))).toBe(false);
    expect(isBusinessOpen(localDate(1, 9))).toBe(true);
    expect(isBusinessOpen(localDate(5, 17, 59))).toBe(true);
    expect(isBusinessOpen(localDate(5, 18))).toBe(false);
  });

  it("is open from 10:00 until 14:00 on Saturday", () => {
    expect(isBusinessOpen(localDate(6, 9, 59))).toBe(false);
    expect(isBusinessOpen(localDate(6, 10))).toBe(true);
    expect(isBusinessOpen(localDate(6, 13, 59))).toBe(true);
    expect(isBusinessOpen(localDate(6, 14))).toBe(false);
  });

  it("is closed all day on Sunday", () => {
    expect(isBusinessOpen(localDate(0, 12))).toBe(false);
  });
});
