import {
  MetaConfig,
  SessionConfig,
  StorageConfig,
  SessionMode,
} from "@/types/config";
import { FormField, NumberInput } from "../shared";
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

interface SessionTabProps {
  meta: MetaConfig;
  session: SessionConfig;
  storage: StorageConfig;
  onMetaChange: (config: MetaConfig) => void;
  onSessionChange: (config: SessionConfig) => void;
  onStorageChange: (config: StorageConfig) => void;
}

const SESSION_MODES: { value: SessionMode; label: string; description: string }[] = [
  { value: "trading", label: "Trading", description: "Live or paper trading execution" },
  { value: "time-machine", label: "Time Machine", description: "Historical pattern analysis" },
  { value: "research", label: "Research", description: "Feature engineering & backtesting" },
];

export function SessionTab({
  meta,
  session,
  storage,
  onMetaChange,
  onSessionChange,
  onStorageChange,
}: SessionTabProps) {
  return (
    <div className="space-y-8">
      {/* Meta Section */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Configuration Metadata
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Config Version" description="Semantic version of config schema">
            <Input
              value={meta.configVersion}
              onChange={(e) =>
                onMetaChange({ ...meta, configVersion: e.target.value })
              }
              placeholder="2.0.0"
              className="font-mono"
            />
          </FormField>
          <FormField label="Description" description="Brief description of this config">
            <Input
              value={meta.description}
              onChange={(e) =>
                onMetaChange({ ...meta, description: e.target.value })
              }
              placeholder="Production trading config"
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* Session Mode Section */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Session Mode
        </h3>
        <FormField
          label="Session Mode"
          description="Primary operating mode for this session"
        >
          <Select
            value={session.sessionMode}
            onValueChange={(v) =>
              onSessionChange({ ...session, sessionMode: v as SessionMode })
            }
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {mode.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </section>

      <Separator />

      {/* Storage Section */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Redis Storage
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Redis Enabled"
            description="Enable Redis as storage backend"
          >
            <Switch
              checked={storage.redis.enabled}
              onCheckedChange={(v) =>
                onStorageChange({
                  ...storage,
                  redis: { ...storage.redis, enabled: v },
                })
              }
            />
          </FormField>
          <FormField
            label="Namespace Prefix"
            description="Redis key namespace prefix"
          >
            <Input
              value={storage.redis.namespacePrefix}
              onChange={(e) =>
                onStorageChange({
                  ...storage,
                  redis: { ...storage.redis, namespacePrefix: e.target.value },
                })
              }
              placeholder="taderjoe"
              className="font-mono"
              disabled={!storage.redis.enabled}
            />
          </FormField>
          <FormField
            label="Purge on Start"
            description="Clear Redis data when session starts"
          >
            <Switch
              checked={storage.redis.purgeOnSessionStart}
              onCheckedChange={(v) =>
                onStorageChange({
                  ...storage,
                  redis: { ...storage.redis, purgeOnSessionStart: v },
                })
              }
              disabled={!storage.redis.enabled}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}
