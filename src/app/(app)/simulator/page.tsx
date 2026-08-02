"use client";

import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function SimulatorPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const timeSeriesData = useStore(state => state.timeSeriesData);
  const simulatorParams = useStore(state => state.simulatorParams);
  const updateSimulatorParam = useStore(state => state.updateSimulatorParam);

  const middleIndex = Math.floor(timeSeriesData.length / 2);
  const futureData = timeSeriesData.slice(middleIndex, middleIndex + timeRange).map((point, index) => {
    const dateObj = new Date(point.date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // 1. Base Weekend Spike
    const baseWeekendSpike = isWeekend ? 1.3 : 1.0;
    
    // 2. Marketing (Decay Effect)
    // Marketing creates a hype spike that decays over 14 days
    const marketingPeak = Math.log10(1 + simulatorParams.marketingSpend) / 8; 
    const marketingDecay = Math.max(0, 1 - (index / 14)); // Decays to 0 by day 14
    const marketingMultiplier = 1 + (marketingPeak * marketingDecay);
    
    // 3. Discount (Demand Pull-Forward Effect)
    // Massive spike initially, but drops below 1.0 later because people hoarded items
    const discountStrength = simulatorParams.discountPercent / 100;
    let discountMultiplier = 1.0;
    if (index < 5) {
      // First 5 days: Hoarding phase (spike)
      discountMultiplier = 1 + (discountStrength * (isWeekend ? 2.5 : 1.5));
    } else if (index >= 5 && index < 15) {
      // Day 5 to 15: Demand drought (people already have stock)
      discountMultiplier = Math.max(0.4, 1 - (discountStrength * 0.8));
    }
    
    // 4. Weather Impact (Short-term storm effect)
    // Adverse weather hits hard on days 1-3, then recovers with panic buying
    let weatherMultiplier = 1.0;
    if (index < 3) {
      weatherMultiplier = Math.max(0.1, 1 - (simulatorParams.weatherImpact / 100));
    } else if (index === 3 || index === 4) {
      // Post-storm panic buying to restock
      weatherMultiplier = 1 + (simulatorParams.weatherImpact / 200); 
    }
    
    // 5. Deterministic Noise for realism (+/- 5%) so it doesn't jitter on every render
    const pseudoRandom = Math.sin(index * 1234.5678) * 0.05;
    const noise = 1 + pseudoRandom;
    
    const combinedMultiplier = baseWeekendSpike * marketingMultiplier * discountMultiplier * weatherMultiplier * noise;
    
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">What-If Simulator</h1>
          <p className="text-muted-foreground">Adjust parameters to simulate shifts in the demand forecast curve.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground">Forecast Range:</Label>
          <select 
            className="flex h-9 w-32 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value, 10))}
          >
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>
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
