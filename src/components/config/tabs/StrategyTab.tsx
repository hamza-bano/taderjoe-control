import {
  StrategyConfig,
  StrategyMode,
  PositionSizingMethod,
  RiskMethod,
  ConditionLogic,
} from "@/types/config";
import { FormField, NumberInput, ConditionEditor } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface StrategyTabProps {
  config: StrategyConfig;
  onChange: (config: StrategyConfig) => void;
}

const STRATEGY_MODES: { value: StrategyMode; label: string }[] = [
  { value: "paper", label: "Paper Trading" },
  { value: "live", label: "Live Trading" },
];

const POSITION_SIZING_METHODS: { value: PositionSizingMethod; label: string; description: string }[] = [
  { value: "risk_based", label: "Risk Based", description: "Size based on risk percentage" },
  { value: "absolute", label: "Absolute Value", description: "Fixed position size" },
];

const RISK_METHODS: { value: RiskMethod; label: string }[] = [
  { value: "pct_based", label: "Percentage Based" },
  { value: "atr_based", label: "ATR Based" },
];

const LOGIC_OPTIONS: { value: ConditionLogic; label: string }[] = [
  { value: "AND", label: "AND (all conditions)" },
  { value: "OR", label: "OR (any condition)" },
];

export function StrategyTab({ config, onChange }: StrategyTabProps) {
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

  const updateRisk = <K extends keyof StrategyConfig["risk"]>(
    key: K,
    value: StrategyConfig["risk"][K]
  ) => {
    onChange({
      ...config,
      risk: { ...config.risk, [key]: value },
    });
  };

  const updateEntry = <K extends keyof StrategyConfig["entry"]>(
    key: K,
    value: StrategyConfig["entry"][K]
  ) => {
    onChange({
      ...config,
      entry: { ...config.entry, [key]: value },
    });
  };

  const updateExit = <K extends keyof StrategyConfig["exit"]>(
    key: K,
    value: StrategyConfig["exit"][K]
  ) => {
    onChange({
      ...config,
      exit: { ...config.exit, [key]: value },
    });
  };

  const isAbsolutePositionSizing = config.positionSizing.method === "absolute";

  return (
    <div className="space-y-8">
      {/* Strategy Toggle & Mode */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Strategy Settings
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Strategy Enabled" description="Enable strategy execution">
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => onChange({ ...config, enabled: v })}
            />
          </FormField>

          <FormField label="Mode" description="Paper or live trading">
            <Select
              value={config.mode}
              onValueChange={(v) =>
                onChange({ ...config, mode: v as StrategyMode })
              }
              disabled={!config.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STRATEGY_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Capital */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Capital Management
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Initial Capital (USD)" description="Starting capital">
            <NumberInput
              value={config.capital.initialUSD}
              onChange={(v) => updateCapital("initialUSD", v)}
              min={0}
              disabled={!config.enabled}
            />
          </FormField>

          <FormField label="Risk Per Trade (%)" description="Max risk per position">
            <NumberInput
              value={config.capital.riskPerTradePct}
              onChange={(v) => updateCapital("riskPerTradePct", v)}
              min={0}
              max={100}
              step={0.1}
              disabled={!config.enabled}
            />
          </FormField>

          <FormField
            label="Max Open Positions"
            description="Concurrent position limit"
          >
            <NumberInput
              value={config.capital.maxOpenPositions}
              onChange={(v) => updateCapital("maxOpenPositions", v)}
              min={0}
              disabled={!config.enabled}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Position Sizing & Risk */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Position Sizing & Risk
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            label="Sizing Method"
            description="How to calculate position size"
          >
            <Select
              value={config.positionSizing.method}
              onValueChange={(v) =>
                updatePositionSizing("method", v as PositionSizingMethod)
              }
              disabled={!config.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_SIZING_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex flex-col">
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {isAbsolutePositionSizing && (
            <FormField
              label="Absolute Value (USD)"
              description="Fixed position size"
            >
              <Input
                value={config.positionSizing.absoluteValue}
                onChange={(e) =>
                  updatePositionSizing("absoluteValue", e.target.value)
                }
                placeholder="200"
                className="font-mono"
                disabled={!config.enabled}
              />
            </FormField>
          )}

          <FormField label="Risk Method" description="Stop loss calculation">
            <Select
              value={config.risk.method}
              onValueChange={(v) => updateRisk("method", v as RiskMethod)}
              disabled={!config.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RISK_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Stop Loss (%)" description="Stop loss threshold">
            <Input
              value={config.risk.stopLoss}
              onChange={(e) => updateRisk("stopLoss", e.target.value)}
              placeholder="1.0"
              className="font-mono"
              disabled={!config.enabled}
            />
          </FormField>

          <FormField label="Take Profit (%)" description="Take profit threshold">
            <Input
              value={config.risk.takeProfit}
              onChange={(e) => updateRisk("takeProfit", e.target.value)}
              placeholder="2.0"
              className="font-mono"
              disabled={!config.enabled}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Entry Conditions */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Entry Conditions
          <Badge variant="secondary" className="text-xs">
            {config.entry.conditions.length} rules
          </Badge>
        </h3>
        <div className="space-y-4">
          <FormField label="Logic" description="How to combine conditions">
            <Select
              value={config.entry.logic}
              onValueChange={(v) => updateEntry("logic", v as ConditionLogic)}
              disabled={!config.enabled}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGIC_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <ConditionEditor
            conditions={config.entry.conditions}
            onChange={(conditions) => updateEntry("conditions", conditions)}
          />
        </div>
      </section>

      <Separator />

      {/* Exit Conditions */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Exit Conditions
          <Badge variant="secondary" className="text-xs">
            {config.exit.conditions.length} rules
          </Badge>
        </h3>
        <div className="space-y-4">
          <FormField label="Logic" description="How to combine conditions">
            <Select
              value={config.exit.logic}
              onValueChange={(v) => updateExit("logic", v as ConditionLogic)}
              disabled={!config.enabled}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGIC_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <ConditionEditor
            conditions={config.exit.conditions}
            onChange={(conditions) => updateExit("conditions", conditions)}
          />
        </div>
      </section>
    </div>
  );
}
