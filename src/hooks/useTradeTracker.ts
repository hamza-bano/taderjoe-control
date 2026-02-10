import { useCallback, useRef, useState } from "react";
import {
  StrategyTradeEvent,
  TradeEntryEvent,
  TradeExitEvent,
  CompletedTrade,
  OpenTrade,
  TradeSessionState,
  SymbolTradeStats,
} from "@/types/trade";

const initialState: TradeSessionState = {
  sessionId: null,
  isVisible: false,
  openTrades: new Map(),
  completedTrades: [],
  totalPnl: 0,
  tradeCount: 0,
  winCount: 0,
  lossCount: 0,
};

let tradeIdCounter = 0;

export function useTradeTracker() {
  const [state, setState] = useState<TradeSessionState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleTradeEvent = useCallback((event: StrategyTradeEvent) => {
    console.log("[TradeTracker] StrategyTradeEvent", event);

    // console.group("[TradeTracker] RAW EVENT INSPECTION");
    // console.log("event ===", event);
    // console.log("keys:", Object.keys(event as any));
    // console.log("Symbol value:", (event as any).Symbol);
    // console.log("Symbol typeof:", typeof (event as any).Symbol);
    // console.log("symbol value:", (event as any).symbol);
    // console.log("symbol typeof:", typeof (event as any).symbol);
    // console.log("EventType:", (event as any).EventType);
    // console.log("EventType typeof:", typeof (event as any).EventType);
    // console.groupEnd();

    setState((prev) => {
      // Auto-show and set session
      const next: TradeSessionState = {
        ...prev,
        sessionId: event.SessionId,
        isVisible: true,
        openTrades: new Map(prev.openTrades),
        completedTrades: [...prev.completedTrades],
      };

      const parsed = typeof event === "string" ? JSON.parse(event) : event;
      const raw = parsed as any;

      const symbol = raw.Symbol != null ? String(raw.Symbol).trim() : "";

      const type =
        raw.EventType != null ? String(raw.EventType).toLowerCase().trim() : "";

      if (!symbol) {
        console.warn("[TradeTracker] Event missing symbol", event);
        return next;
      }

      if (type === "entry") {
        console.log("[TradeTracker] Evaluating Entry");
        const entry = event as TradeEntryEvent;
        const openEntry: OpenTrade = {
          id: `trade_${++tradeIdCounter}`,
          symbol: symbol,
          interval: entry.Interval,
          strategyMode: entry.StrategyMode,
          entryTime: entry.Time,
          entryPrice: entry.Price,
        };

        const stack = next.openTrades.get(entry.Symbol) || [];
        stack.push(openEntry);
        next.openTrades.set(entry.Symbol, stack);
      } else if (type === "exit") {
        console.log("[TradeTracker] Evaluating Exit");
        const exit = event as TradeExitEvent;
        const stack = next.openTrades.get(exit.Symbol) || [];

        if (stack.length > 0) {
          // Pop first entry (FIFO stack)
          const matchedEntry = stack.shift()!;
          next.openTrades.set(exit.Symbol, stack);

          const completed: CompletedTrade = {
            id: matchedEntry.id,
            symbol: symbol,
            interval: exit.Interval,
            strategyMode: matchedEntry.strategyMode,
            entryTime: matchedEntry.entryTime,
            entryPrice: matchedEntry.entryPrice,
            exitTime: exit.Time,
            exitPrice: exit.Price,
            exitReason: exit.ExitReason,
            pnl: exit.Pnl,
            pnlPercent:
              ((exit.Price - matchedEntry.entryPrice) /
                matchedEntry.entryPrice) *
              100,
            duration: exit.Time - matchedEntry.entryTime,
          };

          next.completedTrades.push(completed);
          next.totalPnl = prev.totalPnl + exit.Pnl;
          next.tradeCount = prev.tradeCount + 1;
          next.winCount = prev.winCount + (exit.Pnl >= 0 ? 1 : 0);
          next.lossCount = prev.lossCount + (exit.Pnl < 0 ? 1 : 0);
        } else {
          console.warn(
            "[TradeTracker] Exit with no matching entry for",
            (event as any).Symbol,
          );
        }
      } else {
        console.warn("[TradeTracker] Unknown event type", event);
      }

      return next;
    });
  }, []);

  const resetTrades = useCallback((sessionId?: string) => {
    tradeIdCounter = 0;
    setState({
      ...initialState,
      sessionId: sessionId ?? null,
      openTrades: new Map(),
    });
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    setState((prev) => ({ ...prev, isVisible: visible }));
  }, []);

  // Compute per-symbol stats
  const getSymbolStats = useCallback((): SymbolTradeStats[] => {
    const symbolMap = new Map<string, CompletedTrade[]>();
    for (const trade of state.completedTrades) {
      const list = symbolMap.get(trade.symbol) || [];
      list.push(trade);
      symbolMap.set(trade.symbol, list);
    }

    return Array.from(symbolMap.entries()).map(([symbol, trades]) => {
      const wins = trades.filter((t) => t.pnl >= 0);
      const losses = trades.filter((t) => t.pnl < 0);
      const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
      return {
        symbol,
        totalTrades: trades.length,
        winCount: wins.length,
        lossCount: losses.length,
        totalPnl,
        avgPnl: trades.length > 0 ? totalPnl / trades.length : 0,
        winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
        bestTrade:
          trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0,
        worstTrade:
          trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0,
      };
    });
  }, [state.completedTrades]);

  // Get unique symbols (from both open and completed)
  const getSymbols = useCallback((): string[] => {
    const symbols = new Set<string>();
    for (const [sym] of state.openTrades) symbols.add(sym);
    for (const t of state.completedTrades) symbols.add(t.symbol);
    return Array.from(symbols).sort();
  }, [state.openTrades, state.completedTrades]);

  // Cumulative PnL series for chart
  const getCumulativePnl = useCallback((): { time: number; pnl: number }[] => {
    const sorted = [...state.completedTrades].sort(
      (a, b) => a.exitTime - b.exitTime,
    );
    let cum = 0;
    return sorted.map((t) => {
      cum += t.pnl;
      return { time: t.exitTime, pnl: cum };
    });
  }, [state.completedTrades]);

  return {
    ...state,
    handleTradeEvent,
    resetTrades,
    setVisible,
    getSymbolStats,
    getSymbols,
    getCumulativePnl,
  };
}
