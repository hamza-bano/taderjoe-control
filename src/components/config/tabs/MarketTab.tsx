import {
  MarketConfig,
  MarketMode,
  KlineInterval,
  Exchange,
} from "@/types/config";
import { FormField, TagInput, NumberInput } from "../shared";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketTabProps {
  config: MarketConfig;
  onChange: (config: MarketConfig) => void;
}

const EXCHANGES: { value: Exchange; label: string }[] = [
  { value: "binance", label: "Binance" },
  { value: "bybit", label: "Bybit" },
  { value: "okx", label: "OKX" },
  { value: "coinbase", label: "Coinbase" },
];

const INTERVALS: { value: KlineInterval; label: string }[] = [
  { value: "1m", label: "1 minute" },
  { value: "3m", label: "3 minutes" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "4h", label: "4 hours" },
  { value: "6h", label: "6 hours" },
  { value: "8h", label: "8 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
  { value: "1M", label: "1 month" },
];

export function MarketTab({ config, onChange }: MarketTabProps) {
  const isLive = config.mode === "live";
  const isHistoric = config.mode === "historic";

  const updateLiveStreams = (
    key: keyof MarketConfig["live"]["streams"],
    value: boolean | { enabled: boolean; depth: number }
  ) => {
    onChange({
      ...config,
      live: {
        ...config.live,
        streams: { ...config.live.streams, [key]: value },
      },
    });
  };

  const updateHistoric = <K extends keyof MarketConfig["historic"]>(
    key: K,
    value: MarketConfig["historic"][K]
  ) => {
    onChange({
      ...config,
      historic: { ...config.historic, [key]: value },
    });
  };

  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  };

  return (
    <div className="space-y-8">
      {/* Core Market Settings */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Market Configuration
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Mode" description="Live streaming or historical data">
            <Select
              value={config.mode}
              onValueChange={(v) =>
                onChange({ ...config, mode: v as MarketMode })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="historic">Historic</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Exchange" description="Data source exchange">
            <Select
              value={config.exchange}
              onValueChange={(v) =>
                onChange({ ...config, exchange: v as Exchange })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((ex) => (
                  <SelectItem key={ex.value} value={ex.value}>
                    {ex.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Primary Interval"
            description="Main candle timeframe"
          >
            <Select
              value={config.interval}
              onValueChange={(v) =>
                onChange({ ...config, interval: v as KlineInterval })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((int) => (
                  <SelectItem key={int.value} value={int.value}>
                    {int.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Secondary Interval"
            description="Additional timeframe for analysis"
          >
            <Select
              value={config.secondaryInterval}
              onValueChange={(v) =>
                onChange({ ...config, secondaryInterval: v as KlineInterval })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((int) => (
                  <SelectItem key={int.value} value={int.value}>
                    {int.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Symbols"
            description="Trading pairs (uppercase)"
            className="sm:col-span-2"
          >
            <TagInput
              value={config.symbols}
              onChange={(symbols) => onChange({ ...config, symbols })}
              placeholder="Add symbol (e.g., BTCUSDT)"
              uppercase
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Live-specific settings */}
      {isLive && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Live Streams
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Klines" description="Subscribe to candlestick data">
              <Switch
                checked={config.live.streams.klines}
                onCheckedChange={(v) => updateLiveStreams("klines", v)}
              />
            </FormField>

            <FormField label="Trades" description="Subscribe to trade stream">
              <Switch
                checked={config.live.streams.trades}
                onCheckedChange={(v) => updateLiveStreams("trades", v)}
              />
            </FormField>

            <FormField
              label="Orderbook"
              description="Subscribe to orderbook updates"
            >
              <Switch
                checked={config.live.streams.orderbook.enabled}
                onCheckedChange={(v) =>
                  updateLiveStreams("orderbook", {
                    ...config.live.streams.orderbook,
                    enabled: v,
                  })
                }
              />
            </FormField>

            <FormField
              label="Orderbook Depth"
              description="Number of price levels"
            >
              <NumberInput
                value={config.live.streams.orderbook.depth}
                onChange={(v) =>
                  updateLiveStreams("orderbook", {
                    ...config.live.streams.orderbook,
                    depth: v,
                  })
                }
                min={0}
                max={5000}
                disabled={!config.live.streams.orderbook.enabled}
              />
            </FormField>
          </div>
        </section>
      )}

      {/* Historic-specific settings */}
      {isHistoric && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Historical Data Range
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Start Time" description="Begin date for backtest">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !config.historic.startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.historic.startTime
                      ? format(new Date(config.historic.startTime), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(config.historic.startTime)}
                    onSelect={(date) =>
                      updateHistoric(
                        "startTime",
                        date ? date.toISOString() : ""
                      )
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </FormField>

            <FormField label="End Time" description="End date for backtest">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !config.historic.endTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.historic.endTime
                      ? format(new Date(config.historic.endTime), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(config.historic.endTime)}
                    onSelect={(date) =>
                      updateHistoric("endTime", date ? date.toISOString() : "")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </FormField>

            <FormField
              label="Pagination Limit"
              description="API results per request"
            >
              <NumberInput
                value={config.historic.paginationLimit}
                onChange={(v) => updateHistoric("paginationLimit", v)}
                min={0}
                max={5000}
              />
            </FormField>

            <FormField
              label="Respect Rate Limits"
              description="Throttle API requests"
            >
              <Switch
                checked={config.historic.respectRateLimits}
                onCheckedChange={(v) => updateHistoric("respectRateLimits", v)}
              />
            </FormField>
          </div>
        </section>
      )}
    </div>
  );
}
