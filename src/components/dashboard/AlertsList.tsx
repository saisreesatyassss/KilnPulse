import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert as AlertUI, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import type { Alert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '../ui/progress';

type AlertsListProps = {
  alerts: Alert[];
};

export default function AlertsList({ alerts }: AlertsListProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle />
          Predictive Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {alerts.map((alert) => (
              <AccordionItem value={alert.id} key={alert.id}>
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-3 text-left">
                       <AlertTriangle className="size-5 text-destructive" />
                       <div>
                         <span className="font-semibold">{alert.metric} Anomaly</span>
                         <p className="text-xs text-muted-foreground">{alert.ruleDescription}</p>
                       </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2">
                  <AlertUI variant="destructive" className="bg-destructive/10">
                    <Info className="h-4 w-4" />
                    <AlertTitle>AI Explanation</AlertTitle>
                    <AlertDescription>
                        <p className="mb-4">{alert.explanation}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">Confidence:</span>
                            <Progress value={alert.confidenceScore * 100} className="w-32 h-2" />
                            <span>{(alert.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                    </AlertDescription>
                  </AlertUI>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center">
            <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">All Systems Normal</Badge>
            <p className="mt-2 text-sm text-muted-foreground">No active alerts.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
