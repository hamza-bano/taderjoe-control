import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { ServiceInfo, ServiceState, ServiceType } from "@/types/orchestrator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Server,
  TrendingUp,
  Brain,
  Clock,
  Search,
  AlertTriangle,
} from "lucide-react";

const SERVICE_ICONS: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
  [ServiceType.MarketData]: TrendingUp,
  [ServiceType.IndicatorEngine]: Server,
  [ServiceType.StrategyEngine]: Brain,
  [ServiceType.TimeMachine]: Clock,
  [ServiceType.Research]: Search,
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  [ServiceType.MarketData]: "Market Data",
  [ServiceType.IndicatorEngine]: "Indicator Engine",
  [ServiceType.StrategyEngine]: "Strategy Engine",
  [ServiceType.TimeMachine]: "Time Machine",
  [ServiceType.Research]: "Research",
};

function getStateStyles(state: ServiceState): {
  dot: string;
  text: string;
  glow: string;
} {
  switch (state) {
    case ServiceState.Ready:
      return {
        dot: "bg-status-ready",
        text: "text-status-ready",
        glow: "glow-green",
      };
    case ServiceState.Starting:
      return {
        dot: "bg-status-starting",
        text: "text-status-starting",
        glow: "glow-blue",
      };
    case ServiceState.Unhealthy:
      return {
        dot: "bg-status-unhealthy",
        text: "text-status-unhealthy",
        glow: "glow-yellow",
      };
    case ServiceState.Fatal:
      return {
        dot: "bg-status-fatal",
        text: "text-status-fatal",
        glow: "glow-red",
      };
    case ServiceState.Stopped:
    default:
      return {
        dot: "bg-status-stopped",
        text: "text-status-stopped",
        glow: "",
      };
  }
}

function formatHeartbeat(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleTimeString();
  } catch {
    return "Invalid";
  }
}

function ServiceCard({ service }: { service: ServiceInfo }) {
  const Icon = SERVICE_ICONS[service.service];
  const label = SERVICE_LABELS[service.service];
  const styles = getStateStyles(service.state);

  return (
    <Card className={cn("card-interactive", service.state === ServiceState.Fatal && "border-status-fatal/50")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{label}</span>
          </div>
          <div className={cn("status-dot", styles.dot, styles.glow)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">State</span>
            <span className={cn("font-mono text-xs font-medium", styles.text)}>
              {service.state}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Heartbeat</span>
            <span className="font-mono text-xs">
              {formatHeartbeat(service.lastHeartbeat)}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {service.error && (
          <div className="mt-3 p-2 bg-destructive/10 rounded border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive break-words">
                {service.error}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ServiceHealth() {
  const { services, isStale } = useOrchestratorContext();

  return (
    <Card className={cn(isStale && "stale-overlay")}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          Service Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.service} service={service} />
          ))}
        </div>

        {/* Stale Indicator */}
        {isStale && (
          <p className="text-xs text-muted-foreground text-center pt-4">
            ⚠ Data may be stale (disconnected)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
