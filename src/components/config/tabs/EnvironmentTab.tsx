import { EnvironmentConfig } from "@/types/config";
import { FormField } from "../shared";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnvironmentTabProps {
  config: EnvironmentConfig;
  onChange: (config: EnvironmentConfig) => void;
}

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
];

export function EnvironmentTab({ config, onChange }: EnvironmentTabProps) {
  const updateField = <K extends keyof EnvironmentConfig>(
    key: K,
    value: EnvironmentConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const updateLiveConstraint = (
    key: keyof EnvironmentConfig["constraints"]["live"],
    value: boolean
  ) => {
    onChange({
      ...config,
      constraints: {
        ...config.constraints,
        live: { ...config.constraints.live, [key]: value },
      },
    });
  };

  const updateHistoricConstraint = (
    key: keyof EnvironmentConfig["constraints"]["historic"],
    value: boolean
  ) => {
    onChange({
      ...config,
      constraints: {
        ...config.constraints,
        historic: { ...config.constraints.historic, [key]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Environment Type" description="Live or historic mode">
          <Select
            value={config.type}
            onValueChange={(v) =>
              updateField("type", v as EnvironmentConfig["type"])
            }
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

        <FormField label="Timezone" description="Timezone for timestamps">
          <Select
            value={config.timezone}
            onValueChange={(v) => updateField("timezone", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Live Environment Constraints
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Allow Orderbook" description="Enable orderbook data in live mode">
            <Switch
              checked={config.constraints.live.allowOrderbook}
              onCheckedChange={(v) => updateLiveConstraint("allowOrderbook", v)}
            />
          </FormField>

          <FormField label="Allow Trades" description="Enable trade data in live mode">
            <Switch
              checked={config.constraints.live.allowTrades}
              onCheckedChange={(v) => updateLiveConstraint("allowTrades", v)}
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          Historic Environment Constraints
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Allow Orderbook"
            description="Enable orderbook data in historic mode (read-only)"
          >
            <Switch
              checked={config.constraints.historic.allowOrderbook}
              onCheckedChange={(v) => updateHistoricConstraint("allowOrderbook", v)}
              disabled
            />
          </FormField>

          <FormField
            label="Allow Trades"
            description="Enable trade data in historic mode (read-only)"
          >
            <Switch
              checked={config.constraints.historic.allowTrades}
              onCheckedChange={(v) => updateHistoricConstraint("allowTrades", v)}
              disabled
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
