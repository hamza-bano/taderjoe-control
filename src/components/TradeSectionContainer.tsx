import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { TradeSection } from "@/components/TradeSection";

export function TradeSectionContainer() {
  const { trades } = useOrchestratorContext();

  return (
    <TradeSection
      isVisible={trades.isVisible}
      sessionId={trades.sessionId}
      completedTrades={trades.completedTrades}
      openTrades={trades.openTrades}
      totalPnl={trades.totalPnl}
      tradeCount={trades.tradeCount}
      winCount={trades.winCount}
      lossCount={trades.lossCount}
      symbols={trades.getSymbols()}
      symbolStats={trades.getSymbolStats()}
      cumulativePnl={trades.getCumulativePnl()}
      onClose={() => trades.setVisible(false)}
    />
  );
}
