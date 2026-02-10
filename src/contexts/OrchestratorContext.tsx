import { createContext, useContext, ReactNode } from "react";
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

  // Reset trades when session goes to Idle (session ended)
  // We keep trades visible so user can review, but reset on new session start
  const prevSessionState = orchestrator.session?.state;
  if (
    prevSessionState === SessionState.Starting &&
    trades.sessionId !== null &&
    trades.sessionId !== orchestrator.session?.sessionId
  ) {
    trades.resetTrades(orchestrator.session?.sessionId ?? undefined);
  }

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
