import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useOrchestrator } from "@/hooks/useOrchestrator";
import { useTradeTracker } from "@/hooks/useTradeTracker";
import { SessionState } from "@/types/orchestrator";

type OrchestratorContextType = ReturnType<typeof useOrchestrator> & {
  trades: ReturnType<typeof useTradeTracker>;
};

const OrchestratorContext = createContext<OrchestratorContextType | null>(null);

export function OrchestratorProvider({ children }: { children: ReactNode }) {
  const trades = useTradeTracker();

  const orchestrator = useOrchestrator(trades.handleTradeEvent);

  // Reset trades when a NEW session starts (different sessionId)
  const prevSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentSessionId = orchestrator.session?.sessionId ?? null;
    const sessionState = orchestrator.session?.state;

    if (
      sessionState === SessionState.Starting &&
      currentSessionId !== null &&
      prevSessionIdRef.current !== null &&
      currentSessionId !== prevSessionIdRef.current
    ) {
      trades.resetTrades(currentSessionId);
    }

    prevSessionIdRef.current = currentSessionId;
  }, [orchestrator.session?.sessionId, orchestrator.session?.state, trades.resetTrades]);

  return (
    <OrchestratorContext.Provider value={{ ...orchestrator, trades }}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export function useOrchestratorContext() {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error(
      "useOrchestratorContext must be used within OrchestratorProvider"
    );
  }
  return context;
}
