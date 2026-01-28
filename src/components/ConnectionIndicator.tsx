import { cn } from "@/lib/utils";

interface ConnectionIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionIndicator({
  isConnected,
  className,
}: ConnectionIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "status-dot-lg transition-colors duration-300",
          isConnected
            ? "bg-status-connected glow-green"
            : "bg-status-disconnected glow-red"
        )}
      />
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-300",
          isConnected ? "text-status-connected" : "text-status-disconnected"
        )}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}
