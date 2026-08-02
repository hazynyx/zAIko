"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, ArrowDownRight, BarChart3, Download, Play, TrendingUp, Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const inventory = useStore(state => state.inventory);
  const alerts = useStore(state => state.alerts);
  
  // Existing Metrics
  const totalValue = inventory.reduce((acc, item) => acc + item.value, 0);
  const totalItems = inventory.reduce((acc, item) => acc + item.stock, 0);
  
  // New Operational Metrics
  const todaySales = 14250; 
  const todayOrders = 112;
  const salesTrend = 12.5;

  const healthyCount = inventory.filter(i => i.status === 'In Stock').length;
  const lowCount = inventory.filter(i => i.status === 'Low').length;
  const outCount = inventory.filter(i => i.status === 'Out of Stock').length;
  const healthPercentage = inventory.length > 0 ? Math.round((healthyCount / inventory.length) * 100) : 0;

  // Stable derived lists
  const topSelling = [...inventory].sort((a, b) => b.value - a.value).slice(0, 3);
  const overstocked = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 3);
  const recommendedOrders = inventory.filter(i => i.status === 'Low' || i.status === 'Out of Stock').slice(0, 3);

  // Dummy data for sparkline
  const accuracyData = [
    { name: "Mon", value: 85 }, { name: "Tue", value: 88 },
    { name: "Wed", value: 92 }, { name: "Thu", value: 90 },
    { name: "Fri", value: 94 }, { name: "Sat", value: 96 },
    { name: "Sun", value: 95 },
  ];

  const handleAction = (action: string) => {
    toast.success(`${action} initiated successfully.`);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground">Real-time pulse on sales, inventory health, and AI recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: High Level Metrics */}
        <BentoCard 
          className="col-span-1 lg:col-span-1 bg-primary text-primary-foreground border-none delay-100"
          title={<span className="text-primary-foreground/80">Today's Sales</span>}
        >
          <div className="mt-2 space-y-4">
            <div className="text-4xl font-bold tracking-tighter">
              {formatCurrency(todaySales)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-foreground/80">{todayOrders} Orders</span>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-none gap-1">
                <ArrowUpRight className="h-3 w-3" /> {salesTrend}%
              </Badge>
            </div>
          </div>
        </BentoCard>

        <BentoCard 
          className="col-span-1 lg:col-span-1 delay-150"
          title="Inventory Health"
        >
          <div className="mt-2 space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tighter text-emerald-500">{healthPercentage}%</span>
              <span className="text-sm text-muted-foreground mb-1">Healthy</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 flex overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${healthPercentage}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${(lowCount/inventory.length)*100}%` }} />
              <div className="bg-destructive h-full" style={{ width: `${(outCount/inventory.length)*100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> {healthyCount} OK</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"/> {lowCount} Low</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive"/> {outCount} Out</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard 
          className="col-span-1 lg:col-span-1 delay-200"
          title="ML Accuracy"
        >
          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-3xl font-bold tracking-tighter">95.2%</span>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">High</Badge>
            </div>
            <div className="h-[60px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </BentoCard>

        <BentoCard 
          title="Active Alerts" 
          className="col-span-1 lg:col-span-1 delay-300"
        >
          <div className="space-y-4 mt-2">
            {alerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="flex items-start gap-3">
                <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-destructive' : 'text-amber-500'}`} />
                <div>
                  <p className="text-xs font-medium leading-tight mb-1 line-clamp-2">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            )}
            <Link href="/alerts" className="block mt-2">
              <Button variant="link" className="px-0 h-auto text-xs">View all alerts</Button>
            </Link>
          </div>
        </BentoCard>

        {/* Row 2: Operational Lists */}
        <BentoCard 
          title={<span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Top Selling Products</span>}
          className="col-span-1 md:col-span-2 delay-400"
        >
          <div className="space-y-4 mt-4">
            {topSelling.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-bold text-muted-foreground">#{i + 1}</div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-emerald-500">Fast Mover</p>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard 
          title={<span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-amber-500" /> Recommended Orders</span>}
          className="col-span-1 md:col-span-2 delay-500"
        >
          <div className="space-y-4 mt-4">
            {recommendedOrders.length > 0 ? recommendedOrders.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {item.name} 
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-amber-500/30 text-amber-600 bg-amber-500/10">
                      {item.stock} left
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Vendor: {item.vendor || 'Unknown'}</p>
                </div>
                <Button size="sm" onClick={() => handleAction(`Reorder placed for ${item.name}`)}>
                  Reorder
                </Button>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Inventory is healthy. No reorders needed.
              </div>
            )}
          </div>
        </BentoCard>

        {/* Row 3: Risk & Value */}
        <BentoCard 
          title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Overstocked Risk</span>}
          className="col-span-1 md:col-span-2 delay-[600ms]"
        >
          <div className="space-y-4 mt-4">
            {overstocked.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">High capital tied up</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold text-sm">{item.stock} {item.unit}</p>
                    <p className="text-xs text-destructive">Excess</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAction(`Discount applied to ${item.name}`)}>
                    Discount
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard 
          title="Total Capital Tied Up"
          className="col-span-1 md:col-span-2 delay-[700ms]"
          contentClassName="flex flex-col justify-center h-full pb-4"
        >
          <div className="text-center space-y-2 mt-6">
            <p className="text-5xl font-bold tracking-tighter">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-muted-foreground">Across {totalItems} total units and {inventory.length} SKUs.</p>
            <div className="pt-6 flex justify-center gap-4">
              <Button variant="outline" onClick={() => handleAction('Exporting Valuation Report')}>
                <Download className="h-4 w-4 mr-2" /> Valuation Report
              </Button>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
