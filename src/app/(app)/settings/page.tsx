"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your store preferences and ML model parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <BentoCard title="Store Configuration" description="Basic details and thresholds">
          <div className="space-y-4 max-w-lg mt-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" defaultValue="zAIko Demo Store" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold (units)</Label>
              <Input id="lowStockThreshold" type="number" defaultValue="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="USD" disabled />
            </div>
          </div>
        </BentoCard>

        <BentoCard title="ML Model Parameters" description="Advanced configuration for the forecasting engine">
          <div className="space-y-4 max-w-lg mt-4">
            <div className="space-y-2">
              <Label htmlFor="confidenceInterval">Confidence Interval Target (%)</Label>
              <Input id="confidenceInterval" type="number" defaultValue="95" max="99" min="80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="historicalWeight">Historical Data Weight (1-10)</Label>
              <Input id="historicalWeight" type="number" defaultValue="7" max="10" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seasonalitySensitivity">Seasonality Sensitivity</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </BentoCard>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
