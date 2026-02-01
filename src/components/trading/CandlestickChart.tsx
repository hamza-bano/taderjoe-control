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

function transformKlines(klines: Kline[], currentKline: Kline | null): ChartData[] {
  const all = [...klines];
  if (currentKline) {
    const existingIdx = all.findIndex(k => k.OpenTime === currentKline.OpenTime);
    if (existingIdx >= 0) {
      all[existingIdx] = currentKline;
    } else {
      all.push(currentKline);
    }
  }
  
  return all
    .map(k => ({
      date: new Date(k.OpenTime),
      open: parseFloat(k.Open),
      high: parseFloat(k.High),
      low: parseFloat(k.Low),
      close: parseFloat(k.Close),
      volume: parseFloat(k.Volume),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
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
  const latestData = chartData[chartData.length - 1];
  const priceChange = latestData 
    ? latestData.close - latestData.open 
    : 0;
  const priceChangePct = latestData 
    ? (priceChange / latestData.open) * 100 
    : 0;

  if (chartData.length < 2) {
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
  const xExtents = [min, max];

  const margin = compact 
    ? { left: 0, right: 55, top: 10, bottom: 25 }
    : { left: 0, right: 55, top: 15, bottom: 30 };
  
  const chartHeight = dimensions.height;
  const volumeHeight = compact ? 0 : chartHeight * 0.2;
  const candleHeight = chartHeight - volumeHeight;

  const priceFormat = format(".2f");
  const volumeFormat = format(".2s");
  const dateFormat = timeFormat("%H:%M");

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
                  priceChange >= 0 ? "text-status-ready" : "text-destructive"
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
            >
              <XAxis
                showGridLines
                gridLinesStrokeStyle="rgba(255,255,255,0.05)"
                strokeStyle="hsl(var(--border))"
                tickLabelFill="hsl(var(--muted-foreground))"
              />
              <YAxis
                showGridLines
                gridLinesStrokeStyle="rgba(255,255,255,0.05)"
                strokeStyle="hsl(var(--border))"
                tickLabelFill="hsl(var(--muted-foreground))"
                tickFormat={priceFormat}
              />
              <CandlestickSeries
                fill={(d: ChartData) => d.close > d.open ? "hsl(var(--status-ready))" : "hsl(var(--destructive))"}
                wickStroke={(d: ChartData) => d.close > d.open ? "hsl(var(--status-ready))" : "hsl(var(--destructive))"}
                stroke={(d: ChartData) => d.close > d.open ? "hsl(var(--status-ready))" : "hsl(var(--destructive))"}
              />
              <MouseCoordinateX
                displayFormat={dateFormat}
                rectWidth={60}
              />
              <MouseCoordinateY
                displayFormat={priceFormat}
                rectWidth={55}
              />
              <EdgeIndicator
                itemType="last"
                orient="right"
                edgeAt="right"
                yAccessor={(d: ChartData) => d.close}
                displayFormat={priceFormat}
                fill={(d: ChartData) => d?.close > d?.open ? "hsl(var(--status-ready))" : "hsl(var(--destructive))"}
              />
              {!compact && <OHLCTooltip origin={[8, 16]} />}
            </Chart>

            {/* Volume Chart - only for non-compact */}
            {!compact && volumeHeight > 0 && (
              <Chart
                id={2}
                yExtents={(d: ChartData) => d.volume}
                height={volumeHeight}
                origin={[0, candleHeight]}
              >
                <YAxis
                  tickFormat={volumeFormat}
                  strokeStyle="hsl(var(--border))"
                  tickLabelFill="hsl(var(--muted-foreground))"
                  ticks={3}
                />
                <BarSeries
                  fillStyle={(d: ChartData) => 
                    d.close > d.open 
                      ? "hsla(var(--status-ready), 0.5)" 
                      : "hsla(var(--destructive), 0.5)"
                  }
                  yAccessor={(d: ChartData) => d.volume}
                />
              </Chart>
            )}

            <CrossHairCursor strokeStyle="hsl(var(--muted-foreground))" />
          </ChartCanvas>
        </div>
      )}
    </div>
  );
}
