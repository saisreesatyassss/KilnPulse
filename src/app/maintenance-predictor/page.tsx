"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Wrench, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { predictMaintenanceAction, scheduleMaintenanceAction } from '@/lib/actions';
import type { MaintenancePrediction } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  component: z.enum(['Kiln Fan Motor', 'Main Gearbox', 'Conveyor Belt', 'Bearing Assembly']),
  vibration: z.number().min(0),
  temperature: z.number(),
  load: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function MaintenancePredictorPage() {
    const { toast } = useToast();
    const [isPredicting, startPredictionTransition] = useTransition();
    const [isScheduling, startSchedulingTransition] = useTransition();
    const [result, setResult] = useState<MaintenancePrediction | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            component: 'Kiln Fan Motor',
            vibration: 4.2,
            temperature: 85,
            load: 90,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(null);
        startPredictionTransition(async () => {
            const response = await predictMaintenanceAction(values);
            setResult(response);
        });
    };

    const handleScheduleMaintenance = () => {
        if (!result) return;

        startSchedulingTransition(async () => {
            const response = await scheduleMaintenanceAction({
                component: result.component,
                reason: result.reason,
                predictedFailureDate: result.predictedFailureDate,
            });
            
            if (response.success) {
                toast({
                    title: "✅ Maintenance Scheduled",
                    description: `${result.component} maintenance has been added to the schedule.`,
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "❌ Scheduling Failed",
                    description: response.message,
                });
            }
        });
    };
    
    const isFailurePredicted = result && !result.prediction.includes("No failure");

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">AI-Driven Maintenance Predictor</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Equipment Sensor Inputs</CardTitle>
                            <CardDescription>Provide current sensor data to predict failures.</CardDescription>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="component" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Equipment Component</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPredicting}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a component" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Kiln Fan Motor">Kiln Fan Motor</SelectItem>
                                                    <SelectItem value="Main Gearbox">Main Gearbox</SelectItem>
                                                    <SelectItem value="Conveyor Belt">Conveyor Belt</SelectItem>
                                                    <SelectItem value="Bearing Assembly">Bearing Assembly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="vibration" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vibration (mm/s)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPredicting} /></FormControl>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="temperature" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Temperature (°C)</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPredicting} /></FormControl>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="load" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Load (%)</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isPredicting} /></FormControl>
                                        </FormItem>
                                    )} />
                                </CardContent>
                                <CardContent>
                                    <Button type="submit" className="w-full" disabled={isPredicting}>
                                        {isPredicting ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                                        Predict Failure
                                    </Button>
                                </CardContent>
                            </form>
                        </Form>
                    </Card>

                    <Card className="lg:col-span-2 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Maintenance Prediction</CardTitle>
                            <CardDescription>AI analysis of potential equipment failures.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isPredicting && (
                                <div className="flex flex-col items-center justify-center h-80">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                    <p className="text-lg text-muted-foreground">Analyzing sensor data trends...</p>
                                </div>
                            )}
                            {!isPredicting && !result && (
                                <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed rounded-lg">
                                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">Ready to Predict</h3>
                                    <p className="text-muted-foreground">Submit sensor data to get a prediction.</p>
                                </div>
                            )}
                            {result && (
                                <div className="space-y-6">
                                   <Card className={isFailurePredicted ? "bg-destructive/10 border-destructive" : "bg-green-500/10 border-green-500"}>
                                       <CardHeader>
                                            <CardTitle className="flex items-center gap-3">
                                                {isFailurePredicted ? <AlertTriangle className="size-6 text-destructive" /> : <CheckCircle className="size-6 text-green-500" />}
                                                <span>{result.component}</span>
                                            </CardTitle>
                                       </CardHeader>
                                       <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground">Prediction</h4>
                                                <p className="text-xl font-bold">{result.prediction}</p>
                                            </div>
                                             <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground">Reason</h4>
                                                <p className="text-muted-foreground">{result.reason}</p>
                                            </div>

                                            {isFailurePredicted && (
                                                <div className="flex items-center gap-6 pt-4">
                                                    <div className='flex items-center gap-2'>
                                                        <Calendar className="size-5 text-muted-foreground" />
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-muted-foreground">Predicted Failure Date</h4>
                                                            <p className="font-semibold">{format(new Date(result.predictedFailureDate), 'MMMM d, yyyy')}</p>
                                                        </div>
                                                    </div>
                                                    <Button onClick={handleScheduleMaintenance} disabled={isScheduling}>
                                                        {isScheduling ? <Loader2 className="animate-spin" /> : <Clock className="mr-2" />}
                                                        Schedule Maintenance
                                                    </Button>
                                                </div>
                                            )}
                                       </CardContent>
                                   </Card>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
