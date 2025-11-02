"use client";

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Lightbulb, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getEnergyCostInsightAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

const initialCostData = [
  { week: 'Week 1', Coal: 4000, Petcoke: 2400, Biomass: 1200 },
  { week: 'Week 2', Coal: 3000, Petcoke: 2900, Biomass: 1500 },
  { week: 'Week 3', Coal: 2000, Petcoke: 4800, Biomass: 1700 },
  { week: 'Week 4', Coal: 2780, Petcoke: 3908, Biomass: 2000 },
  { week: 'This Week', Coal: 1890, Petcoke: 5800, Biomass: 2100 },
];

type CostInsight = {
    insight: string;
    recommendation: string;
};

export default function EnergyCostAnalysisPage() {
    const [isPending, startTransition] = useTransition();
    const [insight, setInsight] = useState<CostInsight | null>(null);

    useEffect(() => {
        startTransition(async () => {
            const result = await getEnergyCostInsightAction({ costData: JSON.stringify(initialCostData) });
            setInsight(result);
        });
    }, []);
    
    const totalCost = initialCostData.reduce((acc, week) => acc + week.Coal + week.Petcoke + week.Biomass, 0);

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">Energy Cost Analysis</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Energy Cost</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">over the last 5 weeks</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Primary Cost Driver</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Petroleum Coke</div>
                                <p className="text-xs text-muted-foreground">Highest cost contribution this week</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Energy Source Diversity</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3 Sources</div>
                                <p className="text-xs text-muted-foreground">Coal, Petcoke, Biomass</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Weekly Cost Breakdown by Fuel Source</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={initialCostData}>
                                        <defs>
                                            <linearGradient id="colorCoal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorPetcoke" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="$" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                        <Legend />
                                        <Area type="monotone" dataKey="Coal" stroke="hsl(var(--chart-3))" fill="url(#colorCoal)" />
                                        <Area type="monotone" dataKey="Petcoke" stroke="hsl(var(--chart-5))" fill="url(#colorPetcoke)" />
                                        <Area type="monotone" dataKey="Biomass" stroke="hsl(var(--chart-2))" fill="url(#colorBiomass)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        
                        <Card className="lg:col-span-2">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> AI Cost Insight</CardTitle>
                                <CardDescription>Automated analysis of your energy spending.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isPending ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : insight ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold">Key Insight</h4>
                                            <p className="text-sm text-muted-foreground">{insight.insight}</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold">Recommendation</h4>
                                            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{insight.recommendation}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-10">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        <p className="mt-2">Generating analysis...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
