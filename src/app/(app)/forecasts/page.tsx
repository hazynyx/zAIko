"use client";

import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ForecastsPage() {
  const [mounted, setMounted] = useState(false);
  const timeSeriesData = useStore(state => state.timeSeriesData);
  const [range, setRange] = useState(30);

  // Filter data based on range (from today)
  // Assuming the middle of mock data is 'today' for demo purposes
  const middleIndex = Math.floor(timeSeriesData.length / 2);
  const displayData = timeSeriesData.slice(middleIndex - range, middleIndex + range);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand Forecasts</h1>
          <p className="text-muted-foreground">AI-powered predictions with confidence intervals.</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <Button 
            variant={range === 15 ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setRange(15)}
          >
            30 Days
          </Button>
          <Button 
            variant={range === 30 ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setRange(30)}
          >
            60 Days
          </Button>
        </div>
      </div>

      <BentoCard className="h-[500px]">
        <div className="w-full h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }}
                labelFormatter={(value) => value ? new Date(value as string | number).toLocaleDateString() : ''}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {/* Confidence Interval (Upper - Lower bound difference mapped to an area) */}
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                stroke="none" 
                fill="url(#colorConfidence)" 
                name="Confidence Interval (Upper)"
              />
              <Area 
                type="monotone" 
                dataKey="lowerBound" 
                stroke="none" 
                fill="var(--background)" 
                name="Confidence Interval (Lower)"
                // This area effectively "masks" the bottom part of the confidence interval
              />

              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="var(--primary)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
                name="Predicted Demand"
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="var(--foreground)" 
                strokeWidth={2}
                fill="none" 
                name="Historical Actuals"
                dot={{ r: 3, fill: "var(--foreground)" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </BentoCard>
    </div>
  );
}
