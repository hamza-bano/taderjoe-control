/**
 * Strategy Trade Event types
 * Matches backend SignalR StrategyTradeEvent payloads
 */

export interface TradeEntryEvent {
  SessionId: string;
  EventType: "entry";
  Symbol: string;
  Interval: string;
  SnapshotStreamId: string;
  Time: number;
  Price: number;
  StrategyMode: "paper" | "live";
}

export interface TradeExitEvent {
  SessionId: string;
  EventType: "exit";
  Symbol: string;
  Interval: string;
  SnapshotStreamId: string;
  Time: number;
  Price: number;
  ExitReason: string;
  Pnl: number;
}

export type StrategyTradeEvent = TradeEntryEvent | TradeExitEvent;

/** A completed trade (entry matched with exit) */
export interface CompletedTrade {
  id: string;
  symbol: string;
  interval: string;
  strategyMode: "paper" | "live";
  entryTime: number;
  entryPrice: number;
  exitTime: number;
  exitPrice: number;
  exitReason: string;
  pnl: number;
  pnlPercent: number;
  duration: number; // ms
}

/** An open trade (entry without exit yet) */
export interface OpenTrade {
  id: string;
  symbol: string;
  interval: string;
  strategyMode: "paper" | "live";
  entryTime: number;
  entryPrice: number;
}

/** Per-symbol trade summary */
export interface SymbolTradeStats {
  symbol: string;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
}

/** Global session trade state */
export interface TradeSessionState {
  sessionId: string | null;
  isVisible: boolean;
  openTrades: Map<string, OpenTrade[]>; // symbol -> stack of open entries
  completedTrades: CompletedTrade[];
  totalPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
}
