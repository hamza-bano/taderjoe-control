import { Trade } from "@/types/market";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TradesFeedProps {
  trades: Trade[];
  className?: string;
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (num >= 1000) return num.toFixed(2);
  if (num >= 1) return num.toFixed(4);
  return num.toFixed(6);
}

function formatQuantity(qty: string): string {
  const num = parseFloat(qty);
  if (num >= 100) return num.toFixed(4);
  if (num >= 1) return num.toFixed(5);
  return num.toFixed(6);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function TradesFeed({ trades, className }: TradesFeedProps) {
  if (trades.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        Waiting for trades...
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Trades</h3>
        <span className="text-xs text-muted-foreground">{trades[0]?.Symbol}</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
        <span>Price</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/50">
          {trades.map((trade, idx) => (
            <div
              key={`${trade.TradeId}-${idx}`}
              className="grid grid-cols-3 gap-2 px-3 py-1 text-xs hover:bg-muted/30 transition-colors"
            >
              <span
                className={cn(
                  "font-mono",
                  trade.IsBuyerMaker ? "text-destructive" : "text-status-ready"
                )}
              >
                {formatPrice(trade.Price)}
              </span>
              <span className="text-right text-foreground font-mono">
                {formatQuantity(trade.Quantity)}
              </span>
              <span className="text-right text-muted-foreground font-mono">
                {formatTime(trade.TradeTime)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
