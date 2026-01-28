/**
 * TaderJoe PlatformConfig Types
 * These types EXACTLY match the backend config contracts.
 * DO NOT modify without backend coordination.
 */

// ========================================
// META CONFIG
// ========================================

export interface MetaConfig {
  version: string;
  lastModified: string;
}

// ========================================
// SESSION CONFIG
// ========================================

export type SessionMode = "live" | "historic";

export interface SessionLifecycle {
  autoStart: boolean;
  autoStopOnHistoricEnd: boolean;
  gracefulShutdownTimeoutSeconds: number;
}

export interface SessionConfig {
  mode: SessionMode;
  allowHotEdits: boolean;
  singleActiveSession: boolean;
  lifecycle: SessionLifecycle;
}

// ========================================
// ENVIRONMENT CONFIG
// ========================================

export type EnvironmentType = "live" | "historic";

export interface EnvironmentConstraints {
  allowOrderbook: boolean;
  allowTrades: boolean;
}

export interface EnvironmentConfig {
  type: EnvironmentType;
  timezone: string;
  constraints: {
    live: EnvironmentConstraints;
    historic: EnvironmentConstraints;
  };
}

// ========================================
// MARKET CONFIG
// ========================================

export type KlineInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface OrderbookStream {
  enabled: boolean;
  depth: number;
}

export interface LiveStreams {
  klines: boolean;
  trades: boolean;
  orderbook: OrderbookStream;
}

export interface LiveConnection {
  websocket: boolean;
  restFallback: boolean;
}

export interface LiveDataSource {
  exchange: string;
  connection: LiveConnection;
  streams: LiveStreams;
}

export interface HistoricKlines {
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  paginationLimit: number;
  respectRateLimits: boolean;
}

export interface HistoricDataSource {
  exchange: string;
  klines: HistoricKlines;
}

export interface DataSourceConfig {
  live: LiveDataSource;
  historic: HistoricDataSource;
}

export interface MarketIntervals {
  primary: KlineInterval;
  additional: KlineInterval[];
}

export interface MarketConfig {
  symbols: string[];
  intervals: MarketIntervals;
  dataSource: DataSourceConfig;
}

// ========================================
// INDICATORS CONFIG
// ========================================

export type IndicatorEmitOn = "KLINE_CLOSE" | "KLINE_OPEN";

export interface IndicatorEntry {
  name: string;
  parameters: Record<string, unknown>;
}

export interface IndicatorsConfig {
  emitOn: IndicatorEmitOn;
  defaultRollingWindow: number;
  enabled: IndicatorEntry[];
}

// ========================================
// STRATEGY CONFIG
// ========================================

export type StrategyMode = "paper" | "live";
export type PositionSizingMethod = "fixed" | "atr" | "percent";

export interface CapitalConfig {
  initialUSD: number;
  riskPerTradePercent: number;
  maxConcurrentPositions: number;
}

export interface PositionSizing {
  method: PositionSizingMethod;
  stopLossATRMultiplier: number;
}

export interface StrategyRules {
  entry: string[];
  exit: string[];
}

export interface SnapshotWindow {
  before: number;
  after: number;
}

export interface StrategyLogging {
  logIndicatorSnapshots: boolean;
  snapshotWindow: SnapshotWindow;
}

export interface StrategyConfig {
  enabled: boolean;
  mode: StrategyMode;
  strategyId: string;
  capital: CapitalConfig;
  positionSizing: PositionSizing;
  rules: StrategyRules;
  logging: StrategyLogging;
}

// ========================================
// TIME MACHINE CONFIG
// ========================================

export type TriggerType = "price_change" | "indicator_cross" | "custom";
export type TriggerDirection = "up" | "down" | "both";

export interface TimeMachineTrigger {
  id: string;
  type: TriggerType;
  lookbackCandles: number;
  thresholdPercent: number;
  direction: TriggerDirection;
}

export interface TimeMachinePersistence {
  storeResults: boolean;
  storeIncompleteTriggers: boolean;
}

export interface TimeMachineConfig {
  enabled: boolean;
  triggers: TimeMachineTrigger[];
  snapshotWindow: SnapshotWindow;
  persistence: TimeMachinePersistence;
}

// ========================================
// RESEARCH CONFIG
// ========================================

export interface ResearchConfig {
  enabled: boolean;
  featureBucketing: Record<string, number[]>;
  minimumSampleSize: number;
  calculateLift: boolean;
  storeDerivedRules: boolean;
}

// ========================================
// STORAGE CONFIG
// ========================================

export interface RedisRoles {
  eventBus: boolean;
  hotState: boolean;
  sessionLogs: boolean;
}

export interface RedisConfig {
  enabled: boolean;
  namespacePrefix: string;
  purgeOnSessionStart: boolean;
  roles: RedisRoles;
}

export interface StorageConfig {
  redis: RedisConfig;
}

// ========================================
// ORCHESTRATOR CONFIG
// ========================================

export interface OrchestratorConfig {
  heartbeatIntervalMs: number;
  serviceStartupTimeoutMs: number;
}

// ========================================
// OBSERVABILITY CONFIG
// ========================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ObservabilityConfig {
  emitHealthEvents: boolean;
  trackLagMetrics: boolean;
  logLevel: LogLevel;
}

// ========================================
// ROOT PLATFORM CONFIG
// ========================================

export interface PlatformConfig {
  meta: MetaConfig;
  session: SessionConfig;
  environment: EnvironmentConfig;
  market: MarketConfig;
  storage: StorageConfig;
  indicators: IndicatorsConfig;
  strategy: StrategyConfig;
  timeMachine: TimeMachineConfig;
  research: ResearchConfig;
  orchestrator: OrchestratorConfig;
  observability: ObservabilityConfig;
}

// ========================================
// CONFIG UPDATE RESULT
// ========================================

export type ConfigUpdateStatus = "Accepted" | "RequiresRestart" | "Rejected";

export interface ConfigUpdateResult {
  status: ConfigUpdateStatus;
  affectedPaths: string[];
  reason?: string;
}

// ========================================
// DEFAULT CONFIG (for initialization)
// ========================================

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  meta: {
    version: "1.0.0",
    lastModified: new Date().toISOString(),
  },
  session: {
    mode: "live",
    allowHotEdits: false,
    singleActiveSession: true,
    lifecycle: {
      autoStart: false,
      autoStopOnHistoricEnd: true,
      gracefulShutdownTimeoutSeconds: 30,
    },
  },
  environment: {
    type: "live",
    timezone: "UTC",
    constraints: {
      live: { allowOrderbook: true, allowTrades: true },
      historic: { allowOrderbook: false, allowTrades: false },
    },
  },
  market: {
    symbols: ["BTCUSDT"],
    intervals: {
      primary: "1h",
      additional: [],
    },
    dataSource: {
      live: {
        exchange: "binance",
        connection: { websocket: true, restFallback: true },
        streams: {
          klines: true,
          trades: false,
          orderbook: { enabled: false, depth: 10 },
        },
      },
      historic: {
        exchange: "binance",
        klines: {
          startTime: "",
          endTime: "",
          paginationLimit: 1000,
          respectRateLimits: true,
        },
      },
    },
  },
  storage: {
    redis: {
      enabled: true,
      namespacePrefix: "taderjoe",
      purgeOnSessionStart: false,
      roles: { eventBus: true, hotState: true, sessionLogs: true },
    },
  },
  indicators: {
    emitOn: "KLINE_CLOSE",
    defaultRollingWindow: 100,
    enabled: [],
  },
  strategy: {
    enabled: false,
    mode: "paper",
    strategyId: "",
    capital: {
      initialUSD: 10000,
      riskPerTradePercent: 1,
      maxConcurrentPositions: 3,
    },
    positionSizing: {
      method: "percent",
      stopLossATRMultiplier: 2,
    },
    rules: {
      entry: [],
      exit: [],
    },
    logging: {
      logIndicatorSnapshots: false,
      snapshotWindow: { before: 5, after: 5 },
    },
  },
  timeMachine: {
    enabled: false,
    triggers: [],
    snapshotWindow: { before: 10, after: 10 },
    persistence: { storeResults: true, storeIncompleteTriggers: false },
  },
  research: {
    enabled: false,
    featureBucketing: {},
    minimumSampleSize: 30,
    calculateLift: true,
    storeDerivedRules: false,
  },
  orchestrator: {
    heartbeatIntervalMs: 5000,
    serviceStartupTimeoutMs: 30000,
  },
  observability: {
    emitHealthEvents: true,
    trackLagMetrics: true,
    logLevel: "info",
  },
};
