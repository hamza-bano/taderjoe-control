import { TimeMachineConfig, TimeMachineTrigger, TriggerComparison } from "@/types/config";
import { FormField, NumberInput } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeMachineTabProps {
  config: TimeMachineConfig;
  onChange: (config: TimeMachineConfig) => void;
}

const COMPARISON_OPTIONS: { value: TriggerComparison; label: string }[] = [
  { value: "Greater", label: "> Greater" },
  { value: "GreaterOrEqual", label: "≥ Greater or Equal" },
  { value: "Less", label: "< Less" },
  { value: "LessOrEqual", label: "≤ Less or Equal" },
];

export function TimeMachineTab({ config, onChange }: TimeMachineTabProps) {
  const updateSnapshotWindow = <K extends keyof TimeMachineConfig["snapshotWindow"]>(
    key: K,
    value: TimeMachineConfig["snapshotWindow"][K]
  ) => {
    onChange({
      ...config,
      snapshotWindow: { ...config.snapshotWindow, [key]: value },
    });
  };

  const addTrigger = () => {
    const newTrigger: TimeMachineTrigger = {
      id: `trigger_${Date.now()}`,
      metric: "PRICE_CHANGE_PERCENT",
      lookbackCandles: 10,
      comparison: "GreaterOrEqual",
      threshold: 1.0,
    };
    onChange({
      ...config,
      triggers: [...config.triggers, newTrigger],
    });
  };

  const removeTrigger = (index: number) => {
    const updated = [...config.triggers];
    updated.splice(index, 1);
    onChange({ ...config, triggers: updated });
  };

  const updateTrigger = (index: number, trigger: TimeMachineTrigger) => {
    const updated = [...config.triggers];
    updated[index] = trigger;
    onChange({ ...config, triggers: updated });
  };

  return (
    <div className="space-y-8">
      {/* Settings */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Time Machine Settings
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Save Data" description="Persist time machine results">
            <Switch
              checked={config.saveData}
              onCheckedChange={(v) => onChange({ ...config, saveData: v })}
            />
          </FormField>

          <FormField
            label="Snapshot Before (candles)"
            description="Candles to capture before trigger"
          >
            <NumberInput
              value={config.snapshotWindow.before}
              onChange={(v) => updateSnapshotWindow("before", v)}
              min={0}
              max={500}
            />
          </FormField>

          <FormField
            label="Snapshot After (candles)"
            description="Candles to capture after trigger"
          >
            <NumberInput
              value={config.snapshotWindow.after}
              onChange={(v) => updateSnapshotWindow("after", v)}
              min={0}
              max={500}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Triggers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Triggers
            <Badge variant="secondary" className="font-mono">
              {config.triggers.length}
            </Badge>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTrigger}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Trigger
          </Button>
        </div>

        {config.triggers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No triggers configured.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Add a trigger to start capturing market snapshots.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {config.triggers.map((trigger, index) => (
              <Card key={index} className="border-border bg-card/50">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-mono text-sm text-foreground">
                        {trigger.id || "Unnamed"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTrigger(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <FormField label="Trigger ID" description="Unique identifier">
                      <Input
                        value={trigger.id}
                        onChange={(e) =>
                          updateTrigger(index, { ...trigger, id: e.target.value })
                        }
                        placeholder="short_term_burst"
                        className="font-mono"
                      />
                    </FormField>

                    <FormField label="Metric" description="Value to evaluate">
                      <Select
                        value={trigger.metric}
                        onValueChange={(v) =>
                          updateTrigger(index, {
                            ...trigger,
                            metric: v as "PRICE_CHANGE_PERCENT",
                          })
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRICE_CHANGE_PERCENT">
                            PRICE_CHANGE_PERCENT
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Comparison" description="Operator">
                      <Select
                        value={trigger.comparison}
                        onValueChange={(v) =>
                          updateTrigger(index, {
                            ...trigger,
                            comparison: v as TriggerComparison,
                          })
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPARISON_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Threshold" description="Trigger value">
                      <NumberInput
                        value={trigger.threshold}
                        onChange={(v) =>
                          updateTrigger(index, { ...trigger, threshold: v })
                        }
                        min={0}
                        step={0.1}
                      />
                    </FormField>

                    <FormField
                      label="Lookback Candles"
                      description="Historical window"
                    >
                      <NumberInput
                        value={trigger.lookbackCandles}
                        onChange={(v) =>
                          updateTrigger(index, { ...trigger, lookbackCandles: v })
                        }
                        min={1}
                        max={1000}
                      />
                    </FormField>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
