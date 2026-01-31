/**
 * TaderJoe Orchestrator Contracts
 * These types EXACTLY match the backend SignalR contracts.
 * DO NOT modify without backend coordination.
 */

import {
  PlatformConfig,
  ConfigUpdateResult,
  ConfigUpdateStatus,
} from "./config";

// Re-export config types for convenience
export type { PlatformConfig, ConfigUpdateResult, ConfigUpdateStatus };

// ========================================
// ENUMS
// ========================================

export enum SessionState {
  Idle = 0,
  ValidatingConfig = 1,
  Starting = 2,
  Running = 3,
  Stopping = 4,
  Completed = 5,
  FailedStartup = 6,
  FailedRuntime = 7,
}

export enum ServiceType {
  MarketData = 0,
  IndicatorEngine = 1,
  StrategyEngine = 2,
  TimeMachine = 3,
  Research = 4,
}

export enum ServiceState {
  Stopped = 0,
  Starting = 1,
  Ready = 2,
  Unhealthy = 3,
  Fatal = 4,
  Completed = 5,
  Connected = 6,
  Started = 7,
}

// ========================================
// DATA SHAPES
// ========================================

export interface SessionInfo {
  sessionId: string | null;
  state: SessionState;
  startedAt: string | null; // ISO8601 timestamp
}

export interface ServiceInfo {
  service: ServiceType;
  state: ServiceState;
  lastHeartbeat: string | null; // ISO8601 timestamp
  error: string | null;
}

export interface ConfigInfo {
  editable: PlatformConfig;
  frozen: PlatformConfig | null;
}

// ========================================
// EVENTS (BACKEND → FRONTEND)
// ========================================

/**
 * SystemStateSnapshot - PRIMARY EVENT
 * This is the SINGLE SOURCE OF TRUTH.
 * When received, frontend MUST replace ALL local state.
 */
export interface SystemStateSnapshot {
  session: SessionInfo;
  services: ServiceInfo[];
  config: ConfigInfo;
}

/**
 * SessionStateChanged - SECONDARY EVENT
 * Used for fast UI updates, but SystemStateSnapshot is authoritative.
 */
export interface SessionStateChanged {
  state: SessionState;
  sessionId: string | null;
}

/**
 * ServiceStateChanged - SERVICE EVENT
 */
export interface ServiceStateChanged {
  service: ServiceType;
  state: ServiceState;
  reason?: string;
}

/**
 * ServiceHeartbeat - HEARTBEAT EVENT
 */
export interface ServiceHeartbeat {
  service: ServiceType;
  timestamp: string; // ISO8601 timestamp
}

// ========================================
// COMMANDS (FRONTEND → BACKEND)
// ========================================

/**
 * Available hub methods to invoke
 */
export type HubMethod =
  | "RequestFullState"
  | "StartSession"
  | "StopSession"
  | "UpdateConfig";

// ========================================
// FRONTEND STATE
// ========================================

export interface OrchestratorState {
  isConnected: boolean;
  isStale: boolean;
  session: SessionInfo | null;
  services: ServiceInfo[];
  config: PlatformConfig | null;
  frozenConfig: PlatformConfig | null;
  configUpdateResult: ConfigUpdateResult | null;
  error: string | null;
  lastSnapshotAt: string | null;
}

// ========================================
// HELPER CONSTANTS
// ========================================

/**
 * All service types in display order
 */
export const ALL_SERVICE_TYPES: ServiceType[] = [
  ServiceType.MarketData,
  ServiceType.IndicatorEngine,
  ServiceType.StrategyEngine,
  ServiceType.TimeMachine,
  ServiceType.Research,
];

/**
 * Default service state when no data received
 */
export const DEFAULT_SERVICE_STATE: Omit<ServiceInfo, "service"> = {
  state: ServiceState.Stopped,
  lastHeartbeat: null,
  error: null,
};
