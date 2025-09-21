"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, SlidersHorizontal, TestTube2, BrainCircuit } from 'lucide-react';
import { predictRawMaterialAction } from '@/lib/actions';
import type { RawMaterialPrediction } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    limestoneMoisture: z.number().min(0).max(20),
    claySilicaContent: z.number().min(20).max(80),
    ironOreContent: z.number().min(0).max(5),
    currentGrindingRate: z.number().min(100).max(500),
    currentKilnFeedRate: z.number().min(100).max(300),
});

type FormValues = z.infer<typeof formSchema>;

export default function RawMaterialPredictionPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<RawMaterialPrediction | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limestoneMoisture: 5.2,
            claySilicaContent: 65,
            ironOreContent: 2.5,
            currentGrindingRate: 350,
            currentKilnFeedRate: 220,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(null);
        startTransition(async () => {
            const response = await predictRawMaterialAction(values);
            setResult(response);
        });
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">Raw Material Variability Prediction</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Material & Process Inputs</CardTitle>
                            <CardDescription>Provide current data to predict variability.</CardDescription>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="limestoneMoisture" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Limestone Moisture (%)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="claySilicaContent" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Clay Silica Content (SiO₂ %)</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="ironOreContent" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Iron Ore Addition (%)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <Separator />
                                     <FormField control={form.control} name="currentGrindingRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Grinding Rate (t/h)</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="currentKilnFeedRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Kiln Feed Rate (t/h)</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                        </FormItem>
                                    )} />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                                        Predict & Recommend
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card className="lg:col-span-2 md:col-span-2">
                        <CardHeader>
                            <CardTitle>AI Prediction & Recommendation</CardTitle>
                            <CardDescription>Dynamically adjust your process based on AI insights.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isPending && (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-lg text-muted-foreground">Analyzing material data...</p>
                                </div>
                            )}
                            {!isPending && !result && (
                                <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
                                    <TestTube2 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">Ready for Prediction</h3>
                                    <p className="text-muted-foreground">Your results will appear here.</p>
                                </div>
                            )}
                            {result && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><TestTube2 className="size-5 text-primary" /> Predicted Raw Mix Quality</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <InfoCard title="Predicted Moisture" value={`${result.predictedMoisture.toFixed(2)}%`} />
                                            <InfoCard title="Lime Saturation (LSF)" value={result.predictedComposition.limeSaturation.toFixed(2)} />
                                            <InfoCard title="Silica Modulus (SM)" value={result.predictedComposition.silicaModulus.toFixed(2)} />
                                            <InfoCard title="Alumina Modulus (AM)" value={result.predictedComposition.aluminaModulus.toFixed(2)} />
                                        </div>
                                    </div>
                                    
                                     <div>
                                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><SlidersHorizontal className="size-5 text-primary" /> Recommended Process Adjustments</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <InfoCard title="Grinding Rate" value={`${result.recommendedGrindingRate.toFixed(1)} t/h`} change={result.recommendedGrindingRate - form.getValues('currentGrindingRate')} />
                                            <InfoCard title="Kiln Feed Rate" value={`${result.recommendedKilnFeedRate.toFixed(1)} t/h`} change={result.recommendedKilnFeedRate - form.getValues('currentKilnFeedRate')} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium flex items-center gap-2"><BrainCircuit className="size-5 text-primary" /> AI Reasoning</h3>
                                        <p className="text-sm text-muted-foreground mt-2 bg-secondary p-4 rounded-lg">{result.reasoning}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function InfoCard({ title, value, change }: { title: string, value: string, change?: number }) {
    const changeColor = change === 0 ? '' : change && change > 0 ? 'text-green-400' : 'text-red-400';
    const changePrefix = change === 0 ? '' : change && change > 0 ? '+' : '';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                     <p className={`text-xs ${changeColor}`}>
                        {changePrefix}{change.toFixed(1)} t/h from current
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
