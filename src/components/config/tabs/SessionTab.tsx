import { SessionConfig } from "@/types/config";
import { FormField } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SessionTabProps {
  config: SessionConfig;
  onChange: (config: SessionConfig) => void;
}

export function SessionTab({ config, onChange }: SessionTabProps) {
  const updateField = <K extends keyof SessionConfig>(
    key: K,
    value: SessionConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const updateLifecycle = <K extends keyof SessionConfig["lifecycle"]>(
    key: K,
    value: SessionConfig["lifecycle"][K]
  ) => {
    onChange({
      ...config,
      lifecycle: { ...config.lifecycle, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Session Mode" description="Live trading or historic backtesting">
          <Select
            value={config.mode}
            onValueChange={(v) => updateField("mode", v as SessionConfig["mode"])}
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

        <FormField label="Allow Hot Edits" description="Allow config changes while running">
          <Switch
            checked={config.allowHotEdits}
            onCheckedChange={(v) => updateField("allowHotEdits", v)}
          />
        </FormField>

        <FormField label="Single Active Session" description="Allow only one session at a time">
          <Switch
            checked={config.singleActiveSession}
            onCheckedChange={(v) => updateField("singleActiveSession", v)}
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Lifecycle Settings</h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Auto Start" description="Start session automatically on connect">
            <Switch
              checked={config.lifecycle.autoStart}
              onCheckedChange={(v) => updateLifecycle("autoStart", v)}
            />
          </FormField>

          <FormField
            label="Auto Stop on Historic End"
            description="Stop session when historic data is exhausted"
          >
            <Switch
              checked={config.lifecycle.autoStopOnHistoricEnd}
              onCheckedChange={(v) => updateLifecycle("autoStopOnHistoricEnd", v)}
            />
          </FormField>

          <FormField
            label="Graceful Shutdown Timeout (s)"
            description="Seconds to wait for graceful shutdown"
          >
            <Input
              type="number"
              min={1}
              max={300}
              value={config.lifecycle.gracefulShutdownTimeoutSeconds}
              onChange={(e) =>
                updateLifecycle(
                  "gracefulShutdownTimeoutSeconds",
                  parseInt(e.target.value) || 30
                )
              }
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
