import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { SessionState } from "@/types/orchestrator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Play, Square, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return "Invalid";
  }
}

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

export function SessionControl() {
  const {
    isConnected,
    isStale,
    session,
    error,
    startSession,
    stopSession,
    clearError,
  } = useOrchestratorContext();

  const canStart = isConnected && session?.state === SessionState.Idle;
  const canStop =
    isConnected &&
    (session?.state === SessionState.Running ||
      session?.state === SessionState.Starting);

  return (
    <Card className={cn("card-interactive", isStale && "stale-overlay")}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Session Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 -mr-2"
                onClick={clearError}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Session Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              State
            </span>
            <p
              className={cn(
                "font-mono text-sm font-medium",
                getSessionStateColor(session?.state)
              )}
            >
              {session?.state ?? "Unknown"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Session ID
            </span>
            <p className="font-mono text-sm truncate" title={session?.sessionId ?? undefined}>
              {session?.sessionId ?? "None"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Started At
            </span>
            <p className="font-mono text-sm">
              {formatTimestamp(session?.startedAt ?? null)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={startSession}
            disabled={!canStart}
            className="flex-1 gap-2"
            variant={canStart ? "default" : "secondary"}
          >
            <Play className="h-4 w-4" />
            Start Session
          </Button>

          <Button
            onClick={stopSession}
            disabled={!canStop}
            variant="destructive"
            className="flex-1 gap-2"
          >
            <Square className="h-4 w-4" />
            Stop Session
          </Button>
        </div>

        {/* Stale Indicator */}
        {isStale && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            ⚠ Data may be stale (disconnected)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
