import { createContext, useContext, ReactNode } from "react";
import { useOrchestrator } from "@/hooks/useOrchestrator";

type OrchestratorContextType = ReturnType<typeof useOrchestrator>;

const OrchestratorContext = createContext<OrchestratorContextType | null>(null);

export function OrchestratorProvider({ children }: { children: ReactNode }) {
  const orchestrator = useOrchestrator();

  return (
    <OrchestratorContext.Provider value={orchestrator}>
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
