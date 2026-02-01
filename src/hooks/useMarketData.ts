import { useCallback, useEffect, useRef, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import {
  MarketDataState,
  MarketUiUpdate,
  OrderBook,
  Trade,
  Kline,
  MAX_TRADES_DISPLAY,
  MAX_KLINES_DISPLAY,
} from "@/types/market";

const HUB_URL = "http://localhost:5114/hub/orchestrator";

const initialState: MarketDataState = {
  symbol: "",
  orderBook: null,
  recentTrades: [],
  primaryKlines: [],
  secondaryKlines: [],
  currentPrimaryKline: null,
  currentSecondaryKline: null,
  lastUpdate: null,
};

interface UseMarketDataOptions {
  sessionId: string;
  symbol: string;
  primaryInterval: string;
  secondaryInterval: string;
}

export function useMarketData({
  sessionId,
  symbol,
  primaryInterval,
  secondaryInterval,
}: UseMarketDataOptions) {
  const [state, setState] = useState<MarketDataState>({
    ...initialState,
    symbol,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const isSubscribedRef = useRef(false);

  // Handle MarketUiUpdate event
  const handleMarketUiUpdate = useCallback(
    (update: MarketUiUpdate) => {
      console.log(`[MarketData] Received update:`, {
        type: update.type,
        symbol: update.symbol,
        expectedSymbol: symbol,
        payloadPreview: update.payload.substring(0, 100),
      });

      if (update.symbol !== symbol) {
        console.log(`[MarketData] Ignoring update for different symbol: ${update.symbol} !== ${symbol}`);
        return;
      }

      try {
        const payload = JSON.parse(update.payload);
        const now = new Date().toISOString();

        console.log(`[MarketData] Parsed ${update.type} payload:`, payload);

        setState((prev) => {
          switch (update.type) {
            case "orderbook":
              return {
                ...prev,
                orderBook: payload as OrderBook,
                lastUpdate: now,
              };

            case "trade":
              const newTrade = payload as Trade;
              return {
                ...prev,
                recentTrades: [newTrade, ...prev.recentTrades].slice(
                  0,
                  MAX_TRADES_DISPLAY
                ),
                lastUpdate: now,
              };

            case "kline":
              const kline = payload as Kline;
              console.log(`[MarketData] Kline (closed) received:`, {
                interval: kline.Interval,
                primaryInterval,
                secondaryInterval,
                isPrimary: kline.Interval === primaryInterval,
                isSecondary: kline.Interval === secondaryInterval,
                openTime: kline.OpenTime,
              });
              
              if (kline.Interval === primaryInterval) {
                // Add to primary klines, keep limited
                const existingIdx = prev.primaryKlines.findIndex(
                  (k) => k.OpenTime === kline.OpenTime
                );
                const updatedPrimary =
                  existingIdx >= 0
                    ? prev.primaryKlines.map((k, i) =>
                        i === existingIdx ? kline : k
                      )
                    : [...prev.primaryKlines, kline].slice(-MAX_KLINES_DISPLAY);
                console.log(`[MarketData] Updated primaryKlines: ${updatedPrimary.length} candles`);
                return {
                  ...prev,
                  primaryKlines: updatedPrimary,
                  lastUpdate: now,
                };
              } else if (kline.Interval === secondaryInterval) {
                const existingIdx = prev.secondaryKlines.findIndex(
                  (k) => k.OpenTime === kline.OpenTime
                );
                const updatedSecondary =
                  existingIdx >= 0
                    ? prev.secondaryKlines.map((k, i) =>
                        i === existingIdx ? kline : k
                      )
                    : [...prev.secondaryKlines, kline].slice(
                        -MAX_KLINES_DISPLAY
                      );
                console.log(`[MarketData] Updated secondaryKlines: ${updatedSecondary.length} candles`);
                return {
                  ...prev,
                  secondaryKlines: updatedSecondary,
                  lastUpdate: now,
                };
              }
              console.log(`[MarketData] Kline interval ${kline.Interval} doesn't match primary (${primaryInterval}) or secondary (${secondaryInterval})`);
              return prev;

            case "kline_current":
              const currentKline = payload as Kline;
              console.log(`[MarketData] Kline_current received:`, {
                interval: currentKline.Interval,
                primaryInterval,
                secondaryInterval,
                isPrimary: currentKline.Interval === primaryInterval,
                isSecondary: currentKline.Interval === secondaryInterval,
                openTime: currentKline.OpenTime,
                close: currentKline.Close,
              });
              
              if (currentKline.Interval === primaryInterval) {
                console.log(`[MarketData] Setting currentPrimaryKline`);
                return {
                  ...prev,
                  currentPrimaryKline: currentKline,
                  lastUpdate: now,
                };
              } else if (currentKline.Interval === secondaryInterval) {
                console.log(`[MarketData] Setting currentSecondaryKline`);
                return {
                  ...prev,
                  currentSecondaryKline: currentKline,
                  lastUpdate: now,
                };
              }
              console.log(`[MarketData] Current kline interval ${currentKline.Interval} doesn't match primary or secondary`);
              return prev;

            default:
              console.log(`[MarketData] Unknown update type: ${update.type}`);
              return prev;
          }
        });
      } catch (err) {
        console.error("[MarketData] Failed to parse update", err, update);
      }
    },
    [symbol, primaryInterval, secondaryInterval]
  );

  // Subscribe to symbol
  const subscribe = useCallback(async (connection: HubConnection) => {
    if (isSubscribedRef.current) return;

    try {
      await connection.invoke("SubscribeSymbol", sessionId, symbol);
      isSubscribedRef.current = true;
      console.log(`[MarketData] Subscribed to ${symbol}`);
    } catch (err) {
      console.error("[MarketData] Subscribe failed", err);
      setError(err instanceof Error ? err.message : "Subscribe failed");
    }
  }, [sessionId, symbol]);

  // Unsubscribe from symbol
  const unsubscribe = useCallback(async (connection: HubConnection) => {
    if (!isSubscribedRef.current) return;

    try {
      await connection.invoke("UnsubscribeSymbol", sessionId, symbol);
      isSubscribedRef.current = false;
      console.log(`[MarketData] Unsubscribed from ${symbol}`);
    } catch (err) {
      console.error("[MarketData] Unsubscribe failed", err);
    }
  }, [sessionId, symbol]);

  // Initialize connection
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delay = Math.min(
            Math.pow(2, retryContext.previousRetryCount) * 1000,
            30000
          );
          return delay;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Register event handler
    connection.on("MarketUiUpdate", handleMarketUiUpdate);

    // Connection lifecycle
    connection.onclose(() => {
      console.log("[MarketData] Connection closed");
      setIsConnected(false);
      isSubscribedRef.current = false;
    });

    connection.onreconnecting(() => {
      console.log("[MarketData] Reconnecting...");
      setIsConnected(false);
      isSubscribedRef.current = false;
    });

    connection.onreconnected(async () => {
      console.log("[MarketData] Reconnected");
      setIsConnected(true);
      await subscribe(connection);
    });

    connectionRef.current = connection;

    // Start connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log("[MarketData] Connected");
        setIsConnected(true);
        await subscribe(connection);
      } catch (err) {
        console.error("[MarketData] Connection failed", err);
        setError(err instanceof Error ? err.message : "Connection failed");
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup - unsubscribe and stop
    return () => {
      const cleanup = async () => {
        if (
          connection.state === HubConnectionState.Connected &&
          isSubscribedRef.current
        ) {
          await unsubscribe(connection);
        }
        await connection.stop();
      };
      cleanup();
    };
  }, [handleMarketUiUpdate, subscribe, unsubscribe]);

  return {
    ...state,
    isConnected,
    error,
  };
}
