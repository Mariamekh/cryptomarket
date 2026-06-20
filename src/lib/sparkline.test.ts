import { describe, expect, it } from "vitest";
import { computeSparkline } from "./sparkline";

describe("computeSparkline", () => {
  it("returns empty geometry for fewer than two points", () => {
    const empty = computeSparkline([], 100, 40, 1);
    expect(empty).toEqual({ points: "", areaPoints: "", trendColor: "var(--muted)" });

    const single = computeSparkline([7], 100, 40, 1);
    expect(single.points).toBe("");
    expect(single.trendColor).toBe("var(--muted)");
  });

  it("maps values to inverted-Y coordinates (higher value = smaller y)", () => {
    const { points } = computeSparkline([0, 10], 100, 40, 1);
    expect(points).toBe("0.00,38.00 100.00,2.00");
  });

  it("wraps the area polygon with baseline corners", () => {
    const { areaPoints } = computeSparkline([0, 10], 100, 40, 1);
    expect(areaPoints).toBe("0,40 0.00,38.00 100.00,2.00 100,40");
  });

  it("emits one coordinate pair per data point", () => {
    const { points } = computeSparkline([1, 2, 3, 4, 5], 120, 36, 1.5);
    expect(points.split(" ")).toHaveLength(5);
  });

  it("colors an uptrend green and a downtrend red", () => {
    expect(computeSparkline([1, 2, 3], 100, 40, 1).trendColor).toBe("var(--green)");
    expect(computeSparkline([3, 2, 1], 100, 40, 1).trendColor).toBe("var(--red)");
  });

  it("treats equal endpoints as an uptrend and draws a flat line", () => {
    const { points, trendColor } = computeSparkline([5, 5, 5], 100, 40, 1);
    expect(points).toBe("0.00,38.00 50.00,38.00 100.00,38.00");
    expect(trendColor).toBe("var(--green)");
  });

  it("lets an explicit color override the trend color", () => {
    expect(computeSparkline([3, 2, 1], 100, 40, 1, "blue").trendColor).toBe("blue");
  });
});
