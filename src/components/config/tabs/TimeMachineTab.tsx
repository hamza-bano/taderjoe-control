import { TimeMachineConfig, TimeMachineTrigger } from "@/types/config";
import { FormField } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

interface TimeMachineTabProps {
  config: TimeMachineConfig;
  onChange: (config: TimeMachineConfig) => void;
}

export function TimeMachineTab({ config, onChange }: TimeMachineTabProps) {
  const updateField = <K extends keyof TimeMachineConfig>(
    key: K,
    value: TimeMachineConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const addTrigger = () => {
    const newTrigger: TimeMachineTrigger = {
      id: `trigger-${Date.now()}`,
      type: "price_change",
      lookbackCandles: 10,
      thresholdPercent: 5,
      direction: "both",
    };
    updateField("triggers", [...config.triggers, newTrigger]);
  };

  const removeTrigger = (index: number) => {
    const newTriggers = [...config.triggers];
    newTriggers.splice(index, 1);
    updateField("triggers", newTriggers);
  };

  const updateTrigger = (index: number, trigger: TimeMachineTrigger) => {
    const newTriggers = [...config.triggers];
    newTriggers[index] = trigger;
    updateField("triggers", newTriggers);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Time Machine Enabled" description="Enable time machine analysis">
          <Switch
            checked={config.enabled}
            onCheckedChange={(v) => updateField("enabled", v)}
          />
        </FormField>

        <FormField
          label="Snapshot Window Before"
          description="Candles to capture before trigger"
        >
          <Input
            type="number"
            min={1}
            max={100}
            value={config.snapshotWindow.before}
            onChange={(e) =>
              updateField("snapshotWindow", {
                ...config.snapshotWindow,
                before: parseInt(e.target.value) || 10,
              })
            }
          />
        </FormField>

        <FormField
          label="Snapshot Window After"
          description="Candles to capture after trigger"
        >
          <Input
            type="number"
            min={1}
            max={100}
            value={config.snapshotWindow.after}
            onChange={(e) =>
              updateField("snapshotWindow", {
                ...config.snapshotWindow,
                after: parseInt(e.target.value) || 10,
              })
            }
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Persistence</h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Store Results" description="Persist trigger results">
            <Switch
              checked={config.persistence.storeResults}
              onCheckedChange={(v) =>
                updateField("persistence", {
                  ...config.persistence,
                  storeResults: v,
                })
              }
            />
          </FormField>

          <FormField
            label="Store Incomplete Triggers"
            description="Store triggers without full data"
          >
            <Switch
              checked={config.persistence.storeIncompleteTriggers}
              onCheckedChange={(v) =>
                updateField("persistence", {
                  ...config.persistence,
                  storeIncompleteTriggers: v,
                })
              }
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">
            Triggers ({config.triggers.length})
          </h4>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addTrigger}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Trigger
          </Button>
        </div>

        {config.triggers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No triggers configured. Click "Add Trigger" to define when to capture
            snapshots.
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {config.triggers.map((trigger, index) => (
              <AccordionItem
                key={trigger.id}
                value={trigger.id}
                className="border border-border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {trigger.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trigger.type} · {trigger.thresholdPercent}%
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField label="Trigger ID" description="Unique identifier">
                        <Input
                          value={trigger.id}
                          onChange={(e) =>
                            updateTrigger(index, {
                              ...trigger,
                              id: e.target.value,
                            })
                          }
                        />
                      </FormField>

                      <FormField label="Trigger Type" description="Type of trigger">
                        <Select
                          value={trigger.type}
                          onValueChange={(v) =>
                            updateTrigger(index, {
                              ...trigger,
                              type: v as TimeMachineTrigger["type"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price_change">Price Change</SelectItem>
                            <SelectItem value="indicator_cross">
                              Indicator Cross
                            </SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField
                        label="Lookback Candles"
                        description="Candles to look back"
                      >
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={trigger.lookbackCandles}
                          onChange={(e) =>
                            updateTrigger(index, {
                              ...trigger,
                              lookbackCandles: parseInt(e.target.value) || 10,
                            })
                          }
                        />
                      </FormField>

                      <FormField
                        label="Threshold (%)"
                        description="Percentage threshold"
                      >
                        <Input
                          type="number"
                          min={0.1}
                          max={100}
                          step={0.1}
                          value={trigger.thresholdPercent}
                          onChange={(e) =>
                            updateTrigger(index, {
                              ...trigger,
                              thresholdPercent: parseFloat(e.target.value) || 5,
                            })
                          }
                        />
                      </FormField>

                      <FormField label="Direction" description="Price direction">
                        <Select
                          value={trigger.direction}
                          onValueChange={(v) =>
                            updateTrigger(index, {
                              ...trigger,
                              direction: v as TimeMachineTrigger["direction"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="up">Up</SelectItem>
                            <SelectItem value="down">Down</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeTrigger(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Trigger
                      </Button>
                    </div>
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
