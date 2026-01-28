import { ObservabilityConfig } from "@/types/config";
import { FormField } from "../shared";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ObservabilityTabProps {
  config: ObservabilityConfig;
  onChange: (config: ObservabilityConfig) => void;
}

export function ObservabilityTab({ config, onChange }: ObservabilityTabProps) {
  const updateField = <K extends keyof ObservabilityConfig>(
    key: K,
    value: ObservabilityConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label="Emit Health Events"
          description="Broadcast health status events"
        >
          <Switch
            checked={config.emitHealthEvents}
            onCheckedChange={(v) => updateField("emitHealthEvents", v)}
          />
        </FormField>

        <FormField
          label="Track Lag Metrics"
          description="Monitor processing lag metrics"
        >
          <Switch
            checked={config.trackLagMetrics}
            onCheckedChange={(v) => updateField("trackLagMetrics", v)}
          />
        </FormField>

        <FormField label="Log Level" description="Minimum log level to emit">
          <Select
            value={config.logLevel}
            onValueChange={(v) =>
              updateField("logLevel", v as ObservabilityConfig["logLevel"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
