'use client';

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Leaf, ShieldCheck, DollarSign, BrainCircuit, ArrowDown, ArrowUp, Minus, ThumbsUp, ThumbsDown } from 'lucide-react';
import { simulateActionImpactAction, logActionFeedbackAction } from '@/lib/actions';
import type { ActionSimulationResult, KilnMetrics } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

type ActionSimulatorDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  action: string;
  currentMetrics: KilnMetrics;
};

const KpiChangeCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: number, unit: string }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    const colorClass = isNeutral ? 'text-muted-foreground' : isPositive ? 'text-red-400' : 'text-green-400';
    const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

    return (
        <Card className="text-center">
            <CardHeader className="p-4">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">{icon}</div>
                <CardTitle className="text-sm font-medium pt-2">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className={`text-2xl font-bold ${colorClass} flex items-center justify-center gap-1`}>
                    <Icon className="size-5" />
                    {Math.abs(value).toFixed(1)}{unit}
                </p>
            </CardContent>
        </Card>
    );
};

export default function ActionSimulatorDialog({ isOpen, onOpenChange, action, currentMetrics }: ActionSimulatorDialogProps) {
    const { toast } = useToast();
    const [isSimulating, startSimulationTransition] = useTransition();
    const [isLoggingFeedback, startLoggingFeedbackTransition] = useTransition();
    const [result, setResult] = useState<ActionSimulationResult | null>(null);

    useEffect(() => {
        if (isOpen) {
            setResult(null); // Reset on open
            startSimulationTransition(async () => {
                const response = await simulateActionImpactAction({
                    action,
                    currentMetrics,
                });
                setResult(response);
            });
        }
    }, [isOpen, action, currentMetrics]);
    
    const handleFeedback = (feedback: 'applied' | 'rejected') => {
        if (!result) return;
        
        startLoggingFeedbackTransition(async () => {
            await logActionFeedbackAction({
                action,
                feedback,
                simulationResult: result,
            });

            toast({
                title: `Action ${feedback === 'applied' ? 'Applied' : 'Rejected'}`,
                description: `Your feedback for "${action}" has been logged.`,
            });
            onOpenChange(false);
        });
    };

    const isPending = isSimulating || isLoggingFeedback;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Autonomous Decision Simulator</DialogTitle>
                    <DialogDescription>
                        Simulating impact for action: <span className="font-semibold text-primary">"{action}"</span>
                    </DialogDescription>
                </DialogHeader>
                
                {isSimulating && !result && (
                     <div className="space-y-4 py-8">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="animate-spin" />
                            <span>Running simulation...</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                        </div>
                        <Skeleton className="h-40" />
                    </div>
                )}

                {result && (
                    <div className="space-y-6 py-4">
                        <div>
                            <h3 className="text-lg font-medium mb-4 text-center">Projected Impact</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                               <KpiChangeCard icon={<Zap className="text-yellow-400"/>} title="Energy Use" value={result.projectedEffects.energyChange} unit="%" />
                               <KpiChangeCard icon={<Leaf className="text-green-400"/>} title="CO₂ Emissions" value={result.projectedEffects.co2Change} unit="%" />
                               <KpiChangeCard icon={<DollarSign className="text-green-500"/>} title="Op. Cost" value={result.projectedEffects.costChange} unit="%" />
                               <Card className="text-center">
                                    <CardHeader className="p-4">
                                        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted"><ShieldCheck className="text-blue-400"/></div>
                                        <CardTitle className="text-sm font-medium pt-2">Clinker Quality</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-lg font-semibold text-muted-foreground">{result.projectedEffects.qualityImpact}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><BrainCircuit className="size-5 text-primary" /> AI Reasoning</h3>
                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">{result.reasoning}</p>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
                    <div className='flex gap-2'>
                        <Button variant="destructive" onClick={() => handleFeedback('rejected')} disabled={isPending || !result}>
                            {isLoggingFeedback ? <Loader2 className="animate-spin" /> : <ThumbsDown />}
                            Reject
                        </Button>
                        <Button variant="default" onClick={() => handleFeedback('applied')} disabled={isPending || !result}>
                            {isLoggingFeedback ? <Loader2 className="animate-spin" /> : <ThumbsUp />}
                            Apply & Log
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
