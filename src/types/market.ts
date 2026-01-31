/**
 * TaderJoe Market Data Types
 * Types for real-time market data received via SignalR
 */

// ========================================
// ORDER BOOK
// ========================================

export interface OrderBookLevel {
  Price: string;
  Quantity: string;
}

export interface OrderBook {
  Symbol: string;
  LastUpdateId: number;
  Bids: OrderBookLevel[];
  Asks: OrderBookLevel[];
}

// ========================================
// TRADE
// ========================================

export interface Trade {
  Symbol: string;
  TradeId: number;
  Price: string;
  Quantity: string;
  TradeTime: number;
  IsBuyerMaker: boolean;
}

// ========================================
// KLINE (Candlestick)
// ========================================

export interface Kline {
  Symbol: string;
  Interval: string;
  OpenTime: number;
  CloseTime: number;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
  TradeCount: number;
  IsClosed: boolean;
}

// ========================================
// MARKET UI UPDATE (SignalR Event)
// ========================================

export type MarketUpdateType = "orderbook" | "trade" | "kline" | "kline_current";

export interface MarketUiUpdate {
  type: MarketUpdateType;
  symbol: string;
  payload: string; // JSON string to be parsed
}

// ========================================
// MARKET DATA STATE
// ========================================

export interface MarketDataState {
  symbol: string;
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  primaryKlines: Kline[];
  secondaryKlines: Kline[];
  currentPrimaryKline: Kline | null;
  currentSecondaryKline: Kline | null;
  lastUpdate: string | null;
}

// ========================================
// CONSTANTS
// ========================================

export const MAX_TRADES_DISPLAY = 50;
export const MAX_ORDERBOOK_LEVELS = 15;
export const MAX_KLINES_DISPLAY = 100;
