import { OrchestratorProvider } from "@/contexts/OrchestratorContext";
import { TopBar } from "@/components/TopBar";
import { SessionControl } from "@/components/SessionControl";
import { ServiceHealth } from "@/components/ServiceHealth";

export default function Dashboard() {
  return (
    <OrchestratorProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          <SessionControl />
          <ServiceHealth />
        </main>
      </div>
    </OrchestratorProvider>
  );
}
