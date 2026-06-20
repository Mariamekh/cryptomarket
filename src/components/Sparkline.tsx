import { memo, useMemo } from "react";
import { computeSparkline } from "../lib/sparkline";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

function SparklineBase({
  data,
  width = 120,
  height = 36,
  strokeWidth = 1.5,
  color,
  className,
}: Props) {
  const { points, areaPoints, trendColor } = useMemo(
    () => computeSparkline(data, width, height, strokeWidth, color),
    [data, width, height, strokeWidth, color],
  );

  if (!points) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon points={areaPoints} fill={trendColor} opacity={0.08} />
      <polyline
        points={points}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineBase);
