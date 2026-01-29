/**
 * TaderJoe PlatformConfig Types
 * These types EXACTLY match the backend config contracts.
 * DO NOT modify without backend coordination.
 */

// ========================================
// META CONFIG
// ========================================

export interface MetaConfig {
  configVersion: string;
  description: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

// ========================================
// SESSION CONFIG
// ========================================

export type SessionMode = "trading" | "time-machine" | "research";

export interface SessionConfig {
  sessionMode: SessionMode;
}

// ========================================
// MARKET CONFIG
// ========================================

export type MarketMode = "live" | "historic";
export type KlineInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
export type Exchange = "binance" | "bybit" | "okx" | "coinbase";

export interface OrderbookStream {
  enabled: boolean;
  depth: number;
}

export interface LiveStreams {
  klines: boolean;
  trades: boolean;
  orderbook: OrderbookStream;
}

export interface LiveMarketConfig {
  streams: LiveStreams;
}

export interface HistoricMarketConfig {
  startTime: string;
  endTime: string;
  respectRateLimits: boolean;
  paginationLimit: number;
}

export interface MarketConfig {
  mode: MarketMode;
  exchange: Exchange;
  symbols: string[];
  interval: KlineInterval;
  secondaryInterval: KlineInterval;
  live: LiveMarketConfig;
  historic: HistoricMarketConfig;
}

// ========================================
// STORAGE CONFIG
// ========================================

export interface RedisConfig {
  enabled: boolean;
  namespacePrefix: string;
  purgeOnSessionStart: boolean;
}

export interface StorageConfig {
  redis: RedisConfig;
}

// ========================================
// INDICATORS CONFIG
// ========================================

export interface IndicatorsEnabled {
  // EMAs
  EMA_9: boolean;
  EMA_21: boolean;
  EMA_50: boolean;
  EMA_200: boolean;
  // SMAs
  SMA_20: boolean;
  // VWAP
  VWAP: boolean;
  // Oscillators
  RSI_14: boolean;
  MACD_12_26_9: boolean;
  ROC_14: boolean;
  // Volatility
  ATR_14: boolean;
  BB_20_2: boolean;
  BB_WIDTH_20_2: boolean;
  KELTNER_20_1_5: boolean;
  DONCHIAN_20: boolean;
  Z_SCORE_50: boolean;
  // Volume
  VOLUME_MA_20: boolean;
  OBV: boolean;
  VOLUME_DELTA: boolean;
  // Price Change
  PRICE_CHANGE_1: boolean;
  PRICE_CHANGE_5: boolean;
  PRICE_CHANGE_10: boolean;
  PRICE_CHANGE_20: boolean;
  // Candle Patterns
  CANDLE_BODY_PCT: boolean;
  CANDLE_WICK_UP_PCT: boolean;
  CANDLE_WICK_DOWN_PCT: boolean;
  // Regime
  VOLATILITY_REGIME_100: boolean;
}

export interface IndicatorsConfig {
  enabled: IndicatorsEnabled;
}

// ========================================
// STRATEGY CONFIG
// ========================================

export type StrategyMode = "paper" | "live";
export type PositionSizingMethod = "risk_based" | "absolute";
export type RiskMethod = "pct_based" | "atr_based";
export type ConditionLogic = "AND" | "OR";

export interface CapitalConfig {
  initialUSD: number;
  riskPerTradePct: number;
  maxOpenPositions: number;
}

export interface ConditionBlock {
  logic: ConditionLogic;
  conditions: string[];
}

export interface PositionSizing {
  method: PositionSizingMethod;
  absoluteValue: string;
}

export interface RiskConfig {
  method: RiskMethod;
  stopLoss: string;
  takeProfit: string;
}

export interface StrategyConfig {
  enabled: boolean;
  mode: StrategyMode;
  capital: CapitalConfig;
  entry: ConditionBlock;
  exit: ConditionBlock;
  positionSizing: PositionSizing;
  risk: RiskConfig;
}

// ========================================
// TIME MACHINE CONFIG
// ========================================

export interface TimeMachineTrigger {
  id: string;
  condition: string;
  lookBackCandles: number;
}

export interface SnapshotWindow {
  before: number;
  after: number;
}

export interface TimeMachineConfig {
  saveData: boolean;
  triggers: TimeMachineTrigger[];
  snapshotWindow: SnapshotWindow;
}

// ========================================
// ORCHESTRATOR CONFIG
// ========================================

export interface OrchestratorConfig {
  requiresRestart: string[];
  hotEditable: string[];
}

// ========================================
// OBSERVABILITY CONFIG
// ========================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ObservabilityConfig {
  emitHealth: boolean;
  logLevel: LogLevel;
}

// ========================================
// ROOT PLATFORM CONFIG
// ========================================

export interface PlatformConfig {
  meta: MetaConfig;
  session: SessionConfig;
  market: MarketConfig;
  storage: StorageConfig;
  indicators: IndicatorsConfig;
  strategy: StrategyConfig;
  timeMachine: TimeMachineConfig;
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

export const DEFAULT_INDICATORS_ENABLED: IndicatorsEnabled = {
  EMA_9: true,
  EMA_21: true,
  EMA_50: true,
  EMA_200: true,
  SMA_20: true,
  VWAP: true,
  RSI_14: true,
  MACD_12_26_9: true,
  ROC_14: true,
  ATR_14: true,
  BB_20_2: true,
  BB_WIDTH_20_2: true,
  KELTNER_20_1_5: true,
  DONCHIAN_20: true,
  Z_SCORE_50: true,
  VOLUME_MA_20: true,
  OBV: true,
  VOLUME_DELTA: false,
  PRICE_CHANGE_1: true,
  PRICE_CHANGE_5: true,
  PRICE_CHANGE_10: true,
  PRICE_CHANGE_20: true,
  CANDLE_BODY_PCT: true,
  CANDLE_WICK_UP_PCT: true,
  CANDLE_WICK_DOWN_PCT: true,
  VOLATILITY_REGIME_100: true,
};

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  meta: {
    configVersion: "2.0.0",
    description: "Canonical config for crypto research & execution platform",
    lastModifiedBy: "ui",
    lastModifiedAt: new Date().toISOString(),
  },
  session: {
    sessionMode: "trading",
  },
  market: {
    mode: "live",
    exchange: "binance",
    symbols: ["BTCUSDT", "ETHUSDT"],
    interval: "5m",
    secondaryInterval: "1m",
    live: {
      streams: {
        klines: true,
        trades: true,
        orderbook: { enabled: true, depth: 200 },
      },
    },
    historic: {
      startTime: "2024-01-01T00:00:00Z",
      endTime: "2024-03-01T00:00:00Z",
      respectRateLimits: true,
      paginationLimit: 1000,
    },
  },
  storage: {
    redis: {
      enabled: true,
      namespacePrefix: "taderjoe",
      purgeOnSessionStart: true,
    },
  },
  indicators: {
    enabled: DEFAULT_INDICATORS_ENABLED,
  },
  strategy: {
    enabled: true,
    mode: "paper",
    capital: {
      initialUSD: 10000,
      riskPerTradePct: 1,
      maxOpenPositions: 1,
    },
    entry: {
      logic: "AND",
      conditions: [
        "EMA_21 > EMA_50",
        "RSI_14 >= 45",
        "RSI_14 <= 60",
        "BB_WIDTH_20_2 < BB_WIDTH_20_2[-20]",
      ],
    },
    exit: {
      logic: "OR",
      conditions: ["RSI_14 > 70", "PRICE_CHANGE_5 < -0.5"],
    },
    positionSizing: {
      method: "risk_based",
      absoluteValue: "200",
    },
    risk: {
      method: "pct_based",
      stopLoss: "1.0",
      takeProfit: "2.0",
    },
  },
  timeMachine: {
    saveData: true,
    triggers: [
      {
        id: "short_term_burst",
        condition: "PRICE_CHANGE_10 >= 1.0",
        lookBackCandles: 10,
      },
      {
        id: "daily_breakout",
        condition: "PRICE_CHANGE_288 >= 10.0",
        lookBackCandles: 100,
      },
    ],
    snapshotWindow: {
      before: 12,
      after: 5,
    },
  },
  orchestrator: {
    requiresRestart: [
      "market.mode",
      "market.symbols",
      "market.interval",
      "indicators.enabled",
    ],
    hotEditable: ["strategy", "timeMachine"],
  },
  observability: {
    emitHealth: true,
    logLevel: "info",
  },
};

// ========================================
// INDICATOR CATEGORIES (for UI grouping)
// ========================================

export const INDICATOR_CATEGORIES = {
  "Moving Averages": ["EMA_9", "EMA_21", "EMA_50", "EMA_200", "SMA_20", "VWAP"],
  "Oscillators": ["RSI_14", "MACD_12_26_9", "ROC_14"],
  "Volatility": ["ATR_14", "BB_20_2", "BB_WIDTH_20_2", "KELTNER_20_1_5", "DONCHIAN_20", "Z_SCORE_50"],
  "Volume": ["VOLUME_MA_20", "OBV", "VOLUME_DELTA"],
  "Price Change": ["PRICE_CHANGE_1", "PRICE_CHANGE_5", "PRICE_CHANGE_10", "PRICE_CHANGE_20"],
  "Candle Analysis": ["CANDLE_BODY_PCT", "CANDLE_WICK_UP_PCT", "CANDLE_WICK_DOWN_PCT"],
  "Regime": ["VOLATILITY_REGIME_100"],
} as const;

export const INDICATOR_LABELS: Record<string, string> = {
  EMA_9: "EMA 9",
  EMA_21: "EMA 21",
  EMA_50: "EMA 50",
  EMA_200: "EMA 200",
  SMA_20: "SMA 20",
  VWAP: "VWAP",
  RSI_14: "RSI 14",
  MACD_12_26_9: "MACD (12,26,9)",
  ROC_14: "ROC 14",
  ATR_14: "ATR 14",
  BB_20_2: "Bollinger Bands (20,2)",
  BB_WIDTH_20_2: "BB Width (20,2)",
  KELTNER_20_1_5: "Keltner Channel (20,1.5)",
  DONCHIAN_20: "Donchian 20",
  Z_SCORE_50: "Z-Score 50",
  VOLUME_MA_20: "Volume MA 20",
  OBV: "On-Balance Volume",
  VOLUME_DELTA: "Volume Delta",
  PRICE_CHANGE_1: "Price Change 1",
  PRICE_CHANGE_5: "Price Change 5",
  PRICE_CHANGE_10: "Price Change 10",
  PRICE_CHANGE_20: "Price Change 20",
  CANDLE_BODY_PCT: "Candle Body %",
  CANDLE_WICK_UP_PCT: "Upper Wick %",
  CANDLE_WICK_DOWN_PCT: "Lower Wick %",
  VOLATILITY_REGIME_100: "Volatility Regime 100",
};
