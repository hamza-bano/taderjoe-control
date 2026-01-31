import { useMemo } from "react";
import { Kline } from "@/types/market";
import { cn } from "@/lib/utils";

interface CandlestickChartProps {
  klines: Kline[];
  currentKline: Kline | null;
  interval: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(2)}K`;
  return vol.toFixed(2);
}

export function CandlestickChart({
  klines,
  currentKline,
  interval,
  title,
  compact = false,
  className,
}: CandlestickChartProps) {
  // Combine closed klines with current kline for display
  const displayKlines = useMemo(() => {
    const all = [...klines];
    if (currentKline) {
      // Replace or add current kline
      const existingIdx = all.findIndex(
        (k) => k.OpenTime === currentKline.OpenTime
      );
      if (existingIdx >= 0) {
        all[existingIdx] = currentKline;
      } else {
        all.push(currentKline);
      }
    }
    return all.slice(-50); // Show last 50 candles
  }, [klines, currentKline]);

  // Calculate price range for scaling
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (displayKlines.length === 0) {
      return { minPrice: 0, maxPrice: 0, priceRange: 1 };
    }
    let min = Infinity;
    let max = -Infinity;
    displayKlines.forEach((k) => {
      const low = parseFloat(k.Low);
      const high = parseFloat(k.High);
      if (low < min) min = low;
      if (high > max) max = high;
    });
    const padding = (max - min) * 0.1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2,
    };
  }, [displayKlines]);

  // Current price info
  const latestKline = currentKline || displayKlines[displayKlines.length - 1];
  const priceChange = latestKline
    ? parseFloat(latestKline.Close) - parseFloat(latestKline.Open)
    : 0;
  const priceChangePct = latestKline
    ? (priceChange / parseFloat(latestKline.Open)) * 100
    : 0;

  if (displayKlines.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        Waiting for kline data...
      </div>
    );
  }

  const chartHeight = compact ? 150 : 300;
  const candleWidth = compact ? 6 : 10;
  const chartWidth = displayKlines.length * (candleWidth + 2);

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {title || `${latestKline?.Symbol || "---"} ${interval}`}
          </h3>
          {latestKline && (
            <>
              <span className="text-lg font-bold font-mono text-foreground">
                {formatPrice(parseFloat(latestKline.Close))}
              </span>
              <span
                className={cn(
                  "text-sm font-mono",
                  priceChange >= 0 ? "text-status-ready" : "text-destructive"
                )}
              >
                {priceChange >= 0 ? "+" : ""}
                {formatPrice(priceChange)} ({priceChangePct.toFixed(2)}%)
              </span>
            </>
          )}
        </div>
        {latestKline && !compact && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>O: {formatPrice(parseFloat(latestKline.Open))}</span>
            <span>H: {formatPrice(parseFloat(latestKline.High))}</span>
            <span>L: {formatPrice(parseFloat(latestKline.Low))}</span>
            <span>V: {formatVolume(parseFloat(latestKline.Volume))}</span>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative overflow-x-auto overflow-y-hidden">
        <div className="flex h-full">
          {/* Price Scale */}
          <div className="w-16 flex-shrink-0 flex flex-col justify-between py-2 px-1 text-xs text-muted-foreground font-mono border-r border-border">
            <span>{formatPrice(maxPrice)}</span>
            <span>{formatPrice((maxPrice + minPrice) / 2)}</span>
            <span>{formatPrice(minPrice)}</span>
          </div>

          {/* Candlesticks */}
          <div
            className="flex-1 relative"
            style={{ minWidth: chartWidth, height: chartHeight }}
          >
            <svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="absolute inset-0"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1={chartHeight / 4}
                x2={chartWidth}
                y2={chartHeight / 4}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={chartHeight / 2}
                x2={chartWidth}
                y2={chartHeight / 2}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={(chartHeight * 3) / 4}
                x2={chartWidth}
                y2={(chartHeight * 3) / 4}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />

              {/* Candles */}
              {displayKlines.map((kline, idx) => {
                const open = parseFloat(kline.Open);
                const close = parseFloat(kline.Close);
                const high = parseFloat(kline.High);
                const low = parseFloat(kline.Low);
                const isGreen = close >= open;

                const x = idx * (candleWidth + 2) + 1;
                const yHigh =
                  ((maxPrice - high) / priceRange) * chartHeight;
                const yLow = ((maxPrice - low) / priceRange) * chartHeight;
                const yOpen =
                  ((maxPrice - open) / priceRange) * chartHeight;
                const yClose =
                  ((maxPrice - close) / priceRange) * chartHeight;

                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);

                const color = isGreen
                  ? "hsl(var(--status-ready))"
                  : "hsl(var(--destructive))";

                const isCurrent = !kline.IsClosed;

                return (
                  <g key={`candle-${kline.OpenTime}`}>
                    {/* Wick */}
                    <line
                      x1={x + candleWidth / 2}
                      y1={yHigh}
                      x2={x + candleWidth / 2}
                      y2={yLow}
                      stroke={color}
                      strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={x}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={isGreen ? color : color}
                      stroke={color}
                      strokeWidth={isCurrent ? 2 : 0}
                      opacity={isCurrent ? 0.8 : 1}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Time Scale */}
        {!compact && (
          <div className="flex border-t border-border">
            <div className="w-16 flex-shrink-0" />
            <div className="flex-1 flex justify-between px-2 py-1 text-xs text-muted-foreground font-mono overflow-hidden">
              {displayKlines.length > 0 && (
                <>
                  <span>{formatTime(displayKlines[0].OpenTime)}</span>
                  <span>
                    {formatTime(
                      displayKlines[Math.floor(displayKlines.length / 2)]
                        ?.OpenTime || 0
                    )}
                  </span>
                  <span>
                    {formatTime(
                      displayKlines[displayKlines.length - 1]?.OpenTime || 0
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
