"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Search, Save, Edit2, Plus, Calendar, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function InventoryPage() {
  const inventory = useStore(state => state.inventory);
  const updateStock = useStore(state => state.updateStock);
  const addProduct = useStore(state => state.addProduct);
  const deleteProduct = useStore(state => state.deleteProduct);
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ 
    name: '', category: 'Groceries', price: '', stock: '', 
    unit: 'pcs', warehouseLocation: '', estimatedExpiry: '', vendor: '' 
  });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock.toString());
  };

  const handleSave = (id: string) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Invalid stock value");
      return;
    }
    updateStock(id, newStock);
    setEditingId(null);
    toast.success("Stock updated successfully");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemData.price);
    const stock = parseInt(newItemData.stock, 10);
    
    if (!newItemData.name || !newItemData.category || isNaN(price) || isNaN(stock)) {
      toast.error("Please fill in all fields correctly.");
      return;
    }
    
    addProduct({
      name: newItemData.name,
      category: newItemData.category,
      price,
      stock,
      unit: newItemData.unit,
      warehouseLocation: newItemData.warehouseLocation,
      estimatedExpiry: newItemData.estimatedExpiry,
      vendor: newItemData.vendor
    });
    
    toast.success("Product added successfully!");
    setIsAddDialogOpen(false);
    setNewItemData({ 
      name: '', category: 'Groceries', price: '', stock: '', 
      unit: 'pcs', warehouseLocation: '', estimatedExpiry: '', vendor: '' 
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      toast.success("Product deleted successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Inventory</h1>
          <p className="text-muted-foreground">Manage and override your current stock levels.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" /> Add Product
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the comprehensive details of the new item below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Aashirvaad Atta (5kg)" 
                  value={newItemData.name}
                  onChange={e => setNewItemData({...newItemData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newItemData.category}
                  onChange={e => setNewItemData({...newItemData, category: e.target.value})}
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Household">Household</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor / Distributor</Label>
                <Input 
                  id="vendor" 
                  placeholder="e.g. ITC Limited" 
                  value={newItemData.vendor}
                  onChange={e => setNewItemData({...newItemData, vendor: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseLocation">Warehouse Location</Label>
                <Input 
                  id="warehouseLocation" 
                  placeholder="e.g. Aisle 2, Rack A" 
                  value={newItemData.warehouseLocation}
                  onChange={e => setNewItemData({...newItemData, warehouseLocation: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Type</Label>
                <select 
                  id="unit"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={newItemData.unit}
                  onChange={e => setNewItemData({...newItemData, unit: e.target.value})}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="bags">Bags</option>
                  <option value="packets">Packets</option>
                  <option value="cartons">Cartons</option>
                  <option value="bottles">Bottles</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedExpiry">Est. Expiry Date</Label>
                <Input 
                  id="estimatedExpiry" 
                  type="date"
                  value={newItemData.estimatedExpiry}
                  onChange={e => setNewItemData({...newItemData, estimatedExpiry: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newItemData.price}
                  onChange={e => setNewItemData({...newItemData, price: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  value={newItemData.stock}
                  onChange={e => setNewItemData({...newItemData, stock: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2 mt-4">
                <Button type="submit" className="w-full">Save Product to Inventory</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <BentoCard>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search SKUs or names..." 
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <select 
              className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(inventory.map(i => i.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name / Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">{item.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.vendor}</div>
                    </TableCell>
                    <TableCell className="text-xs">{item.warehouseLocation}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'In Stock' ? 'default' : 
                        item.status === 'Low' ? 'secondary' : 'destructive'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Input 
                            type="number"
                            className="w-16 text-right h-8"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                          <span className="text-xs text-muted-foreground w-8 text-left">{item.unit}</span>
                        </div>
                      ) : (
                        <span>{item.stock} <span className="text-xs text-muted-foreground">{item.unit}</span></span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === item.id ? (
                        <Button size="sm" variant="ghost" onClick={() => handleSave(item.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(item.id, item.stock)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </BentoCard>
    </div>
  );
}
