import { useState } from "react";
import { ResearchConfig } from "@/types/config";
import { FormField } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ResearchTabProps {
  config: ResearchConfig;
  onChange: (config: ResearchConfig) => void;
}

export function ResearchTab({ config, onChange }: ResearchTabProps) {
  const [newBucketKey, setNewBucketKey] = useState("");

  const updateField = <K extends keyof ResearchConfig>(
    key: K,
    value: ResearchConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const addBucket = () => {
    if (!newBucketKey.trim()) return;
    const key = newBucketKey.trim();
    if (key in config.featureBucketing) return;

    updateField("featureBucketing", {
      ...config.featureBucketing,
      [key]: [],
    });
    setNewBucketKey("");
  };

  const removeBucket = (key: string) => {
    const newBucketing = { ...config.featureBucketing };
    delete newBucketing[key];
    updateField("featureBucketing", newBucketing);
  };

  const updateBucket = (key: string, values: number[]) => {
    updateField("featureBucketing", {
      ...config.featureBucketing,
      [key]: values,
    });
  };

  const parseArrayString = (str: string): number[] => {
    return str
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Research Enabled" description="Enable research analysis">
          <Switch
            checked={config.enabled}
            onCheckedChange={(v) => updateField("enabled", v)}
          />
        </FormField>

        <FormField
          label="Minimum Sample Size"
          description="Required samples for analysis"
        >
          <Input
            type="number"
            min={1}
            max={1000}
            value={config.minimumSampleSize}
            onChange={(e) =>
              updateField("minimumSampleSize", parseInt(e.target.value) || 30)
            }
          />
        </FormField>

        <FormField label="Calculate Lift" description="Calculate lift metrics">
          <Switch
            checked={config.calculateLift}
            onCheckedChange={(v) => updateField("calculateLift", v)}
          />
        </FormField>

        <FormField label="Store Derived Rules" description="Persist derived rules">
          <Switch
            checked={config.storeDerivedRules}
            onCheckedChange={(v) => updateField("storeDerivedRules", v)}
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">
            Feature Bucketing ({Object.keys(config.featureBucketing).length}{" "}
            features)
          </h4>
        </div>

        <div className="space-y-4">
          {Object.entries(config.featureBucketing).map(([key, values]) => (
            <div
              key={key}
              className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex-1 space-y-2">
                <div className="font-mono text-sm font-semibold text-primary">
                  {key}
                </div>
                <Input
                  value={values.join(", ")}
                  onChange={(e) =>
                    updateBucket(key, parseArrayString(e.target.value))
                  }
                  placeholder="Enter bucket boundaries (e.g., 0, 25, 50, 75, 100)"
                  className="font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeBucket(key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newBucketKey}
              onChange={(e) => setNewBucketKey(e.target.value)}
              placeholder="Feature name (e.g., rsi_14)"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addBucket}
              disabled={!newBucketKey.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
