import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { PlatformConfig } from "@/types/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings2,
  LineChart,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  SessionTab,
  MarketTab,
  IndicatorsTab,
  StrategyTab,
  TimeMachineTab,
} from "./tabs";

const TABS = [
  { id: "session", label: "Session", icon: Settings2 },
  { id: "market", label: "Market", icon: LineChart },
  { id: "indicators", label: "Indicators", icon: BarChart3 },
  { id: "strategy", label: "Strategy", icon: TrendingUp },
  { id: "timemachine", label: "Time Machine", icon: Clock },
];

export function ConfigurationPanel() {
  const {
    isConnected,
    config,
    frozenConfig,
    configUpdateResult,
    error,
    setLocalConfig,
    updateConfig,
  } = useOrchestratorContext();

  if (!config) {
    return (
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Configuration
          </CardTitle>
          <CardDescription>
            Waiting for configuration data from orchestrator...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading configuration...
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateSection = <K extends keyof PlatformConfig>(
    section: K,
    value: PlatformConfig[K]
  ) => {
    // Update meta timestamp on any change
    const updatedConfig = {
      ...config,
      [section]: value,
      meta: {
        ...config.meta,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: "ui",
      },
    };
    setLocalConfig(updatedConfig);
  };

  return (
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Configuration
            </CardTitle>
            <CardDescription>
              Platform configuration. Changes are saved when you click Save.
            </CardDescription>
          </div>
          <Button
            onClick={updateConfig}
            disabled={!isConnected}
            className="gap-2 shrink-0"
          >
            <Save className="h-4 w-4" />
            Save Config
          </Button>
        </div>

        {/* Config Update Result Banner */}
        {configUpdateResult && (
          <div className="mt-4">
            {configUpdateResult.status === "Accepted" && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">
                  Configuration Saved
                </AlertTitle>
                <AlertDescription className="text-green-500/80">
                  Changes have been applied successfully.
                </AlertDescription>
              </Alert>
            )}
            {configUpdateResult.status === "RequiresRestart" && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">
                  Restart Required
                </AlertTitle>
                <AlertDescription className="text-yellow-500/80">
                  Some changes require a session restart to take effect.
                  {configUpdateResult.affectedPaths.length > 0 && (
                    <span className="block mt-1 font-mono text-xs">
                      Affected: {configUpdateResult.affectedPaths.join(", ")}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {configUpdateResult.status === "Rejected" && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">
                  Configuration Rejected
                </AlertTitle>
                <AlertDescription className="text-destructive/80">
                  {configUpdateResult.reason ||
                    "The configuration was rejected by the backend."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Backend Error */}
        {error && !configUpdateResult && (
          <Alert className="mt-4 border-destructive/50 bg-destructive/10">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">Error</AlertTitle>
            <AlertDescription className="text-destructive/80">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Frozen Config Warning */}
        {frozenConfig && (
          <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-500">Session Running</AlertTitle>
            <AlertDescription className="text-blue-500/80">
              A session is currently running. Editing is allowed, but some
              changes may only apply after the session ends.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-muted/50 p-1 mb-6">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4 hidden sm:block" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="session" className="mt-0">
            <SessionTab
              meta={config.meta}
              session={config.session}
              storage={config.storage}
              onMetaChange={(v) => updateSection("meta", v)}
              onSessionChange={(v) => updateSection("session", v)}
              onStorageChange={(v) => updateSection("storage", v)}
            />
          </TabsContent>

          <TabsContent value="market" className="mt-0">
            <MarketTab
              config={config.market}
              onChange={(v) => updateSection("market", v)}
            />
          </TabsContent>

          <TabsContent value="indicators" className="mt-0">
            <IndicatorsTab
              config={config.indicators}
              onChange={(v) => updateSection("indicators", v)}
            />
          </TabsContent>

          <TabsContent value="strategy" className="mt-0">
            <StrategyTab
              config={config.strategy}
              onChange={(v) => updateSection("strategy", v)}
            />
          </TabsContent>

          <TabsContent value="timemachine" className="mt-0">
            <TimeMachineTab
              config={config.timeMachine}
              onChange={(v) => updateSection("timeMachine", v)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
