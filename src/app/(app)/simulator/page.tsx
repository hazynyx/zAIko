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
    // Modifier logic:
    // Marketing spend: +1 demand per $100
    const marketingMod = (simulatorParams.marketingSpend / 100);
    // Discount: +2 demand per 1%
    const discountMod = (simulatorParams.discountPercent * 2);
    // Weather: -1 demand per 1% negative impact
    const weatherMod = -(simulatorParams.weatherImpact);
    
    const totalModifier = marketingMod + discountMod + weatherMod;
    
    return {
      ...point,
      simulated: Math.max(0, point.predicted + totalModifier),
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
                onValueChange={(val) => updateSimulatorParam("marketingSpend", val[0])}
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
                onValueChange={(val) => updateSimulatorParam("discountPercent", val[0])}
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
                onValueChange={(val) => updateSimulatorParam("weatherImpact", val[0])}
              />
            </div>
          </div>
        </BentoCard>

        <BentoCard className="col-span-1 lg:col-span-2 flex flex-col h-[500px]" title="Simulated Demand Curve">
          <div className="flex-1 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={futureData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend verticalAlign="top" height={36}/>

                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  fill="none" 
                  name="Base ML Forecast"
                />
                
                <Area 
                  type="monotone" 
                  dataKey="simulated" 
                  stroke="hsl(var(--primary))" 
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
