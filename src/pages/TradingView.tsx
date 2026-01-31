import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { CandlestickChart, OrderBookPanel, TradesFeed } from "@/components/trading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Circle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TradingView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("sessionId") || "";
  const symbol = searchParams.get("symbol") || "";
  const primaryInterval = searchParams.get("primary") || "5m";
  const secondaryInterval = searchParams.get("secondary") || "1m";

  // Validate required params
  useEffect(() => {
    if (!sessionId || !symbol) {
      navigate("/");
    }
  }, [sessionId, symbol, navigate]);

  const {
    orderBook,
    recentTrades,
    primaryKlines,
    secondaryKlines,
    currentPrimaryKline,
    currentSecondaryKline,
    isConnected,
    error,
    lastUpdate,
  } = useMarketData({
    sessionId,
    symbol,
    primaryInterval,
    secondaryInterval,
  });

  // Format last update time
  const lastUpdateFormatted = useMemo(() => {
    if (!lastUpdate) return "---";
    const date = new Date(lastUpdate);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [lastUpdate]);

  if (!sessionId || !symbol) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{symbol}</h1>
            <Badge variant="secondary" className="text-xs">
              {primaryInterval}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                isConnected ? "text-status-ready" : "text-destructive"
              )}
            />
            <span className="text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>{lastUpdateFormatted}</span>
          </div>

          {/* Error Display */}
          {error && (
            <Badge variant="destructive" className="text-xs">
              {error}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Side - Charts */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <ScrollArea className="h-full">
              <div className="flex flex-col h-full">
                {/* Primary Chart */}
                <div className="flex-1 min-h-[400px] border-b border-border">
                  <CandlestickChart
                    klines={primaryKlines}
                    currentKline={currentPrimaryKline}
                    interval={primaryInterval}
                    title={`${symbol} - Primary (${primaryInterval})`}
                  />
                </div>

                {/* Secondary Chart */}
                <div className="h-[200px] border-b border-border">
                  <CandlestickChart
                    klines={secondaryKlines}
                    currentKline={currentSecondaryKline}
                    interval={secondaryInterval}
                    title={`Secondary (${secondaryInterval})`}
                    compact
                  />
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Side - Order Book & Trades */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              {/* Order Book */}
              <ResizablePanel defaultSize={55} minSize={30}>
                <OrderBookPanel orderBook={orderBook} className="h-full" />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Recent Trades */}
              <ResizablePanel defaultSize={45} minSize={25}>
                <TradesFeed trades={recentTrades} className="h-full" />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground border-t border-border bg-card">
        <span>Session: {sessionId}</span>
        <div className="flex items-center gap-4">
          <span>Trades: {recentTrades.length}</span>
          <span>Primary Klines: {primaryKlines.length}</span>
          <span>Secondary Klines: {secondaryKlines.length}</span>
        </div>
      </footer>
    </div>
  );
}
