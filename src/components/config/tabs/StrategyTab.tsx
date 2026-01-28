import { StrategyConfig } from "@/types/config";
import { FormField, TagInput } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StrategyTabProps {
  config: StrategyConfig;
  onChange: (config: StrategyConfig) => void;
}

export function StrategyTab({ config, onChange }: StrategyTabProps) {
  const updateField = <K extends keyof StrategyConfig>(
    key: K,
    value: StrategyConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const updateCapital = <K extends keyof StrategyConfig["capital"]>(
    key: K,
    value: StrategyConfig["capital"][K]
  ) => {
    onChange({
      ...config,
      capital: { ...config.capital, [key]: value },
    });
  };

  const updatePositionSizing = <K extends keyof StrategyConfig["positionSizing"]>(
    key: K,
    value: StrategyConfig["positionSizing"][K]
  ) => {
    onChange({
      ...config,
      positionSizing: { ...config.positionSizing, [key]: value },
    });
  };

  const updateRules = <K extends keyof StrategyConfig["rules"]>(
    key: K,
    value: StrategyConfig["rules"][K]
  ) => {
    onChange({
      ...config,
      rules: { ...config.rules, [key]: value },
    });
  };

  const updateLogging = <K extends keyof StrategyConfig["logging"]>(
    key: K,
    value: StrategyConfig["logging"][K]
  ) => {
    onChange({
      ...config,
      logging: { ...config.logging, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Strategy Enabled" description="Enable strategy execution">
          <Switch
            checked={config.enabled}
            onCheckedChange={(v) => updateField("enabled", v)}
          />
        </FormField>

        <FormField label="Strategy Mode" description="Paper trading or live">
          <Select
            value={config.mode}
            onValueChange={(v) =>
              updateField("mode", v as StrategyConfig["mode"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paper">Paper</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Strategy ID"
          description="Unique identifier for this strategy"
          className="md:col-span-2"
        >
          <Input
            value={config.strategyId}
            onChange={(e) => updateField("strategyId", e.target.value)}
            placeholder="my-strategy-v1"
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Capital Settings</h4>
        <div className="grid gap-6 md:grid-cols-3">
          <FormField label="Initial USD" description="Starting capital">
            <Input
              type="number"
              min={0}
              value={config.capital.initialUSD}
              onChange={(e) =>
                updateCapital("initialUSD", parseFloat(e.target.value) || 0)
              }
            />
          </FormField>

          <FormField label="Risk Per Trade (%)" description="Max risk percentage">
            <Input
              type="number"
              min={0.1}
              max={100}
              step={0.1}
              value={config.capital.riskPerTradePercent}
              onChange={(e) =>
                updateCapital(
                  "riskPerTradePercent",
                  parseFloat(e.target.value) || 1
                )
              }
            />
          </FormField>

          <FormField
            label="Max Concurrent Positions"
            description="Maximum open positions"
          >
            <Input
              type="number"
              min={1}
              max={100}
              value={config.capital.maxConcurrentPositions}
              onChange={(e) =>
                updateCapital(
                  "maxConcurrentPositions",
                  parseInt(e.target.value) || 1
                )
              }
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Position Sizing
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Sizing Method" description="Position size calculation">
            <Select
              value={config.positionSizing.method}
              onValueChange={(v) =>
                updatePositionSizing(
                  "method",
                  v as StrategyConfig["positionSizing"]["method"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="atr">ATR-Based</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Stop Loss ATR Multiplier"
            description="ATR multiplier for stop loss"
          >
            <Input
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={config.positionSizing.stopLossATRMultiplier}
              onChange={(e) =>
                updatePositionSizing(
                  "stopLossATRMultiplier",
                  parseFloat(e.target.value) || 2
                )
              }
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Trading Rules</h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Entry Rules" description="Conditions for entry signals">
            <TagInput
              value={config.rules.entry}
              onChange={(v) => updateRules("entry", v)}
              placeholder="Add entry rule"
            />
          </FormField>

          <FormField label="Exit Rules" description="Conditions for exit signals">
            <TagInput
              value={config.rules.exit}
              onChange={(v) => updateRules("exit", v)}
              placeholder="Add exit rule"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Logging</h4>
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            label="Log Indicator Snapshots"
            description="Capture indicator state"
          >
            <Switch
              checked={config.logging.logIndicatorSnapshots}
              onCheckedChange={(v) => updateLogging("logIndicatorSnapshots", v)}
            />
          </FormField>

          <FormField
            label="Snapshot Before"
            description="Candles before signal"
          >
            <Input
              type="number"
              min={0}
              max={100}
              value={config.logging.snapshotWindow.before}
              onChange={(e) =>
                updateLogging("snapshotWindow", {
                  ...config.logging.snapshotWindow,
                  before: parseInt(e.target.value) || 5,
                })
              }
            />
          </FormField>

          <FormField
            label="Snapshot After"
            description="Candles after signal"
          >
            <Input
              type="number"
              min={0}
              max={100}
              value={config.logging.snapshotWindow.after}
              onChange={(e) =>
                updateLogging("snapshotWindow", {
                  ...config.logging.snapshotWindow,
                  after: parseInt(e.target.value) || 5,
                })
              }
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
