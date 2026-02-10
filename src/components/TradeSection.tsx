import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Trophy,
  Activity,
} from "lucide-react";
import { CompletedTrade, OpenTrade, SymbolTradeStats } from "@/types/trade";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TradeSectionProps {
  isVisible: boolean;
  sessionId: string | null;
  completedTrades: CompletedTrade[];
  openTrades: Map<string, OpenTrade[]>;
  totalPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  symbols: string[];
  symbolStats: SymbolTradeStats[];
  cumulativePnl: { time: number; pnl: number }[];
  onClose: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatPnl(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}${pnl.toFixed(4)}`;
}

// ─── Summary Widgets ───────────────────────────────────────
function SummaryWidgets({
  totalPnl,
  tradeCount,
  winCount,
  lossCount,
}: {
  totalPnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
}) {
  const winRate = tradeCount > 0 ? ((winCount / tradeCount) * 100).toFixed(1) : "0.0";
  const isProfitable = totalPnl >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total PnL */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2 mb-1">
          {isProfitable ? (
            <TrendingUp className="h-3.5 w-3.5 text-status-ready" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Total PnL
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-lg font-bold",
            isProfitable ? "text-status-ready" : "text-destructive"
          )}
        >
          {formatPnl(totalPnl)}
        </p>
      </div>

      {/* Trade Count */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Trades
          </span>
        </div>
        <p className="font-mono text-lg font-bold text-foreground">
          {tradeCount}
        </p>
      </div>

      {/* Win Rate */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-3.5 w-3.5 text-status-unhealthy" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Win Rate
          </span>
        </div>
        <p className="font-mono text-lg font-bold text-foreground">
          {winRate}%
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {winCount}W / {lossCount}L
        </p>
      </div>

      {/* Avg PnL */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-3.5 w-3.5 text-accent-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Avg PnL
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-lg font-bold",
            tradeCount > 0 && totalPnl / tradeCount >= 0
              ? "text-status-ready"
              : "text-destructive"
          )}
        >
          {tradeCount > 0 ? formatPnl(totalPnl / tradeCount) : "—"}
        </p>
      </div>
    </div>
  );
}

// ─── PnL Chart ─────────────────────────────────────────────
function PnlChart({ data }: { data: { time: number; pnl: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
        Chart will appear after 2+ trades
      </div>
    );
  }

  const chartData = data.map((d) => ({
    time: formatTime(d.time),
    pnl: parseFloat(d.pnl.toFixed(4)),
  }));

  const isPositive = data[data.length - 1].pnl >= 0;

  return (
    <div className="h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "hsl(142, 70%, 45%)" : "hsl(0, 70%, 50%)"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "hsl(142, 70%, 45%)" : "hsl(0, 70%, 50%)"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "hsl(210, 15%, 55%)" }}
            stroke="hsl(220, 15%, 20%)"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(210, 15%, 55%)" }}
            stroke="hsl(220, 15%, 20%)"
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 15%, 20%)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke={isPositive ? "hsl(142, 70%, 45%)" : "hsl(0, 70%, 50%)"}
            fill="url(#pnlGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Trade Table ───────────────────────────────────────────
function TradeTable({
  trades,
  openTrades,
}: {
  trades: CompletedTrade[];
  openTrades: OpenTrade[];
}) {
  // Show most recent first
  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => b.exitTime - a.exitTime),
    [trades]
  );

  return (
    <div className="flex flex-col">
      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_80px_80px_80px_80px_60px_70px_60px] gap-2 px-3 py-2 text-xs text-muted-foreground border-b border-border font-medium">
        <span>Symbol</span>
        <span className="text-right">Entry</span>
        <span className="text-right">Exit</span>
        <span className="text-right">PnL</span>
        <span className="text-right">PnL %</span>
        <span className="text-right">Reason</span>
        <span className="text-right">Duration</span>
        <span className="text-center">Mode</span>
      </div>

      <ScrollArea className="max-h-[300px]">
        {/* Open trades */}
        {openTrades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-[1fr_80px_80px_80px_80px_60px_70px_60px] gap-2 px-3 py-1.5 text-xs border-b border-border/30 bg-status-starting/5"
          >
            <span className="font-mono font-medium text-foreground flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-status-starting animate-pulse" />
              {trade.symbol}
            </span>
            <span className="text-right font-mono text-foreground">
              {formatPrice(trade.entryPrice)}
            </span>
            <span className="text-right font-mono text-muted-foreground">—</span>
            <span className="text-right font-mono text-muted-foreground">—</span>
            <span className="text-right font-mono text-muted-foreground">—</span>
            <span className="text-right text-muted-foreground">open</span>
            <span className="text-right font-mono text-muted-foreground">
              {formatDuration(Date.now() - trade.entryTime)}
            </span>
            <span className="text-center">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  trade.strategyMode === "paper"
                    ? "border-status-unhealthy/50 text-status-unhealthy"
                    : "border-status-ready/50 text-status-ready"
                )}
              >
                {trade.strategyMode}
              </Badge>
            </span>
          </div>
        ))}

        {/* Completed trades */}
        {sortedTrades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-[1fr_80px_80px_80px_80px_60px_70px_60px] gap-2 px-3 py-1.5 text-xs border-b border-border/30 hover:bg-muted/20 transition-colors"
          >
            <span className="font-mono font-medium text-foreground">
              {trade.symbol}
            </span>
            <span className="text-right font-mono text-foreground">
              {formatPrice(trade.entryPrice)}
            </span>
            <span className="text-right font-mono text-foreground">
              {formatPrice(trade.exitPrice)}
            </span>
            <span
              className={cn(
                "text-right font-mono font-medium",
                trade.pnl >= 0 ? "text-status-ready" : "text-destructive"
              )}
            >
              {formatPnl(trade.pnl)}
            </span>
            <span
              className={cn(
                "text-right font-mono",
                trade.pnlPercent >= 0 ? "text-status-ready" : "text-destructive"
              )}
            >
              {trade.pnlPercent >= 0 ? "+" : ""}
              {trade.pnlPercent.toFixed(2)}%
            </span>
            <span className="text-right">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  trade.exitReason === "tp"
                    ? "border-status-ready/50 text-status-ready"
                    : trade.exitReason === "sl"
                      ? "border-destructive/50 text-destructive"
                      : "border-muted-foreground/50 text-muted-foreground"
                )}
              >
                {trade.exitReason}
              </Badge>
            </span>
            <span className="text-right font-mono text-muted-foreground">
              {formatDuration(trade.duration)}
            </span>
            <span className="text-center">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  trade.strategyMode === "paper"
                    ? "border-status-unhealthy/50 text-status-unhealthy"
                    : "border-status-ready/50 text-status-ready"
                )}
              >
                {trade.strategyMode}
              </Badge>
            </span>
          </div>
        ))}

        {sortedTrades.length === 0 && openTrades.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No trades yet — waiting for signals...
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Symbol Stats Row ──────────────────────────────────────
function SymbolStatsBar({ stats }: { stats: SymbolTradeStats[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((s) => (
        <div
          key={s.symbol}
          className="flex items-center gap-3 rounded-md border border-border bg-secondary/20 px-3 py-1.5 text-xs"
        >
          <span className="font-mono font-medium text-foreground">{s.symbol}</span>
          <span className="text-muted-foreground">{s.totalTrades} trades</span>
          <span
            className={cn(
              "font-mono font-medium",
              s.totalPnl >= 0 ? "text-status-ready" : "text-destructive"
            )}
          >
            {formatPnl(s.totalPnl)}
          </span>
          <span className="text-muted-foreground">{s.winRate.toFixed(0)}% WR</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main TradeSection Component ───────────────────────────
export function TradeSection({
  isVisible,
  sessionId,
  completedTrades,
  openTrades,
  totalPnl,
  tradeCount,
  winCount,
  lossCount,
  symbols,
  symbolStats,
  cumulativePnl,
  onClose,
}: TradeSectionProps) {
  const [activeTab, setActiveTab] = useState("all");

  if (!isVisible) return null;

  // Gather all open trades into a flat list
  const allOpenTrades: OpenTrade[] = [];
  for (const [, stack] of openTrades) {
    allOpenTrades.push(...stack);
  }

  // Filter trades by symbol
  const filteredCompleted =
    activeTab === "all"
      ? completedTrades
      : completedTrades.filter((t) => t.symbol === activeTab);

  const filteredOpen =
    activeTab === "all"
      ? allOpenTrades
      : allOpenTrades.filter((t) => t.symbol === activeTab);

  return (
    <Card className="card-interactive">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Trade Journal
            {sessionId && (
              <Badge variant="secondary" className="text-[10px] font-mono ml-2">
                {sessionId}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Widgets */}
        <SummaryWidgets
          totalPnl={totalPnl}
          tradeCount={tradeCount}
          winCount={winCount}
          lossCount={lossCount}
        />

        {/* PnL Chart */}
        <div className="rounded-lg border border-border bg-secondary/10 p-3">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Cumulative PnL
          </h4>
          <PnlChart data={cumulativePnl} />
        </div>

        {/* Per-symbol stats */}
        <SymbolStatsBar stats={symbolStats} />

        {/* Symbol tabs + Trade table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3 h-7">
              All
            </TabsTrigger>
            {symbols.map((sym) => (
              <TabsTrigger key={sym} value={sym} className="text-xs px-3 h-7 font-mono">
                {sym}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-2">
            <div className="rounded-lg border border-border overflow-hidden">
              <TradeTable trades={filteredCompleted} openTrades={filteredOpen} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
