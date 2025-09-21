"use client";

import { useState } from 'react';
import { Bot, Sparkles, Thermometer, Wind, Zap } from 'lucide-react';
import { useKilnData } from '@/hooks/useKilnData';
import KpiCard from './KpiCard';
import MetricChart from './MetricChart';
import AlertsList from './AlertsList';
import AIAssistant from './AIAssistant';
import { Button } from '@/components/ui/button';

export default function KilnHeartbeatDashboard() {
  const { kilnData, alerts, simulateAnomaly } = useKilnData();
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const currentTemperature = kilnData.temperature[kilnData.temperature.length - 1]?.value ?? 0;
  const currentOxygen = kilnData.oxygen[kilnData.oxygen.length - 1]?.value ?? 0;
  const currentEnergy = kilnData.energy[kilnData.energy.length - 1]?.value ?? 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold tracking-tight">Kiln Heartbeat</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={simulateAnomaly}>
            <Sparkles />
            Simulate Anomaly
          </Button>
          <Button onClick={() => setAssistantOpen(true)}>
            <Bot />
            AI Assistant
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-3">
            <KpiCard
              title="Temperature"
              value={`${currentTemperature.toFixed(1)}°C`}
              icon={<Thermometer className="text-red-400" />}
            />
            <KpiCard
              title="O₂ Level"
              value={`${currentOxygen.toFixed(1)}%`}
              icon={<Wind className="text-blue-400" />}
            />
            <KpiCard
              title="Energy Use"
              value={`${currentEnergy.toFixed(1)} kWh`}
              icon={<Zap className="text-yellow-400" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <MetricChart data={kilnData.temperature} dataKey="value" title="Temperature" color="hsl(var(--chart-1))" />
            <MetricChart data={kilnData.oxygen} dataKey="value" title="Oxygen Level" color="hsl(var(--chart-2))" />
            <MetricChart data={kilnData.energy} dataKey="value" title="Energy Consumption" color="hsl(var(--chart-4))" />
          </div>

          <div>
            <AlertsList alerts={alerts} />
          </div>
        </div>
      </main>

      <AIAssistant 
        isOpen={isAssistantOpen} 
        onOpenChange={setAssistantOpen}
        currentMetrics={{
            temperature: currentTemperature,
            oxygenLevel: currentOxygen,
            energyConsumption: currentEnergy,
        }}
      />
    </div>
  );
}
