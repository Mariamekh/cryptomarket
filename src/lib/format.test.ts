import { describe, expect, it } from "vitest";
import {
  formatCompact,
  formatPercent,
  formatPrice,
  formatRelativeTime,
} from "./format";

describe("formatPrice", () => {
  it("formats normal prices as 2dp currency", () => {
    expect(formatPrice(67000)).toBe("$67,000.00");
  });
  it("uses extra precision for sub-dollar coins", () => {
    expect(formatPrice(0.00002)).toMatch(/^\$0\.00002/);
  });
  it("renders a dash for missing values", () => {
    expect(formatPrice(null)).toBe("—");
  });
});

describe("formatCompact", () => {
  it("abbreviates trillions and billions", () => {
    expect(formatCompact(1.23e12)).toBe("$1.23T");
    expect(formatCompact(3.456e8)).toBe("$345.60M");
  });
  it("renders a dash for missing values", () => {
    expect(formatCompact(undefined)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("signs positive and negative changes", () => {
    expect(formatPercent(1.234)).toBe("+1.23%");
    expect(formatPercent(-4.5)).toBe("-4.50%");
  });
  it("renders a dash for null windows", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  it("counts seconds then minutes", () => {
    const now = 1_000_000;
    expect(formatRelativeTime(now - 5_000, now)).toBe("5s ago");
    expect(formatRelativeTime(now - 125_000, now)).toBe("2m ago");
  });
});
