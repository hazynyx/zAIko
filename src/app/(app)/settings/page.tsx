"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useStore } from "@/store/useStore";

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
              <Input id="currency" defaultValue="INR" disabled />
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

        <BentoCard title="Danger Zone" className="border-destructive">
          <div className="space-y-4 max-w-lg mt-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Clear Sales History</h3>
              <p className="text-sm text-muted-foreground mb-2">This will permanently delete all recorded transactions. The Top Selling metrics and Activity Logs will be reset to 0.</p>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  useStore.getState().clearTransactions();
                  toast.success("Sales history cleared.");
                }}
              >
                Clear All Transactions
              </Button>
            </div>
            
            <div className="border-t pt-4 mt-4 flex flex-col gap-2">
              <h3 className="font-semibold text-destructive">Factory Reset</h3>
              <p className="text-sm text-muted-foreground mb-2">This will wipe your entire inventory, settings, and logs, returning the app to its initial mock state.</p>
              <Button 
                type="button" 
                variant="outline" 
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  if (confirm("Are you absolutely sure you want to factory reset the app? All your data will be lost.")) {
                    useStore.getState().factoryReset();
                    toast.success("App has been factory reset.");
                  }
                }}
              >
                Factory Reset App
              </Button>
            </div>
          </div>
        </BentoCard>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
