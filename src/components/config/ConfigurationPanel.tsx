import { useOrchestratorContext } from "@/contexts/OrchestratorContext";
import { PlatformConfig } from "@/types/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import {
  SessionTab,
  EnvironmentTab,
  MarketTab,
  IndicatorsTab,
  StrategyTab,
  TimeMachineTab,
  ResearchTab,
  StorageTab,
  ObservabilityTab,
} from "./tabs";

export function ConfigurationPanel() {
  const {
    isConnected,
    config,
    frozenConfig,
    configUpdateResult,
    setLocalConfig,
    updateConfig,
    clearConfigUpdateResult,
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
    setLocalConfig({ ...config, [section]: value });
  };

  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Configuration
            </CardTitle>
            <CardDescription>
              Edit platform configuration. Changes are saved to disk when you click
              Save.
            </CardDescription>
          </div>
          <Button
            onClick={updateConfig}
            disabled={!isConnected}
            className="gap-2"
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
                  {configUpdateResult.reason || "The configuration was rejected by the backend."}
                </AlertDescription>
              </Alert>
            )}
          </div>
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="session" className="text-xs">
              Session
            </TabsTrigger>
            <TabsTrigger value="environment" className="text-xs">
              Environment
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs">
              Market
            </TabsTrigger>
            <TabsTrigger value="indicators" className="text-xs">
              Indicators
            </TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">
              Strategy
            </TabsTrigger>
            <TabsTrigger value="timemachine" className="text-xs">
              Time Machine
            </TabsTrigger>
            <TabsTrigger value="research" className="text-xs">
              Research
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-xs">
              Storage
            </TabsTrigger>
            <TabsTrigger value="observability" className="text-xs">
              Observability
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="session">
              <SessionTab
                config={config.session}
                onChange={(v) => updateSection("session", v)}
              />
            </TabsContent>

            <TabsContent value="environment">
              <EnvironmentTab
                config={config.environment}
                onChange={(v) => updateSection("environment", v)}
              />
            </TabsContent>

            <TabsContent value="market">
              <MarketTab
                config={config.market}
                onChange={(v) => updateSection("market", v)}
              />
            </TabsContent>

            <TabsContent value="indicators">
              <IndicatorsTab
                config={config.indicators}
                onChange={(v) => updateSection("indicators", v)}
              />
            </TabsContent>

            <TabsContent value="strategy">
              <StrategyTab
                config={config.strategy}
                onChange={(v) => updateSection("strategy", v)}
              />
            </TabsContent>

            <TabsContent value="timemachine">
              <TimeMachineTab
                config={config.timeMachine}
                onChange={(v) => updateSection("timeMachine", v)}
              />
            </TabsContent>

            <TabsContent value="research">
              <ResearchTab
                config={config.research}
                onChange={(v) => updateSection("research", v)}
              />
            </TabsContent>

            <TabsContent value="storage">
              <StorageTab
                config={config.storage}
                onChange={(v) => updateSection("storage", v)}
              />
            </TabsContent>

            <TabsContent value="observability">
              <ObservabilityTab
                config={config.observability}
                onChange={(v) => updateSection("observability", v)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
