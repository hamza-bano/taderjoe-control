import { IndicatorsConfig, IndicatorEntry } from "@/types/config";
import { FormField, KeyValueEditor } from "../shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface IndicatorsTabProps {
  config: IndicatorsConfig;
  onChange: (config: IndicatorsConfig) => void;
}

const COMMON_INDICATORS = [
  "EMA",
  "SMA",
  "RSI",
  "MACD",
  "BOLLINGER",
  "ATR",
  "PRICE_CHANGE",
  "VOLUME",
  "VWAP",
  "CUSTOM",
];

export function IndicatorsTab({ config, onChange }: IndicatorsTabProps) {
  const updateField = <K extends keyof IndicatorsConfig>(
    key: K,
    value: IndicatorsConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const addIndicator = () => {
    const newIndicator: IndicatorEntry = {
      name: "EMA",
      parameters: { period: 21 },
    };
    updateField("enabled", [...config.enabled, newIndicator]);
  };

  const removeIndicator = (index: number) => {
    const newEnabled = [...config.enabled];
    newEnabled.splice(index, 1);
    updateField("enabled", newEnabled);
  };

  const updateIndicator = (index: number, indicator: IndicatorEntry) => {
    const newEnabled = [...config.enabled];
    newEnabled[index] = indicator;
    updateField("enabled", newEnabled);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Emit On" description="When to emit indicator values">
          <Select
            value={config.emitOn}
            onValueChange={(v) =>
              updateField("emitOn", v as IndicatorsConfig["emitOn"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KLINE_CLOSE">Kline Close</SelectItem>
              <SelectItem value="KLINE_OPEN">Kline Open</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Default Rolling Window"
          description="Default candles to keep for calculations"
        >
          <Input
            type="number"
            min={10}
            max={1000}
            value={config.defaultRollingWindow}
            onChange={(e) =>
              updateField("defaultRollingWindow", parseInt(e.target.value) || 100)
            }
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">
            Enabled Indicators ({config.enabled.length})
          </h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addIndicator}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Indicator
          </Button>
        </div>

        {config.enabled.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No indicators configured. Click "Add Indicator" to get started.
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {config.enabled.map((indicator, index) => (
              <AccordionItem
                key={index}
                value={`indicator-${index}`}
                className="border border-border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {indicator.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(indicator.parameters).length} params
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <div className="space-y-4">
                    <div className="flex items-end gap-4">
                      <FormField
                        label="Indicator Name"
                        description="Select or type indicator"
                        className="flex-1"
                      >
                        <Select
                          value={
                            COMMON_INDICATORS.includes(indicator.name)
                              ? indicator.name
                              : "CUSTOM"
                          }
                          onValueChange={(v) => {
                            if (v === "CUSTOM") return;
                            updateIndicator(index, {
                              ...indicator,
                              name: v,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_INDICATORS.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      {!COMMON_INDICATORS.includes(indicator.name) && (
                        <FormField
                          label="Custom Name"
                          description="Enter custom indicator name"
                          className="flex-1"
                        >
                          <Input
                            value={indicator.name}
                            onChange={(e) =>
                              updateIndicator(index, {
                                ...indicator,
                                name: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="CUSTOM_INDICATOR"
                          />
                        </FormField>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeIndicator(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <FormField
                      label="Parameters"
                      description="Key-value parameters for this indicator"
                    >
                      <KeyValueEditor
                        value={indicator.parameters as Record<string, unknown>}
                        onChange={(params) =>
                          updateIndicator(index, {
                            ...indicator,
                            parameters: params,
                          })
                        }
                      />
                    </FormField>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
