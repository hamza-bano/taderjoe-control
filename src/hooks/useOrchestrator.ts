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
  ALL_SERVICE_TYPES,
  DEFAULT_SERVICE_STATE,
} from "@/types/orchestrator";

const HUB_URL = "http://localhost:5114/hub/orchestrator";

const initialState: OrchestratorState = {
  isConnected: false,
  isStale: false,
  session: null,
  services: ALL_SERVICE_TYPES.map((service) => ({
    service,
    ...DEFAULT_SERVICE_STATE,
  })),
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

  // Handle SystemStateSnapshot - replace ALL state
  const handleSystemStateSnapshot = useCallback((snapshot: SystemStateSnapshot) => {
    console.log("[Orchestrator] Received SystemStateSnapshot", snapshot);
    
    // Ensure all services are represented
    const servicesMap = new Map(
      snapshot.services.map((s) => [s.service, s])
    );
    
    const services = ALL_SERVICE_TYPES.map((serviceType) => {
      const serviceInfo = servicesMap.get(serviceType);
      return serviceInfo ?? { service: serviceType, ...DEFAULT_SERVICE_STATE };
    });

    setState({
      isConnected: true,
      isStale: false,
      session: snapshot.session,
      services,
      error: null,
      lastSnapshotAt: new Date().toISOString(),
    });
  }, []);

  // Handle SessionStateChanged - fast update
  const handleSessionStateChanged = useCallback((event: SessionStateChanged) => {
    console.log("[Orchestrator] SessionStateChanged", event);
    setState((prev) => ({
      ...prev,
      session: prev.session
        ? { ...prev.session, state: event.state, sessionId: event.sessionId }
        : { state: event.state, sessionId: event.sessionId, startedAt: null },
    }));
  }, []);

  // Handle ServiceStateChanged
  const handleServiceStateChanged = useCallback((event: ServiceStateChanged) => {
    console.log("[Orchestrator] ServiceStateChanged", event);
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.service === event.service
          ? { ...s, state: event.state, error: event.reason ?? s.error }
          : s
      ),
    }));
  }, []);

  // Handle ServiceHeartbeat
  const handleServiceHeartbeat = useCallback((event: ServiceHeartbeat) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.service === event.service
          ? { ...s, lastHeartbeat: event.timestamp }
          : s
      ),
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
            30000
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

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startSession,
    stopSession,
    requestFullState,
    clearError,
  };
}
