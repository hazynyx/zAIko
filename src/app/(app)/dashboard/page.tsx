"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { useStore } from "@/store/useStore";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, ArrowDownRight, BarChart3, Download, Play, TrendingUp, Package, AlertTriangle, ShoppingCart, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const inventory = useStore(state => state.inventory);
  const alerts = useStore(state => state.alerts);
  const applyDiscountStore = useStore(state => state.applyDiscount);
  
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountItem, setDiscountItem] = useState<{ id: string, name: string, price: number } | null>(null);
  const [discountPercent, setDiscountPercent] = useState("10");

  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [reorderItem, setReorderItem] = useState<{ id: string, name: string } | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState("50");
  const reorderProductStore = useStore(state => state.reorderProduct);

  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [saleItemId, setSaleItemId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const recordSaleStore = useStore(state => state.recordSale);
  
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
  const recommendedOrders = inventory.filter(i => (i.status === 'Low' || i.status === 'Out of Stock') && !i.orderedQuantity).slice(0, 3);

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

  const handleOpenDiscount = (id: string, name: string, price: number) => {
    setDiscountItem({ id, name, price });
    setDiscountPercent("10");
    setIsDiscountDialogOpen(true);
  };

  const handleApplyDiscount = () => {
    if (!discountItem) return;
    const percent = parseFloat(discountPercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error("Please enter a valid discount percentage (0-100).");
      return;
    }
    
    applyDiscountStore(discountItem.id, percent);
    toast.success(`Applied ${percent}% discount to ${discountItem.name}`);
    setIsDiscountDialogOpen(false);
  };

  const handleOpenReorder = (id: string, name: string) => {
    setReorderItem({ id, name });
    setReorderQuantity("50");
    setIsReorderDialogOpen(true);
  };

  const handleApplyReorder = () => {
    if (!reorderItem) return;
    const quantity = parseInt(reorderQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    
    reorderProductStore(reorderItem.id, quantity);
    toast.success(`Successfully reordered ${quantity} units of ${reorderItem.name}`);
    setIsReorderDialogOpen(false);
  };

  const handleRecordSale = () => {
    if (!saleItemId) {
      toast.error("Please select a product.");
      return;
    }
    const quantity = parseInt(saleQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    
    const item = inventory.find(i => i.id === saleItemId);
    if (item && quantity > item.stock) {
      toast.error(`Cannot sell more than available stock (${item.stock} left).`);
      return;
    }

    recordSaleStore(saleItemId, quantity);
    toast.success(`Recorded sale of ${quantity} unit(s) for ${item?.name}`);
    setIsSaleDialogOpen(false);
    setSaleItemId("");
    setSaleQuantity("1");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">Real-time pulse on sales, inventory health, and AI recommendations.</p>
        </div>
        <Button onClick={() => setIsSaleDialogOpen(true)} className="gap-2 shrink-0">
          <ShoppingCart className="h-4 w-4" /> Record Sale
        </Button>
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
                <Button size="sm" onClick={() => handleOpenReorder(item.id, item.name)}>
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
                  <Button size="sm" variant="outline" onClick={() => handleOpenDiscount(item.id, item.name, item.price)}>
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

      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Set a markdown percentage for {discountItem?.name} to help clear out excess inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                Discount %
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="pl-8"
                />
                <Percent className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
            </div>
            {discountItem && (
              <div className="text-sm text-center text-muted-foreground mt-2">
                New price will be: <span className="font-bold text-foreground">
                  {formatCurrency(discountItem.price * (1 - (parseFloat(discountPercent || "0") / 100)))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyDiscount}>Apply Discount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Place Reorder</DialogTitle>
            <DialogDescription>
              Specify the quantity to reorder for {reorderItem?.name}. This item will be tracked in Live Inventory until received.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReorderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyReorder}>Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Quick Sale</DialogTitle>
            <DialogDescription>
              Instantly record a sale directly from the dashboard to keep live inventory accurate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sale-item">Product</Label>
              <select 
                id="sale-item"
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={saleItemId}
                onChange={(e) => setSaleItemId(e.target.value)}
              >
                <option value="" disabled>Select a product...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.stock} left)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-qty">Quantity Sold</Label>
              <Input
                id="sale-qty"
                type="number"
                min="1"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordSale}>Record Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
