"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Smile, Meh, Frown, Tags, MessageSquare } from 'lucide-react';
import { analyzeLogEntryAction } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type LogAnalysis = {
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
    summary: string;
}

export default function OperatorLogbookPage() {
    const [isPending, startTransition] = useTransition();
    const [logEntry, setLogEntry] = useState("Shift handover complete. Kiln temperature stable around 255°C. No major issues to report, but noted a slight increase in main gearbox vibration. Will continue to monitor.");
    const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);

    const handleSubmit = () => {
        if (!logEntry.trim()) return;
        setAnalysis(null);
        startTransition(async () => {
            const result = await analyzeLogEntryAction({ logEntry });
            setAnalysis(result);
        });
    };

    const SentimentIcon = ({ sentiment }: { sentiment: LogAnalysis['sentiment'] }) => {
        switch (sentiment) {
            case 'positive': return <Smile className="h-5 w-5 text-green-500" />;
            case 'negative': return <Frown className="h-5 w-5 text-red-500" />;
            default: return <Meh className="h-5 w-5 text-yellow-500" />;
        }
    };
    
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">AI-Enhanced Operator Logbook</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Log Entry</CardTitle>
                            <CardDescription>Record your shift notes, observations, and handover details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={logEntry}
                                onChange={(e) => setLogEntry(e.target.value)}
                                rows={12}
                                placeholder="Start typing your log entry..."
                                disabled={isPending}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSubmit} disabled={isPending || !logEntry.trim()} className="w-full">
                                {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                                Analyze Entry
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Log Analysis</CardTitle>
                            <CardDescription>AI-generated insights from your log entry.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isPending ? (
                                <div className="space-y-6">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : analysis ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <SentimentIcon sentiment={analysis.sentiment} />
                                        <div>
                                            <h4 className="font-semibold">Sentiment</h4>
                                            <p className="text-sm capitalize text-muted-foreground">{analysis.sentiment}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start gap-3">
                                        <MessageSquare className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-semibold">Summary</h4>
                                            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Tags className="h-5 w-5 text-primary mt-1" />
                                        <div>
                                            <h4 className="font-semibold">Keywords</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {analysis.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center">
                                    <h3 className="text-lg font-medium">Ready for Analysis</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Write a log entry and click "Analyze Entry" to see AI insights here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
