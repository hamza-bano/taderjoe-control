import { IndicatorsConfig, IndicatorsEnabled, INDICATOR_CATEGORIES, INDICATOR_LABELS } from "@/types/config";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface IndicatorsTabProps {
  config: IndicatorsConfig;
  onChange: (config: IndicatorsConfig) => void;
}

export function IndicatorsTab({ config, onChange }: IndicatorsTabProps) {
  const toggleIndicator = (key: keyof IndicatorsEnabled, value: boolean) => {
    onChange({
      ...config,
      enabled: { ...config.enabled, [key]: value },
    });
  };

  const enableAll = () => {
    const allEnabled = Object.keys(config.enabled).reduce((acc, key) => {
      acc[key as keyof IndicatorsEnabled] = true;
      return acc;
    }, {} as IndicatorsEnabled);
    onChange({ ...config, enabled: allEnabled });
  };

  const disableAll = () => {
    const allDisabled = Object.keys(config.enabled).reduce((acc, key) => {
      acc[key as keyof IndicatorsEnabled] = false;
      return acc;
    }, {} as IndicatorsEnabled);
    onChange({ ...config, enabled: allDisabled });
  };

  const enabledCount = Object.values(config.enabled).filter(Boolean).length;
  const totalCount = Object.keys(config.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Technical Indicators
          </h3>
          <Badge variant="secondary" className="font-mono">
            {enabledCount}/{totalCount} enabled
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enableAll}
            className="gap-1"
          >
            <Check className="h-3 w-3" />
            Enable All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={disableAll}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Disable All
          </Button>
        </div>
      </div>

      {/* Indicator Categories */}
      <div className="space-y-6">
        {Object.entries(INDICATOR_CATEGORIES).map(([category, indicators]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {indicators.map((indicator) => {
                const key = indicator as keyof IndicatorsEnabled;
                const isEnabled = config.enabled[key];
                const label = INDICATOR_LABELS[indicator] || indicator;

                return (
                  <button
                    key={indicator}
                    type="button"
                    onClick={() => toggleIndicator(key, !isEnabled)}
                    className={`
                      flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-left text-sm
                      transition-all duration-150
                      ${
                        isEnabled
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                      }
                    `}
                  >
                    <span className="truncate font-medium">{label}</span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(v) => toggleIndicator(key, v)}
                      className="shrink-0 pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
