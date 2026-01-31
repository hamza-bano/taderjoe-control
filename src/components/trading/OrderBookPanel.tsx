import { useMemo } from "react";
import { OrderBook, MAX_ORDERBOOK_LEVELS } from "@/types/market";
import { cn } from "@/lib/utils";

interface OrderBookPanelProps {
  orderBook: OrderBook | null;
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
  if (num >= 1000) return num.toFixed(2);
  if (num >= 1) return num.toFixed(4);
  return num.toFixed(6);
}

export function OrderBookPanel({ orderBook, className }: OrderBookPanelProps) {
  const { bids, asks, maxTotal } = useMemo(() => {
    if (!orderBook) return { bids: [], asks: [], maxTotal: 0 };

    const topBids = orderBook.Bids.slice(0, MAX_ORDERBOOK_LEVELS);
    const topAsks = orderBook.Asks.slice(0, MAX_ORDERBOOK_LEVELS).reverse();

    // Calculate running totals
    let bidTotal = 0;
    const bidsWithTotal = topBids.map((b) => {
      bidTotal += parseFloat(b.Quantity);
      return { ...b, total: bidTotal };
    });

    let askTotal = 0;
    const asksWithTotal = topAsks.map((a) => {
      askTotal += parseFloat(a.Quantity);
      return { ...a, total: askTotal };
    }).reverse();

    const maxTotal = Math.max(bidTotal, askTotal);

    return { bids: bidsWithTotal, asks: asksWithTotal, maxTotal };
  }, [orderBook]);

  const spread = useMemo(() => {
    if (!orderBook || !orderBook.Asks[0] || !orderBook.Bids[0]) return null;
    const askPrice = parseFloat(orderBook.Asks[0].Price);
    const bidPrice = parseFloat(orderBook.Bids[0].Price);
    const spreadValue = askPrice - bidPrice;
    const spreadPct = (spreadValue / askPrice) * 100;
    return { value: spreadValue, pct: spreadPct };
  }, [orderBook]);

  if (!orderBook) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        Waiting for order book data...
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Order Book</h3>
        <span className="text-xs text-muted-foreground">{orderBook.Symbol}</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
        <span>Price</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - Red */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col justify-end h-[45%] overflow-hidden">
          {asks.map((ask, idx) => (
            <div
              key={`ask-${idx}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-0.5 text-xs"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-destructive/20"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              />
              <span className="relative text-destructive font-mono">
                {formatPrice(ask.Price)}
              </span>
              <span className="relative text-right text-foreground font-mono">
                {formatQuantity(ask.Quantity)}
              </span>
              <span className="relative text-right text-muted-foreground font-mono">
                {formatQuantity(ask.total.toString())}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        {spread && (
          <div className="flex items-center justify-center py-1.5 border-y border-border bg-muted/30">
            <span className="text-xs font-mono text-foreground">
              {formatPrice(spread.value.toString())}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              ({spread.pct.toFixed(3)}%)
            </span>
          </div>
        )}

        {/* Bids (Buys) - Green */}
        <div className="h-[45%] overflow-hidden">
          {bids.map((bid, idx) => (
            <div
              key={`bid-${idx}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-0.5 text-xs"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-status-ready/20"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <span className="relative text-status-ready font-mono">
                {formatPrice(bid.Price)}
              </span>
              <span className="relative text-right text-foreground font-mono">
                {formatQuantity(bid.Quantity)}
              </span>
              <span className="relative text-right text-muted-foreground font-mono">
                {formatQuantity(bid.total.toString())}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
