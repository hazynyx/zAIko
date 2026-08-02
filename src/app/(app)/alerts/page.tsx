"use client";

import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { AlertCircle, Bell, BellRing, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AlertsPage() {
  const alerts = useStore(state => state.alerts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
        <p className="text-muted-foreground">Chronological feed of system triggers and anomalies.</p>
      </div>

      <BentoCard>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {alerts.map((alert, index) => (
            <div key={alert.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                {alert.severity === 'high' ? (
                  <BellRing className="h-5 w-5 text-destructive" />
                ) : alert.severity === 'medium' ? (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Bell className="h-5 w-5 text-primary" />
                )}
              </div>
              
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg capitalize">{alert.severity} Priority</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-card-foreground">
                  {alert.message}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  ID: {alert.id}
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No alerts recorded in the system.</p>
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
}
