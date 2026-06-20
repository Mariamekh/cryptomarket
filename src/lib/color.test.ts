import { describe, expect, it } from "vitest";
import { colorFromString } from "./color";

describe("colorFromString", () => {
  it("is deterministic for the same input", () => {
    expect(colorFromString("bitcoin")).toBe(colorFromString("bitcoin"));
  });

  it("produces a valid hsl string with fixed saturation and lightness", () => {
    const color = colorFromString("ethereum");
    expect(color).toMatch(/^hsl\(\d{1,3} 55% 42%\)$/);
    const hue = Number(color.slice(4, color.indexOf(" ")));
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it("derives the hue from the input (known small cases)", () => {
    expect(colorFromString("")).toBe("hsl(0 55% 42%)");
    expect(colorFromString("a")).toBe("hsl(97 55% 42%)");
    expect(colorFromString("ab")).toBe("hsl(225 55% 42%)");
  });

  it("varies the hue across different inputs", () => {
    expect(colorFromString("a")).not.toBe(colorFromString("b"));
  });
});
