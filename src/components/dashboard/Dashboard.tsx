"use client";

import { useState } from 'react';
import { Bot, Sparkles, Thermometer, Wind, Zap } from 'lucide-react';
import { useKilnData } from '@/hooks/useKilnData';
import KpiCard from './KpiCard';
import MetricChart from './MetricChart';
import AlertsList from './AlertsList';
import AIAssistant from './AIAssistant';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { KilnPulseLogo } from '@/components/icons/KilnPulseLogo';
import { LayoutDashboard, Fuel, Component, LayoutGrid, Wrench, BarChartHorizontal, ShieldCheck, BookUser, AreaChart } from 'lucide-react';
import Link from 'next/link';
import InsightTimeline from './InsightTimeline';
import { Skeleton } from '../ui/skeleton';


function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div>
          <Skeleton className="h-96" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-full min-h-[500px]" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { kilnData, alerts, simulateAnomaly, isLoading } = useKilnData();
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const currentTemperature = kilnData?.temperature[kilnData.temperature.length - 1]?.value ?? 0;
  const currentOxygen = kilnData?.oxygen[kilnData.oxygen.length - 1]?.value ?? 0;
  const currentEnergy = kilnData?.energy[kilnData.energy.length - 1]?.value ?? 0;

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <KilnPulseLogo className="size-8" />
            <span className="text-xl font-semibold">KilnPulse</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" isActive>
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Fuel Optimization">
                <Link href="/fuel-optimization">
                  <Fuel />
                  <span>Fuel Optimization</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Raw Material Prediction">
                <Link href="/raw-material-prediction">
                  <Component />
                  <span>Raw Materials</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Maintenance Predictor">
                <Link href="/maintenance-predictor">
                  <Wrench />
                  <span>Maintenance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Visual Summary">
                <Link href="/visual-summary">
                  <LayoutGrid />
                  <span>Visual Summary</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Safety Compliance">
                    <Link href="/safety-compliance">
                        <ShieldCheck />
                        <span>Safety</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Operator Logbook">
                    <Link href="/operator-logbook">
                        <BookUser />
                        <span>Logbook</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Energy Cost Analysis">
                    <Link href="/energy-cost-analysis">
                        <AreaChart />
                        <span>Energy Costs</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Impact Tracker">
                    <Link href="/impact-tracker">
                        <BarChartHorizontal />
                        <span>Impact Tracker</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
         <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b p-4">
            <h1 className="text-2xl font-bold tracking-tight">Kiln Heartbeat</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={simulateAnomaly} disabled={isLoading}>
                <Sparkles />
                Simulate Anomaly
              </Button>
              <Button onClick={() => setAssistantOpen(true)} disabled={isLoading}>
                <Bot />
                AI Assistant
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {isLoading || !kilnData ? (
              <DashboardSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
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
                  <div className="lg:col-span-1">
                      <InsightTimeline />
                  </div>
              </div>
            )}
          </main>

          {kilnData && 
            <AIAssistant 
              isOpen={isAssistantOpen} 
              onOpenChange={setAssistantOpen}
              currentMetrics={{
                  temperature: currentTemperature,
                  oxygenLevel: currentOxygen,
                  energyConsumption: currentEnergy,
              }}
            />
          }
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
