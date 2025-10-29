"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKilnData } from '@/hooks/useKilnData';
import { TrendingUp, TrendingDown, Zap, Leaf, ShieldCheck, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// --- Simulated Baseline Data (Before AI) ---
const baselineMetrics = {
  energy: 145, // kWh
  co2: 95, // tCO2/TJ
  qualityVariance: 0.8, // %
  cost: 65, // $/ton
};

function ImpactKpiCard({ title, icon, unit, before, after, higherIsBetter = false }: { title: string, icon: React.ReactNode, unit: string, before: number, after: number, higherIsBetter?: boolean }) {
    const change = ((after - before) / before) * 100;
    const isImprovement = higherIsBetter ? change > 0 : change < 0;
    const isNeutral = change === 0;

    let changeColor = 'text-muted-foreground';
    if (!isNeutral) {
        changeColor = isImprovement ? 'text-green-400' : 'text-red-400';
    }

    const ChangeIcon = isNeutral ? TrendingDown : isImprovement ? (higherIsBetter ? TrendingUp : TrendingDown) : (higherIsBetter ? TrendingDown : TrendingUp);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{after.toFixed(1)}{unit}</div>
                <div className={`flex items-center text-xs ${changeColor}`}>
                    <ChangeIcon className="mr-1 h-4 w-4" />
                    <span>{change.toFixed(1)}% vs. Baseline ({before}{unit})</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ImpactTrackerSkeleton() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Performance: AI-Active vs. Baseline</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        </div>
    );
}

export default function ImpactTrackerPage() {
    const { kilnData, isLoading } = useKilnData();

    // Use the latest 'live' data as the "After AI" state
    const currentEnergy = kilnData?.energy[kilnData.energy.length - 1]?.value ?? baselineMetrics.energy;
    
    // Simulate other "After AI" metrics based on energy consumption for a dynamic effect
    const energyImprovementFactor = (baselineMetrics.energy - currentEnergy) / baselineMetrics.energy;
    const currentCo2 = baselineMetrics.co2 * (1 - energyImprovementFactor * 0.5); // CO2 improves half as much as energy
    const currentQualityVariance = baselineMetrics.qualityVariance * (1 - energyImprovementFactor * 0.8); // Quality improves most
    const currentCost = baselineMetrics.cost * (1 - energyImprovementFactor * 0.7); // Cost improves significantly

    const chartData = [
        { name: 'Energy', Before: baselineMetrics.energy, After: currentEnergy },
        { name: 'CO₂ Emissions', Before: baselineMetrics.co2, After: currentCo2 },
        { name: 'Quality Variance', Before: baselineMetrics.qualityVariance * 100, After: currentQualityVariance * 100 }, // Scale for viz
        { name: 'Operational Cost', Before: baselineMetrics.cost, After: currentCost },
    ];
    
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">AI Impact Tracker</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {isLoading ? (
                    <ImpactTrackerSkeleton />
                ) : (
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance: AI-Active vs. Baseline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Before" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="After" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <ImpactKpiCard
                                title="Energy Consumption"
                                icon={<Zap className="h-4 w-4 text-muted-foreground" />}
                                unit=" kWh"
                                before={baselineMetrics.energy}
                                after={currentEnergy}
                            />
                            <ImpactKpiCard
                                title="CO₂ Footprint"
                                icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
                                unit=" t/TJ"
                                before={baselineMetrics.co2}
                                after={currentCo2}
                            />
                            <ImpactKpiCard
                                title="Quality Variance"
                                icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
                                unit="%"
                                before={baselineMetrics.qualityVariance * 100}
                                after={currentQualityVariance * 100}
                            />
                            <ImpactKpiCard
                                title="Operational Cost"
                                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                                unit="/ton"
                                before={baselineMetrics.cost}
                                after={currentCost}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
