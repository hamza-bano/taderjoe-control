import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { SessionState } from "@/types/orchestrator";
import { cn } from "@/lib/utils";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function getSessionStateColor(state: SessionState | undefined): string {
  switch (state) {
    case SessionState.Running:
      return "text-session-running";
    case SessionState.Starting:
    case SessionState.ValidatingConfig:
      return "text-session-starting";
    case SessionState.Stopping:
      return "text-session-stopping";
    case SessionState.Completed:
      return "text-session-completed";
    case SessionState.FailedStartup:
    case SessionState.FailedRuntime:
      return "text-session-failed";
    case SessionState.Idle:
    default:
      return "text-session-idle";
  }
}

export function TopBar() {
  const { isConnected, session, requestFullState } = useOrchestratorContext();

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* Left: Logo and Title */}
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">
          TaderJoe <span className="text-muted-foreground font-normal">Orchestrator</span>
        </h1>
      </div>

      {/* Center: Session Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            State
          </span>
          <span
            className={cn(
              "font-mono text-sm font-medium",
              getSessionStateColor(session?.state)
            )}
          >
            {session?.state ?? "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Session
          </span>
          <span className="font-mono text-sm text-foreground">
            {session?.sessionId ?? "None"}
          </span>
        </div>
      </div>

      {/* Right: Connection Status and Refresh */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={requestFullState}
          disabled={!isConnected}
          className="h-8 w-8"
          title="Refresh state"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <ConnectionIndicator isConnected={isConnected} />
      </div>
    </header>
  );
}
