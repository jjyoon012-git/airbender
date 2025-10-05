import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoricalDataPoint } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getAqiLevel } from "@/lib/air-quality-utils";

interface HistoricalChartProps {
  data: HistoricalDataPoint[];
  title?: string;
}

export function HistoricalChart({ data, title }: HistoricalChartProps) {
  const { language, t } = useLanguage();

  const chartData = data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    }),
    aqi: point.aqi,
    fill: getChartColor(point.level)
  }));

  function getChartColor(level: string) {
    const colors: Record<string, string> = {
      excellent: "hsl(var(--chart-1))",
      moderate: "hsl(var(--chart-3))",
      unhealthy: "hsl(var(--chart-4))",
      hazardous: "hsl(var(--destructive))",
      critical: "hsl(var(--chart-5))"
    };
    return colors[level] || "hsl(var(--chart-2))";
  }

  return (
    <Card data-testid="card-historical-chart">
      <CardHeader>
        <CardTitle>
          {title || t("24-Hour Air Quality Trend", "24시간 대기질 추이")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickMargin={10}
                label={{ 
                  value: 'AQI', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--popover-border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="aqi" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#aqiGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
