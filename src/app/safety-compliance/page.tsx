"use client";

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, ClipboardCheck, Loader2, BrainCircuit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSafetySummaryAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

type SafetySummary = {
    summary: string;
    recommendations: string;
}

export default function SafetyCompliancePage() {
    const [isPending, startTransition] = useTransition();
    const [summary, setSummary] = useState<SafetySummary | null>(null);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

    const fetchSummary = (timeframe: 'daily' | 'weekly' | 'monthly') => {
        setSummary(null);
        startTransition(async () => {
            const result = await getSafetySummaryAction({ timeframe });
            setSummary(result);
        });
    };

    useEffect(() => {
        fetchSummary(activeTab);
    }, [activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'daily' | 'weekly' | 'monthly');
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">Safety Compliance Tracker</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">98.7%</div>
                                <p className="text-xs text-muted-foreground">+0.2% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Reported Incidents</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground">in the last 30 days (all minor)</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Last Safety Drill</CardTitle>
                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12 days ago</div>
                                <p className="text-xs text-muted-foreground">Fire evacuation drill</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Powered Safety Summary</CardTitle>
                            <CardDescription>Automated analysis of safety logs and compliance data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={handleTabChange}>
                                <TabsList className="grid w-full grid-cols-3 md:w-auto">
                                    <TabsTrigger value="daily">Daily</TabsTrigger>
                                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                </TabsList>
                                <TabsContent value={activeTab}>
                                    {isPending ? (
                                        <div className="mt-4 space-y-4">
                                            <Skeleton className="h-8 w-3/4" />
                                            <Skeleton className="h-20 w-full" />
                                        </div>
                                    ) : summary ? (
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <h3 className="font-semibold">Summary</h3>
                                                <p className="text-sm text-muted-foreground">{summary.summary}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="size-4 text-primary" /> Recommendations</h3>
                                                <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{summary.recommendations}</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
