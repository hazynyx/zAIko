"use client";

import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ActivityPage() {
  const transactions = useStore(state => state.transactions);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const filteredTransactions = transactions.filter(tx => {
    if (!selectedDate) return true;
    
    // Parse the transaction timestamp to YYYY-MM-DD in local time
    const txDate = new Date(tx.timestamp);
    const localTxDateString = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}-${String(txDate.getDate()).padStart(2, '0')}`;
    return localTxDateString === selectedDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Activity Log</h1>
          <p className="text-muted-foreground">Comprehensive ledger of all system operations and sales.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-filter" className="whitespace-nowrap text-muted-foreground">Filter Date:</Label>
          <Input 
            id="date-filter"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          {selectedDate && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate("")}>Clear</Button>
          )}
        </div>
      </div>

      <BentoCard>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {filteredTransactions.map((tx, index) => (
            <div key={tx.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg capitalize">{tx.type}</h3>
                    <Badge variant={
                      tx.type === 'sale' ? 'default' :
                      tx.type === 'reorder' ? 'secondary' :
                      tx.type === 'receive' ? 'outline' : 'outline'
                    } className="capitalize shrink-0">
                      {tx.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {new Date(tx.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-card-foreground">
                    {tx.message}
                  </p>
                  {tx.amount !== undefined && tx.amount > 0 && (
                    <div className="font-bold text-emerald-600 shrink-0 text-lg">
                      +{formatCurrency(tx.amount)}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  ID: {tx.id}
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{selectedDate ? `No activity recorded on this date.` : `No activity recorded yet.`}</p>
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
}
