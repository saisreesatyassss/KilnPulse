"use client";

import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { InsightEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { BrainCircuit, AlertTriangle, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

function TimelineItem({ event }: { event: InsightEvent }) {
    const Icon = useMemo(() => {
        switch (event.type) {
            case 'alert': return AlertTriangle;
            case 'suggestion': return Lightbulb;
            case 'simulation': return BrainCircuit;
            default: return BrainCircuit;
        }
    }, [event.type]);

    const iconColor = useMemo(() => {
        switch (event.type) {
            case 'alert': return 'text-destructive';
            case 'suggestion': return 'text-yellow-400';
            case 'simulation': return 'text-blue-400';
            default: return 'text-muted-foreground';
        }
    }, [event.type]);
    
    return (
        <li className="mb-6 ms-6">            
            <span className={`absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -start-3 ring-4 ring-background ${iconColor}`}>
                <Icon className="w-4 h-4" />
            </span>
            <div className="p-3 bg-secondary rounded-lg border">
                <div className="items-center justify-between sm:flex">
                    <time className="mb-1 text-xs font-normal text-muted-foreground sm:order-last sm:mb-0">
                         {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </time>
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                </div>
                <p className="text-xs font-normal text-muted-foreground">{event.description}</p>
            </div>
        </li>
    );
}

function TimelineSkeleton() {
    return (
        <ol className="relative border-s border-border">
            {[...Array(5)].map((_, i) => (
                 <li key={i} className="mb-6 ms-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-muted rounded-full -start-3 ring-4 ring-background">
                        <Skeleton className="w-4 h-4 rounded-full" />
                    </span>
                    <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </li>
            ))}
        </ol>
    )
}

export default function InsightTimeline() {
  const { firestore, isUserLoading } = useFirebase();
  
  const eventsQuery = useMemoFirebase(() => {
    // Wait for firestore to be available and for user auth state to be resolved.
    if (!firestore || isUserLoading) return null;
    return query(
        collection(firestore, "insightEvents"), 
        orderBy("timestamp", "desc"), 
        limit(15)
    );
  }, [firestore, isUserLoading]);
  
  const { data: events, isLoading } = useCollection<InsightEvent>(eventsQuery);

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit />
          AI Insight Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(isLoading || isUserLoading) && <TimelineSkeleton />}
        {!isLoading && !isUserLoading && events && events.length > 0 && (
            <ol className="relative border-s border-border max-h-[80vh] overflow-y-auto pr-2">                  
                {events.map(event => (
                    <TimelineItem key={event.id} event={event} />
                ))}
            </ol>
        )}
        {!isLoading && !isUserLoading && (!events || events.length === 0) && (
            <div className="text-center text-muted-foreground py-10">
                <p>No AI insights logged yet.</p>
                <p className="text-xs">Trigger an anomaly or use the AI assistant to see events here.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
