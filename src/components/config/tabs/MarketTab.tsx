import { MarketConfig, KlineInterval } from "@/types/config";
import { FormField, TagInput, MultiSelect } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketTabProps {
  config: MarketConfig;
  onChange: (config: MarketConfig) => void;
}

const INTERVALS: KlineInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
const EXCHANGES = ["binance", "bybit", "okx", "coinbase"];

export function MarketTab({ config, onChange }: MarketTabProps) {
  const updateSymbols = (symbols: string[]) => {
    onChange({ ...config, symbols });
  };

  const updatePrimaryInterval = (interval: KlineInterval) => {
    onChange({
      ...config,
      intervals: { ...config.intervals, primary: interval },
    });
  };

  const updateAdditionalIntervals = (intervals: KlineInterval[]) => {
    onChange({
      ...config,
      intervals: { ...config.intervals, additional: intervals },
    });
  };

  const updateLiveDataSource = (
    updates: Partial<MarketConfig["dataSource"]["live"]>
  ) => {
    onChange({
      ...config,
      dataSource: {
        ...config.dataSource,
        live: { ...config.dataSource.live, ...updates },
      },
    });
  };

  const updateHistoricDataSource = (
    updates: Partial<MarketConfig["dataSource"]["historic"]>
  ) => {
    onChange({
      ...config,
      dataSource: {
        ...config.dataSource,
        historic: { ...config.dataSource.historic, ...updates },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Symbols and Intervals */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label="Symbols"
          description="Trading pairs (uppercase, e.g., BTCUSDT)"
          className="md:col-span-2"
        >
          <TagInput
            value={config.symbols}
            onChange={updateSymbols}
            placeholder="Add symbol and press Enter"
            uppercase
          />
        </FormField>

        <FormField label="Primary Interval" description="Main candle interval">
          <Select
            value={config.intervals.primary}
            onValueChange={(v) => updatePrimaryInterval(v as KlineInterval)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Additional Intervals" description="Secondary intervals">
          <MultiSelect
            options={INTERVALS.filter((i) => i !== config.intervals.primary)}
            value={config.intervals.additional}
            onChange={updateAdditionalIntervals}
            placeholder="Select intervals..."
          />
        </FormField>
      </div>

      {/* Live Data Source */}
      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Live Data Source
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Exchange" description="Live data provider">
            <Select
              value={config.dataSource.live.exchange}
              onValueChange={(v) => updateLiveDataSource({ exchange: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="WebSocket" description="Use WebSocket connection">
            <Switch
              checked={config.dataSource.live.connection.websocket}
              onCheckedChange={(v) =>
                updateLiveDataSource({
                  connection: { ...config.dataSource.live.connection, websocket: v },
                })
              }
            />
          </FormField>

          <FormField label="REST Fallback" description="Fallback to REST API">
            <Switch
              checked={config.dataSource.live.connection.restFallback}
              onCheckedChange={(v) =>
                updateLiveDataSource({
                  connection: {
                    ...config.dataSource.live.connection,
                    restFallback: v,
                  },
                })
              }
            />
          </FormField>

          <FormField label="Klines Stream" description="Subscribe to klines">
            <Switch
              checked={config.dataSource.live.streams.klines}
              onCheckedChange={(v) =>
                updateLiveDataSource({
                  streams: { ...config.dataSource.live.streams, klines: v },
                })
              }
            />
          </FormField>

          <FormField label="Trades Stream" description="Subscribe to trades">
            <Switch
              checked={config.dataSource.live.streams.trades}
              onCheckedChange={(v) =>
                updateLiveDataSource({
                  streams: { ...config.dataSource.live.streams, trades: v },
                })
              }
            />
          </FormField>

          <FormField
            label="Orderbook Stream"
            description="Subscribe to orderbook updates"
          >
            <Switch
              checked={config.dataSource.live.streams.orderbook.enabled}
              onCheckedChange={(v) =>
                updateLiveDataSource({
                  streams: {
                    ...config.dataSource.live.streams,
                    orderbook: {
                      ...config.dataSource.live.streams.orderbook,
                      enabled: v,
                    },
                  },
                })
              }
            />
          </FormField>

          {config.dataSource.live.streams.orderbook.enabled && (
            <FormField label="Orderbook Depth" description="Number of levels">
              <Input
                type="number"
                min={1}
                max={100}
                value={config.dataSource.live.streams.orderbook.depth}
                onChange={(e) =>
                  updateLiveDataSource({
                    streams: {
                      ...config.dataSource.live.streams,
                      orderbook: {
                        ...config.dataSource.live.streams.orderbook,
                        depth: parseInt(e.target.value) || 10,
                      },
                    },
                  })
                }
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Historic Data Source */}
      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Historic Data Source
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Exchange" description="Historic data provider">
            <Select
              value={config.dataSource.historic.exchange}
              onValueChange={(v) => updateHistoricDataSource({ exchange: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Start Time" description="Historic data start (ISO 8601)">
            <Input
              type="datetime-local"
              value={
                config.dataSource.historic.klines.startTime
                  ? config.dataSource.historic.klines.startTime.slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                updateHistoricDataSource({
                  klines: {
                    ...config.dataSource.historic.klines,
                    startTime: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  },
                })
              }
            />
          </FormField>

          <FormField label="End Time" description="Historic data end (ISO 8601)">
            <Input
              type="datetime-local"
              value={
                config.dataSource.historic.klines.endTime
                  ? config.dataSource.historic.klines.endTime.slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                updateHistoricDataSource({
                  klines: {
                    ...config.dataSource.historic.klines,
                    endTime: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  },
                })
              }
            />
          </FormField>

          <FormField label="Pagination Limit" description="Klines per request">
            <Input
              type="number"
              min={100}
              max={5000}
              value={config.dataSource.historic.klines.paginationLimit}
              onChange={(e) =>
                updateHistoricDataSource({
                  klines: {
                    ...config.dataSource.historic.klines,
                    paginationLimit: parseInt(e.target.value) || 1000,
                  },
                })
              }
            />
          </FormField>

          <FormField
            label="Respect Rate Limits"
            description="Honor exchange rate limits"
          >
            <Switch
              checked={config.dataSource.historic.klines.respectRateLimits}
              onCheckedChange={(v) =>
                updateHistoricDataSource({
                  klines: {
                    ...config.dataSource.historic.klines,
                    respectRateLimits: v,
                  },
                })
              }
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
