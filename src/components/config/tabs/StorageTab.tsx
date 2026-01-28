import { StorageConfig } from "@/types/config";
import { FormField } from "../shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface StorageTabProps {
  config: StorageConfig;
  onChange: (config: StorageConfig) => void;
}

export function StorageTab({ config, onChange }: StorageTabProps) {
  const updateRedis = <K extends keyof StorageConfig["redis"]>(
    key: K,
    value: StorageConfig["redis"][K]
  ) => {
    onChange({
      ...config,
      redis: { ...config.redis, [key]: value },
    });
  };

  const updateRedisRoles = <K extends keyof StorageConfig["redis"]["roles"]>(
    key: K,
    value: StorageConfig["redis"]["roles"][K]
  ) => {
    onChange({
      ...config,
      redis: {
        ...config.redis,
        roles: { ...config.redis.roles, [key]: value },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Redis Enabled" description="Enable Redis storage backend">
          <Switch
            checked={config.redis.enabled}
            onCheckedChange={(v) => updateRedis("enabled", v)}
          />
        </FormField>

        <FormField
          label="Namespace Prefix"
          description="Redis key namespace prefix"
        >
          <Input
            value={config.redis.namespacePrefix}
            onChange={(e) => updateRedis("namespacePrefix", e.target.value)}
            placeholder="taderjoe"
          />
        </FormField>

        <FormField
          label="Purge on Session Start"
          description="Clear Redis data when session starts"
        >
          <Switch
            checked={config.redis.purgeOnSessionStart}
            onCheckedChange={(v) => updateRedis("purgeOnSessionStart", v)}
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Redis Roles</h4>
        <div className="grid gap-6 md:grid-cols-3">
          <FormField label="Event Bus" description="Use Redis as event bus">
            <Switch
              checked={config.redis.roles.eventBus}
              onCheckedChange={(v) => updateRedisRoles("eventBus", v)}
            />
          </FormField>

          <FormField label="Hot State" description="Store hot state in Redis">
            <Switch
              checked={config.redis.roles.hotState}
              onCheckedChange={(v) => updateRedisRoles("hotState", v)}
            />
          </FormField>

          <FormField label="Session Logs" description="Store session logs in Redis">
            <Switch
              checked={config.redis.roles.sessionLogs}
              onCheckedChange={(v) => updateRedisRoles("sessionLogs", v)}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
