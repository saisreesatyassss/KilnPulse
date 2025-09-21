"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { optimizeFuelMixAction } from '@/lib/actions';
import { Loader2, Sparkles, Droplets, Factory, DollarSign, BarChart2 } from 'lucide-react';
import type { FuelMix, OptimizationResult } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
    coal: z.number().min(0).max(100),
    petcoke: z.number().min(0).max(100),
    biomass: z.number().min(0).max(100),
    maxCost: z.number().min(0),
    minCalorificValue: z.number().min(0),
    maxAshContent: z.number().min(0).max(100),
}).refine(data => Math.round(data.coal + data.petcoke + data.biomass) === 100, {
    message: "The sum of fuel percentages must be 100.",
    path: ["coal"],
});

type FormValues = z.infer<typeof formSchema>;

export default function FuelOptimizationPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<OptimizationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            coal: 70,
            petcoke: 20,
            biomass: 10,
            maxCost: 50,
            minCalorificValue: 6000,
            maxAshContent: 15,
        },
    });
    
    const watchFuels = form.watch(['coal', 'petcoke', 'biomass']);

    const onSubmit = (values: FormValues) => {
        setResult(null);
        startTransition(async () => {
            const response = await optimizeFuelMixAction({
                currentMix: {
                    coal: values.coal,
                    petcoke: values.petcoke,
                    biomass: values.biomass,
                },
                constraints: {
                    maxCost: values.maxCost,
                    minCalorificValue: values.minCalorificValue,
                    maxAshContent: values.maxAshContent
                },
            });
            setResult(response);
        });
    };
    
    const handleSliderChange = (fuel: keyof Pick<FormValues, 'coal' | 'petcoke' | 'biomass'>) => (value: number[]) => {
        const newValue = value[0];
        const prevValues = form.getValues();
        const prevFuelValue = prevValues[fuel];
        const diff = newValue - prevFuelValue;

        const otherFuels = (['coal', 'petcoke', 'biomass'] as const).filter(f => f !== fuel);
        const totalOther = otherFuels.reduce((sum, f) => sum + prevValues[f], 0);

        let adjustments: Partial<Record<keyof FuelMix, number>> = { [fuel]: newValue };
        let remainingDiff = -diff;

        if (totalOther > 0) {
             otherFuels.forEach(f => {
                const proportion = prevValues[f] / totalOther;
                const adjustment = remainingDiff * proportion;
                adjustments[f] = prevValues[f] + adjustment;
            });
        }
        
        let total = Object.values(adjustments).reduce((sum, v) => sum + v, 0);

        if (Math.round(total) !== 100) {
            const roundingError = 100 - total;
            const fuelToAdjust = otherFuels.find(f => (adjustments[f] ?? 0) + roundingError >= 0) ?? fuel;
            adjustments[fuelToAdjust] = (adjustments[fuelToAdjust] ?? 0) + roundingError;
        }

        Object.entries(adjustments).forEach(([key, val]) => {
            let finalValue = Math.max(0, Math.min(100, val));
            form.setValue(key as keyof FormValues, parseFloat(finalValue.toFixed(1)));
        });

        // Final check to enforce 100% sum
        const finalValues = form.getValues();
        const finalTotal = finalValues.coal + finalValues.petcoke + finalValues.biomass;
        if(Math.round(finalTotal) !== 100) {
            const finalDiff = 100 - finalTotal;
            const lastFuelToAdjust = otherFuels.find(f => f !== fuel) ?? 'coal';
            form.setValue(lastFuelToAdjust, form.getValues(lastFuelToAdjust) + finalDiff);
        }
    };


    const chartData = [
        { name: 'Current Mix', ...form.getValues() },
        { name: 'Recommended Mix', ...(result?.recommendedMix || {}) },
    ];

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">Alternative Fuel Mix Optimization</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Fuel Mix Simulation</CardTitle>
                            <CardDescription>Define your current mix and constraints to find the optimal blend.</CardDescription>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-6">
                                    <div>
                                       <h3 className="text-lg font-medium mb-4">Current Fuel Mix (%)</h3>
                                       <div className="space-y-4">
                                            {(['coal', 'petcoke', 'biomass'] as const).map((fuel) => (
                                                 <FormField
                                                    key={fuel}
                                                    control={form.control}
                                                    name={fuel}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="capitalize">{fuel}</FormLabel>
                                                            <div className="flex items-center gap-4">
                                                                <Slider
                                                                    value={[field.value]}
                                                                    onValueChange={handleSliderChange(fuel)}
                                                                    max={100}
                                                                    step={1}
                                                                    className="w-full"
                                                                    disabled={isPending}
                                                                />
                                                                <span className="w-16 text-right">{field.value.toFixed(1)}%</span>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                            {form.formState.errors.coal && <p className="text-sm font-medium text-destructive">{form.formState.errors.coal.message}</p>}
                                       </div>
                                    </div>

                                    <div>
                                       <h3 className="text-lg font-medium mb-4">Optimization Constraints</h3>
                                       <div className="space-y-4">
                                         <FormField
                                            control={form.control}
                                            name="maxCost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Cost ($/ton)</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="minCalorificValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Min Calorific Value (kcal/kg)</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="maxAshContent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Ash Content (%)</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPending} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                       </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                                        Optimize Fuel Mix
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card className="lg:col-span-2 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Optimization Results</CardTitle>
                            <CardDescription>AI-powered recommendation for your fuel blend.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isPending && (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-lg text-muted-foreground">Simulating thousands of blends...</p>
                                </div>
                            )}
                            {!isPending && !result && (
                                <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
                                    <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">Ready to Optimize</h3>
                                    <p className="text-muted-foreground">Your results will appear here.</p>
                                </div>
                            )}
                            {result && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Mix Comparison</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis unit="%" />
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                                <Legend />
                                                <Bar dataKey="coal" stackId="a" fill="hsl(var(--chart-3))" name="Coal" />
                                                <Bar dataKey="petcoke" stackId="a" fill="hsl(var(--chart-5))" name="Petcoke" />
                                                <Bar dataKey="biomass" stackId="a" fill="hsl(var(--chart-2))" name="Biomass" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <Card>
                                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                                <Droplets className="size-6 text-blue-400" />
                                                <CardTitle className="text-base">Thermal Substitution</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{result.thermalSubstitutionRate.toFixed(1)}%</p>
                                                <p className="text-xs text-muted-foreground">Optimal heat replacement</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                                <Factory className="size-6 text-gray-400" />
                                                <CardTitle className="text-base">CO₂ Emissions</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{result.co2Emissions.toFixed(2)} tCO₂/TJ</p>
                                                <p className="text-xs text-muted-foreground">Reduced carbon footprint</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                                <DollarSign className="size-6 text-green-400" />
                                                <CardTitle className="text-base">Cost Savings</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">${result.costSavings.toFixed(2)} / ton</p>
                                                <p className="text-xs text-muted-foreground">vs. previous mix</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium">AI Reasoning</h3>
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

    