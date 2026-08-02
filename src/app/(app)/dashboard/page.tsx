"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, BarChart3, Download, Play } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const inventory = useStore(state => state.inventory);
  const alerts = useStore(state => state.alerts);
  
  const totalValue = inventory.reduce((acc, item) => acc + item.value, 0);
  const totalItems = inventory.reduce((acc, item) => acc + item.stock, 0);
  
  // Dummy data for sparkline
  const accuracyData = [
    { name: "Mon", value: 85 },
    { name: "Tue", value: 88 },
    { name: "Wed", value: 92 },
    { name: "Thu", value: 90 },
    { name: "Fri", value: 94 },
    { name: "Sat", value: 96 },
    { name: "Sun", value: 95 },
  ];

  const handleExport = () => {
    toast.success("Report exported successfully");
  };

  const handleOptimize = () => {
    toast.success("AI Optimization routine started");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and AI forecasts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <BentoCard 
          className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 bg-primary text-primary-foreground border-none"
          contentClassName="h-full flex flex-col justify-center py-8"
        >
          <p className="text-primary-foreground/80 font-medium mb-2">Total Inventory Value</p>
          <div className="text-5xl font-bold tracking-tighter mb-2">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-primary-foreground/80 flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4" />
            +4.2% from last month
          </p>
          <div className="mt-8 flex gap-4">
            <div className="bg-primary-foreground/10 rounded-lg p-3 w-1/2">
              <p className="text-sm text-primary-foreground/70">Total SKUs</p>
              <p className="text-xl font-semibold">{inventory.length}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-3 w-1/2">
              <p className="text-sm text-primary-foreground/70">Total Items</p>
              <p className="text-xl font-semibold">{totalItems}</p>
            </div>
          </div>
        </BentoCard>

        {/* Active Alerts */}
        <BentoCard 
          title="Active Alerts" 
          description="System triggers & warnings"
          className="col-span-1 lg:col-span-1 xl:col-span-1"
        >
          <div className="space-y-4">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-start gap-3">
                <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-destructive' : 'text-amber-500'}`} />
                <div>
                  <p className="text-sm font-medium leading-none mb-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            )}
          </div>
          <Link href="/alerts">
            <Button variant="link" className="px-0 mt-4 h-auto">View all alerts</Button>
          </Link>
        </BentoCard>

        {/* ML Forecast Accuracy */}
        <BentoCard 
          title="ML Forecast Accuracy" 
          description="Model confidence over last 7 days"
          className="col-span-1 lg:col-span-1 xl:col-span-1 flex flex-col"
          contentClassName="flex-1 flex flex-col justify-end"
        >
          <div className="mb-4">
            <span className="text-3xl font-bold">95.2%</span>
            <span className="text-sm text-muted-foreground ml-2">Avg</span>
          </div>
          <div className="h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="currentColor" 
                  strokeWidth={2}
                  dot={false}
                  className="text-primary"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard 
          title="Quick Actions" 
          className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
          contentClassName="flex flex-wrap gap-4"
        >
          <Button onClick={handleOptimize} className="gap-2">
            <Play className="h-4 w-4" /> Run Optimization
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Link href="/simulator">
            <Button variant="secondary" className="gap-2">
              <BarChart3 className="h-4 w-4" /> What-If Simulator
            </Button>
          </Link>
        </BentoCard>
      </div>
    </div>
  );
}
