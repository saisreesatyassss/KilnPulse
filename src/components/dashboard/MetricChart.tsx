"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { DataPoint } from '@/lib/types';
import { useMemo } from 'react';

type MetricChartProps = {
  data: DataPoint[];
  dataKey: string;
  title: string;
  color: string;
};

export default function MetricChart({
  data,
  dataKey,
  title,
  color,
}: MetricChartProps) {
  const chartConfig = useMemo(() => ({
    [dataKey]: {
      label: title,
      color,
    },
  }), [dataKey, title, color]);

  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey={dataKey}
              type="monotone"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
