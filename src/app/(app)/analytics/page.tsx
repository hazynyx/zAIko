"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const categoryData = [
    { subject: 'Groceries', A: 140, B: 110, fullMark: 150 },
    { subject: 'Snacks', A: 120, B: 130, fullMark: 150 },
    { subject: 'Dairy', A: 145, B: 130, fullMark: 150 },
    { subject: 'Household', A: 99, B: 100, fullMark: 150 },
    { subject: 'Beverages', A: 85, B: 90, fullMark: 150 },
    { subject: 'Personal Care', A: 65, B: 85, fullMark: 150 },
  ];

  const seasonalityData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
    { name: 'Aug', sales: 4000 },
    { name: 'Sep', sales: 3000 },
    { name: 'Oct', sales: 2000 },
    { name: 'Nov', sales: 2780 },
    { name: 'Dec', sales: 5000 },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Deep Dive</h1>
        <p className="text-muted-foreground">Category performance, seasonality, and model metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Error Rates */}
        <BentoCard className="col-span-1 lg:col-span-3 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 flex flex-col justify-center items-center py-8">
          <div className="flex w-full justify-around text-center">
            <div>
              <p className="text-sm opacity-80 mb-2 uppercase tracking-wider font-semibold">Mean Absolute Error (MAE)</p>
              <p className="text-5xl font-bold font-mono">12.4</p>
              <p className="text-sm mt-2 text-green-400 dark:text-green-600">↓ 1.2 from last week</p>
            </div>
            <div className="w-px bg-white/20 dark:bg-black/20" />
            <div>
              <p className="text-sm opacity-80 mb-2 uppercase tracking-wider font-semibold">Root Mean Square Error (RMSE)</p>
              <p className="text-5xl font-bold font-mono">15.8</p>
              <p className="text-sm mt-2 text-green-400 dark:text-green-600">↓ 0.8 from last week</p>
            </div>
          </div>
        </BentoCard>

        {/* Seasonality Trends */}
        <BentoCard title="Seasonality Trends" description="Historical sales volume by month" className="col-span-1 md:col-span-2 lg:col-span-2 h-[400px]">
          <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--accent)'}}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Category Performance Radar */}
        <BentoCard title="Category Performance" description="Current vs Target" className="col-span-1 lg:col-span-1 h-[400px]">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                <Radar name="Actual" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                <Radar name="Target" dataKey="B" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
