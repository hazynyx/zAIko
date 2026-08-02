"use client";

import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function SimulatorPage() {
  const [mounted, setMounted] = useState(false);
  const timeSeriesData = useStore(state => state.timeSeriesData);
  const simulatorParams = useStore(state => state.simulatorParams);
  const updateSimulatorParam = useStore(state => state.updateSimulatorParam);

  // Generate simulated data by applying modifiers to the base predicted data
  const middleIndex = Math.floor(timeSeriesData.length / 2);
  const futureData = timeSeriesData.slice(middleIndex, middleIndex + 30).map(point => {
    const dateObj = new Date(point.date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Weekend multiplier (people buy more groceries on weekends)
    const baseWeekendSpike = isWeekend ? 1.3 : 1.0;
    
    // Marketing creates a multiplier effect (diminishing returns using log)
    // e.g. 0 spend = 1.0, 5000 spend = ~1.37
    const marketingMultiplier = 1 + (Math.log10(1 + simulatorParams.marketingSpend) / 10);
    
    // Discount elasticity (highly elastic on weekends for groceries)
    // 0% = 1.0, 50% = 1.5 on weekdays, 2.0 on weekends
    const discountMultiplier = 1 + (simulatorParams.discountPercent / 100) * (isWeekend ? 2 : 1);
    
    // Weather negatively impacts footfall
    // 100% adverse weather = 66% drop in sales
    const weatherMultiplier = 1 - (simulatorParams.weatherImpact / 150); 
    
    const combinedMultiplier = baseWeekendSpike * marketingMultiplier * discountMultiplier * weatherMultiplier;
    
    return {
      ...point,
      simulated: Math.max(0, Math.round(point.predicted * combinedMultiplier)),
    };
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">What-If Simulator</h1>
        <p className="text-muted-foreground">Adjust parameters to simulate shifts in the demand forecast curve.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BentoCard className="col-span-1" title="Parameters" description="Tweak these to see real-time impact">
          <div className="space-y-8 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Marketing Spend</Label>
                <span className="text-sm text-muted-foreground">₹{simulatorParams.marketingSpend}</span>
              </div>
              <Slider 
                value={[simulatorParams.marketingSpend]} 
                min={0} 
                max={5000} 
                step={100}
                onValueChange={(val) => updateSimulatorParam("marketingSpend", Array.isArray(val) ? val[0] : val as any)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Discount Percentage</Label>
                <span className="text-sm text-muted-foreground">{simulatorParams.discountPercent}%</span>
              </div>
              <Slider 
                value={[simulatorParams.discountPercent]} 
                min={0} 
                max={50} 
                step={1}
                onValueChange={(val) => updateSimulatorParam("discountPercent", Array.isArray(val) ? val[0] : val as any)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Weather Impact (Adverse)</Label>
                <span className="text-sm text-muted-foreground">{simulatorParams.weatherImpact}%</span>
              </div>
              <Slider 
                value={[simulatorParams.weatherImpact]} 
                min={0} 
                max={100} 
                step={5}
                onValueChange={(val) => updateSimulatorParam("weatherImpact", Array.isArray(val) ? val[0] : val as any)}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard className="col-span-1 lg:col-span-2" title="Simulated Demand Curve">
          <div className="w-full h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={futureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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

                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="var(--muted-foreground)" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  fill="none" 
                  name="Base ML Forecast"
                />
                
                <Area 
                  type="monotone" 
                  dataKey="simulated" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSimulated)" 
                  name="Simulated Demand"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
