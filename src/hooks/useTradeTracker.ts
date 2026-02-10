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

    setState((prev) => {
      // Auto-show and set session
      const next: TradeSessionState = {
        ...prev,
        sessionId: event.SessionId,
        isVisible: true,
        openTrades: new Map(prev.openTrades),
        completedTrades: [...prev.completedTrades],
      };

      if (event.EventType === "entry") {
        const entry = event as TradeEntryEvent;
        const openEntry: OpenTrade = {
          id: `trade_${++tradeIdCounter}`,
          symbol: entry.Symbol,
          interval: entry.Interval,
          strategyMode: entry.StrategyMode,
          entryTime: entry.Time,
          entryPrice: entry.Price,
        };

        const stack = next.openTrades.get(entry.Symbol) || [];
        stack.push(openEntry);
        next.openTrades.set(entry.Symbol, stack);
      } else {
        const exit = event as TradeExitEvent;
        const stack = next.openTrades.get(exit.Symbol) || [];

        if (stack.length > 0) {
          // Pop first entry (FIFO stack)
          const matchedEntry = stack.shift()!;
          next.openTrades.set(exit.Symbol, stack);

          const completed: CompletedTrade = {
            id: matchedEntry.id,
            symbol: exit.Symbol,
            interval: exit.Interval,
            strategyMode: matchedEntry.strategyMode,
            entryTime: matchedEntry.entryTime,
            entryPrice: matchedEntry.entryPrice,
            exitTime: exit.Time,
            exitPrice: exit.Price,
            exitReason: exit.ExitReason,
            pnl: exit.Pnl,
            pnlPercent: ((exit.Price - matchedEntry.entryPrice) / matchedEntry.entryPrice) * 100,
            duration: exit.Time - matchedEntry.entryTime,
          };

          next.completedTrades.push(completed);
          next.totalPnl = prev.totalPnl + exit.Pnl;
          next.tradeCount = prev.tradeCount + 1;
          next.winCount = prev.winCount + (exit.Pnl >= 0 ? 1 : 0);
          next.lossCount = prev.lossCount + (exit.Pnl < 0 ? 1 : 0);
        } else {
          console.warn("[TradeTracker] Exit with no matching entry for", exit.Symbol);
        }
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
        bestTrade: trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0,
        worstTrade: trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0,
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
    const sorted = [...state.completedTrades].sort((a, b) => a.exitTime - b.exitTime);
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
