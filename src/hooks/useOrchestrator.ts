import { useCallback, useEffect, useRef, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import {
  OrchestratorState,
  SystemStateSnapshot,
  SessionStateChanged,
  ServiceStateChanged,
  ServiceHeartbeat,
  SessionState,
  ServiceType,
  ServiceState,
  ALL_SERVICE_TYPES,
  DEFAULT_SERVICE_STATE,
  PlatformConfig,
  ConfigUpdateResult,
} from "@/types/orchestrator";
import { DEFAULT_PLATFORM_CONFIG } from "@/types/config";
import { toast } from "@/hooks/use-toast";

const HUB_URL = "http://localhost:5114/hub/orchestrator";

const initialState: OrchestratorState = {
  isConnected: false,
  isStale: false,
  session: null,
  services: ALL_SERVICE_TYPES.map((service) => ({
    service,
    ...DEFAULT_SERVICE_STATE,
  })),
  config: null,
  frozenConfig: null,
  configUpdateResult: null,
  error: null,
  lastSnapshotAt: null,
};

export function useOrchestrator() {
  const [state, setState] = useState<OrchestratorState>(initialState);
  const connectionRef = useRef<HubConnection | null>(null);
  const reconnectingRef = useRef(false);

  // Update connection status
  const setConnected = useCallback((connected: boolean) => {
    setState((prev) => ({
      ...prev,
      isConnected: connected,
      isStale: !connected && prev.session !== null,
    }));
  }, []);

  // Handle SystemStateSnapshot - replace ALL state, but preserve Fatal/Unhealthy states
  const handleSystemStateSnapshot = useCallback(
    (snapshot: SystemStateSnapshot) => {
      console.log("[Orchestrator] Received SystemStateSnapshot", snapshot);

      // Ensure all services are represented
      const servicesMap = new Map(snapshot.services.map((s) => [s.service, s]));

      setState((prev) => {
        // Build services list, preserving Fatal/Unhealthy states unless explicitly recovered
        const services = ALL_SERVICE_TYPES.map((serviceType) => {
          const snapshotService = servicesMap.get(serviceType);
          const prevService = prev.services.find(
            (s) => s.service === serviceType,
          );

          if (snapshotService) {
            // If previous state was Fatal/Unhealthy, only update if new state is Ready
            // This preserves error states for debugging
            if (
              prevService &&
              (prevService.state === ServiceState.Fatal ||
                prevService.state === ServiceState.Unhealthy)
            ) {
              if (snapshotService.state === ServiceState.Ready) {
                // Service recovered - allow the update
                return snapshotService;
              }
              // Preserve the Fatal/Unhealthy state with updated heartbeat
              return {
                ...prevService,
                lastHeartbeat: snapshotService.lastHeartbeat,
              };
            }
            return snapshotService;
          }
          return { service: serviceType, ...DEFAULT_SERVICE_STATE };
        });

        // Use snapshot config or default if not provided
        const editableConfig =
          snapshot.config?.editable ?? DEFAULT_PLATFORM_CONFIG;
        const frozenConfig = snapshot.config?.frozen ?? null;

        return {
          isConnected: true,
          isStale: false,
          session: snapshot.session,
          services,
          config: editableConfig,
          frozenConfig,
          configUpdateResult: null,
          error: null,
          lastSnapshotAt: new Date().toISOString(),
        };
      });
    },
    [],
  );

  // Handle SessionStateChanged - fast update
  const handleSessionStateChanged = useCallback(
    (event: SessionStateChanged) => {
      console.log("[Orchestrator] SessionStateChanged", event);
      setState((prev) => ({
        ...prev,
        session: prev.session
          ? { ...prev.session, state: event.state, sessionId: event.sessionId }
          : { state: event.state, sessionId: event.sessionId, startedAt: null },
      }));
    },
    [],
  );

  // Handle ServiceStateChanged - with toast notifications
  const handleServiceStateChanged = useCallback(
    (event: ServiceStateChanged) => {
      console.log("[Orchestrator] ServiceStateChanged", event);

      // Show toast for important state changes
      const serviceLabel = event.service;

      if (event.state === ServiceState.Fatal) {
        toast({
          title: `${serviceLabel} Fatal`,
          description: event.reason || "Service encountered a fatal error",
          variant: "destructive",
        });
      } else if (event.state === ServiceState.Unhealthy) {
        toast({
          title: `${serviceLabel} Unhealthy`,
          description: event.reason || "Service is experiencing issues",
          variant: "destructive",
        });
      } else if (event.state === ServiceState.Ready) {
        toast({
          title: `${serviceLabel} Ready`,
          description: "Service is now operational",
        });
      }

      setState((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s.service === event.service
            ? {
                ...s,
                state: event.state,
                error:
                  event.reason ??
                  (event.state === ServiceState.Ready ? null : s.error),
              }
            : s,
        ),
      }));
    },
    [],
  );

  // Handle ServiceHeartbeat
  const handleServiceHeartbeat = useCallback((event: ServiceHeartbeat) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.service === event.service
          ? { ...s, lastHeartbeat: event.timestamp }
          : s,
      ),
    }));
  }, []);

  // Handle ConfigUpdateResult
  const handleConfigUpdateResult = useCallback((result: ConfigUpdateResult) => {
    console.log("[Orchestrator] ConfigUpdateResult", result);
    setState((prev) => ({
      ...prev,
      configUpdateResult: result,
      error:
        result.status === "Rejected"
          ? (result.reason ?? "Config update rejected")
          : null,
    }));
  }, []);

  // Initialize connection
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2s, 4s, 8s, 16s, max 30s
          const delay = Math.min(
            Math.pow(2, retryContext.previousRetryCount) * 1000,
            30000,
          );
          return delay;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Register event handlers
    connection.on("SystemStateSnapshot", handleSystemStateSnapshot);
    connection.on("SessionStateChanged", handleSessionStateChanged);
    connection.on("ServiceStateChanged", handleServiceStateChanged);
    connection.on("ServiceHeartbeat", handleServiceHeartbeat);
    connection.on("ConfigUpdateResult", handleConfigUpdateResult);

    // Connection lifecycle handlers
    connection.onclose((error) => {
      console.log("[Orchestrator] Connection closed", error);
      setConnected(false);
      reconnectingRef.current = false;
    });

    connection.onreconnecting((error) => {
      console.log("[Orchestrator] Reconnecting...", error);
      setConnected(false);
      reconnectingRef.current = true;
    });

    connection.onreconnected((connectionId) => {
      console.log("[Orchestrator] Reconnected", connectionId);
      setConnected(true);
      reconnectingRef.current = false;
      // Request full state on reconnect
      connection.invoke("RequestFullState").catch((err) => {
        console.error("[Orchestrator] RequestFullState failed", err);
      });
    });

    connectionRef.current = connection;

    // Start connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log("[Orchestrator] Connected");
        setConnected(true);
        // Request full state on initial connection
        await connection.invoke("RequestFullState");
      } catch (err) {
        console.error("[Orchestrator] Connection failed", err);
        setConnected(false);
        // Retry after delay
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      connection.stop();
    };
  }, [
    handleSystemStateSnapshot,
    handleSessionStateChanged,
    handleServiceStateChanged,
    handleServiceHeartbeat,
    handleConfigUpdateResult,
    setConnected,
  ]);

  // Commands
  const startSession = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      setState((prev) => ({ ...prev, error: "Not connected" }));
      return;
    }

    // Guard: only allow when Idle
    if (state.session?.state !== SessionState.Idle) {
      setState((prev) => ({
        ...prev,
        error: `Cannot start session in state: ${state.session?.state}`,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null }));
      await connection.invoke("StartSession");
    } catch (err) {
      console.error("[Orchestrator] StartSession failed", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "StartSession failed",
      }));
    }
  }, [state.session?.state]);

  const stopSession = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      setState((prev) => ({ ...prev, error: "Not connected" }));
      return;
    }

    // Guard: only allow when Running or Starting
    const allowedStates = [SessionState.Running, SessionState.Starting];
    if (!state.session || !allowedStates.includes(state.session.state)) {
      setState((prev) => ({
        ...prev,
        error: `Cannot stop session in state: ${state.session?.state}`,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null }));
      await connection.invoke("StopSession");
    } catch (err) {
      console.error("[Orchestrator] StopSession failed", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "StopSession failed",
      }));
    }
  }, [state.session?.state]);

  const requestFullState = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await connection.invoke("RequestFullState");
    } catch (err) {
      console.error("[Orchestrator] RequestFullState failed", err);
    }
  }, []);

  // Update local config state (in-memory only)
  const setLocalConfig = useCallback((config: PlatformConfig) => {
    setState((prev) => ({
      ...prev,
      config,
      configUpdateResult: null, // Clear previous result when editing
    }));
  }, []);

  // Send full config to backend
  const updateConfig = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      setState((prev) => ({ ...prev, error: "Not connected" }));
      return;
    }

    if (!state.config) {
      setState((prev) => ({ ...prev, error: "No config to save" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null, configUpdateResult: null }));
      await connection.invoke("UpdateConfig", { config: state.config });
    } catch (err) {
      console.error("[Orchestrator] UpdateConfig failed", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "UpdateConfig failed",
      }));
    }
  }, [state.config]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearConfigUpdateResult = useCallback(() => {
    setState((prev) => ({ ...prev, configUpdateResult: null }));
  }, []);

  return {
    ...state,
    startSession,
    stopSession,
    requestFullState,
    setLocalConfig,
    updateConfig,
    clearError,
    clearConfigUpdateResult,
  };
}
