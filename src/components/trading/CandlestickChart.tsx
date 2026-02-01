import { useMemo, useRef, useEffect, useState } from "react";
import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  BarSeries,
  XAxis,
  YAxis,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  OHLCTooltip,
  discontinuousTimeScaleProvider,
  EdgeIndicator,
  lastVisibleItemBasedZoomAnchor,
} from "react-financial-charts";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
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

interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Colors for the chart (using hex/rgb since canvas doesn't support CSS vars well)
const COLORS = {
  green: "#22c55e",
  red: "#ef4444",
  greenTransparent: "rgba(34, 197, 94, 0.4)",
  redTransparent: "rgba(239, 68, 68, 0.4)",
  gridLine: "rgba(255, 255, 255, 0.06)",
  axis: "#374151",
  axisText: "#9ca3af",
  crosshair: "#6b7280",
};

function transformKlines(klines: Kline[], currentKline: Kline | null): ChartData[] {
  const all = [...klines];
  
  // Add or update current kline
  if (currentKline) {
    const existingIdx = all.findIndex(k => k.OpenTime === currentKline.OpenTime);
    if (existingIdx >= 0) {
      all[existingIdx] = currentKline;
    } else {
      all.push(currentKline);
    }
  }
  
  // If we have no data at all, return empty
  if (all.length === 0) {
    return [];
  }
  
  // Transform to chart format
  const transformed = all
    .map(k => ({
      date: new Date(k.OpenTime),
      open: parseFloat(k.Open),
      high: parseFloat(k.High),
      low: parseFloat(k.Low),
      close: parseFloat(k.Close),
      volume: parseFloat(k.Volume),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // If we only have one candle, backfill with a synthetic previous candle
  // so the chart library has enough data to render properly
  if (transformed.length === 1) {
    const single = transformed[0];
    const intervalMs = getIntervalMs(currentKline?.Interval || "1m");
    const syntheticPrev: ChartData = {
      date: new Date(single.date.getTime() - intervalMs),
      open: single.open,
      high: single.open,
      low: single.open,
      close: single.open,
      volume: 0,
    };
    return [syntheticPrev, single];
  }
  
  return transformed;
}

// Get interval duration in milliseconds
function getIntervalMs(interval: string): number {
  const unit = interval.slice(-1);
  const value = parseInt(interval.slice(0, -1)) || 1;
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return 60 * 1000; // default 1m
  }
}

export function CandlestickChart({
  klines,
  currentKline,
  interval,
  title,
  compact = false,
  className,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions({ width, height: height - (compact ? 40 : 56) }); // Account for header
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [compact]);

  // Transform and prepare data
  const chartData = useMemo(() => 
    transformKlines(klines, currentKline), 
    [klines, currentKline]
  );

  // Latest price info for header
  const latestData = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const priceChange = latestData 
    ? latestData.close - latestData.open 
    : 0;
  const priceChangePct = latestData && latestData.open !== 0
    ? (priceChange / latestData.open) * 100 
    : 0;

  const priceFormat = format(".2f");
  const volumeFormat = format(".2s");
  const dateFormat = timeFormat("%H:%M");

  // Show waiting message only if we have no data at all
  if (chartData.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={cn("flex flex-col h-full bg-card", className)}
      >
        <div className="flex items-center px-4 py-2 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {title || `Chart ${interval}`}
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Waiting for kline data...
        </div>
      </div>
    );
  }

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    (d: ChartData) => d.date
  );
  
  const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(chartData);
  const max = xAccessor(data[data.length - 1]);
  const min = xAccessor(data[Math.max(0, data.length - 50)]);
  const xExtents = [min, max + 1]; // Add padding on right for current candle

  const margin = compact 
    ? { left: 0, right: 60, top: 10, bottom: 30 }
    : { left: 0, right: 65, top: 15, bottom: 35 };
  
  const chartHeight = dimensions.height;
  const volumeHeight = compact ? 0 : Math.max(chartHeight * 0.18, 40);
  const candleHeight = chartHeight - volumeHeight;

  return (
    <div 
      ref={containerRef}
      className={cn("flex flex-col h-full bg-card overflow-hidden", className)}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 border-b border-border",
        compact ? "py-1.5" : "py-2"
      )}>
        <div className="flex items-center gap-3">
          <h3 className={cn(
            "font-semibold text-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {title || `${interval}`}
          </h3>
          {latestData && (
            <>
              <span className={cn(
                "font-bold font-mono text-foreground",
                compact ? "text-sm" : "text-lg"
              )}>
                {priceFormat(latestData.close)}
              </span>
              <span
                className={cn(
                  "font-mono",
                  compact ? "text-xs" : "text-sm",
                  priceChange >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceFormat(priceChange)} ({priceChangePct.toFixed(2)}%)
              </span>
            </>
          )}
        </div>
        {latestData && !compact && (
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span>O: {priceFormat(latestData.open)}</span>
            <span>H: {priceFormat(latestData.high)}</span>
            <span>L: {priceFormat(latestData.low)}</span>
            <span>V: {volumeFormat(latestData.volume)}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <div className="flex-1">
          <ChartCanvas
            height={chartHeight}
            width={dimensions.width}
            ratio={window.devicePixelRatio || 1}
            margin={margin}
            data={data}
            seriesName="OHLC"
            xScale={xScale}
            xAccessor={xAccessor}
            displayXAccessor={displayXAccessor}
            xExtents={xExtents}
            zoomAnchor={lastVisibleItemBasedZoomAnchor}
          >
            {/* Candlestick Chart */}
            <Chart
              id={1}
              yExtents={(d: ChartData) => [d.high, d.low]}
              height={candleHeight}
              origin={[0, 0]}
              padding={{ top: 10, bottom: 10 }}
            >
              <XAxis
                showGridLines
                gridLinesStrokeStyle={COLORS.gridLine}
                strokeStyle={COLORS.axis}
                tickLabelFill={COLORS.axisText}
                tickStrokeStyle={COLORS.axis}
                fontSize={11}
              />
              <YAxis
                showGridLines
                gridLinesStrokeStyle={COLORS.gridLine}
                strokeStyle={COLORS.axis}
                tickLabelFill={COLORS.axisText}
                tickStrokeStyle={COLORS.axis}
                tickFormat={priceFormat}
                fontSize={11}
              />
              <CandlestickSeries
                fill={(d: ChartData) => d.close > d.open ? COLORS.green : COLORS.red}
                wickStroke={(d: ChartData) => d.close > d.open ? COLORS.green : COLORS.red}
                stroke={(d: ChartData) => d.close > d.open ? COLORS.green : COLORS.red}
                candleStrokeWidth={1}
                widthRatio={0.8}
              />
              <MouseCoordinateX
                displayFormat={dateFormat}
                rectWidth={65}
                fill="#374151"
                textFill="#e5e7eb"
              />
              <MouseCoordinateY
                displayFormat={priceFormat}
                rectWidth={60}
                fill="#374151"
                textFill="#e5e7eb"
              />
              <EdgeIndicator
                itemType="last"
                orient="right"
                edgeAt="right"
                yAccessor={(d: ChartData) => d.close}
                displayFormat={priceFormat}
                fill={(d: ChartData) => d?.close > d?.open ? COLORS.green : COLORS.red}
                textFill="#ffffff"
                fontSize={11}
              />
              {!compact && (
                <OHLCTooltip 
                  origin={[8, 16]} 
                  textFill="#e5e7eb"
                  labelFill="#9ca3af"
                />
              )}
            </Chart>

            {/* Volume Chart - only for non-compact */}
            {!compact && volumeHeight > 0 && (
              <Chart
                id={2}
                yExtents={(d: ChartData) => d.volume}
                height={volumeHeight}
                origin={[0, candleHeight]}
                padding={{ top: 5, bottom: 0 }}
              >
                <YAxis
                  tickFormat={volumeFormat}
                  strokeStyle={COLORS.axis}
                  tickLabelFill={COLORS.axisText}
                  tickStrokeStyle={COLORS.axis}
                  ticks={3}
                  fontSize={10}
                />
                <BarSeries
                  fillStyle={(d: ChartData) => 
                    d.close > d.open ? COLORS.greenTransparent : COLORS.redTransparent
                  }
                  yAccessor={(d: ChartData) => d.volume}
                />
              </Chart>
            )}

            <CrossHairCursor strokeStyle={COLORS.crosshair} />
          </ChartCanvas>
        </div>
      )}
    </div>
  );
}