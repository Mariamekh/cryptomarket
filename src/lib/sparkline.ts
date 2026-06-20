export interface SparklineGeometry {
  points: string;
  areaPoints: string;
  trendColor: string;
}

export function computeSparkline(
  data: number[],
  width: number,
  height: number,
  strokeWidth: number,
  color?: string,
): SparklineGeometry {
  if (!data || data.length < 2) {
    return { points: "", areaPoints: "", trendColor: "var(--muted)" };
  }

  let min = Infinity;
  let max = -Infinity;
  for (const p of data) {
    if (p < min) min = p;
    if (p > max) max = p;
  }

  const range = max - min || 1;
  const pad = strokeWidth + 1;
  const usableH = height - pad * 2;
  const stepX = width / (data.length - 1);

  const coords = data.map((p, i) => {
    const x = i * stepX;
    const y = pad + (1 - (p - min) / range) * usableH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const up = data[data.length - 1] >= data[0];

  return {
    points: coords.join(" "),
    areaPoints: `0,${height} ${coords.join(" ")} ${width},${height}`,
    trendColor: color ?? (up ? "var(--green)" : "var(--red)"),
  };
}
