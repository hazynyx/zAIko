"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { BentoCard } from "@/components/ui/bento-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Search, Save, Edit2, Plus, Calendar, Trash2, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function InventoryPage() {
  const inventory = useStore(state => state.inventory);
  const addProduct = useStore(state => state.addProduct);
  const updateProduct = useStore(state => state.updateProduct);
  const deleteProduct = useStore(state => state.deleteProduct);
  const receiveOrder = useStore(state => state.receiveOrder);
  const [search, setSearch] = useState("");
  
  // Add Product State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ 
    name: '', category: 'Groceries', costPrice: '', retailPrice: '', stock: '', 
    unit: 'pcs', warehouseLocation: '', estimatedExpiry: '', vendor: '' 
  });

  // Edit Product State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItemData, setEditItemData] = useState({
    id: '', name: '', category: '', costPrice: '', retailPrice: '', price: '', stock: '', 
    unit: '', warehouseLocation: '', estimatedExpiry: '', vendor: '' 
  });

  const [categoryFilter, setCategoryFilter] = useState("All");

  // Reorder State
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [reorderItem, setReorderItem] = useState<{ id: string, name: string } | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState("50");
  const reorderProductStore = useStore(state => state.reorderProduct);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: any) => {
    setEditItemData({
      id: item.id,
      name: item.name || '',
      category: item.category || '',
      costPrice: item.costPrice?.toString() || '0',
      retailPrice: item.retailPrice?.toString() || '0',
      price: item.price?.toString() || '0',
      stock: item.stock?.toString() || '0',
      unit: item.unit || '',
      warehouseLocation: item.warehouseLocation || '',
      estimatedExpiry: item.estimatedExpiry || '',
      vendor: item.vendor || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const costPrice = parseFloat(editItemData.costPrice);
    const retailPrice = parseFloat(editItemData.retailPrice);
    const price = parseFloat(editItemData.price);
    const stock = parseInt(editItemData.stock, 10);
    
    if (!editItemData.name || !editItemData.category || isNaN(costPrice) || isNaN(retailPrice) || isNaN(price) || isNaN(stock)) {
      toast.error("Please fill in all fields correctly.");
      return;
    }

    updateProduct(editItemData.id, {
      name: editItemData.name,
      category: editItemData.category,
      costPrice,
      retailPrice,
      price,
      stock,
      unit: editItemData.unit,
      warehouseLocation: editItemData.warehouseLocation,
      estimatedExpiry: editItemData.estimatedExpiry,
      vendor: editItemData.vendor
    });
    
    toast.success("Product updated successfully!");
    setIsEditDialogOpen(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const costPrice = parseFloat(newItemData.costPrice);
    const retailPrice = parseFloat(newItemData.retailPrice);
    const stock = parseInt(newItemData.stock, 10);
    
    if (!newItemData.name || !newItemData.category || isNaN(costPrice) || isNaN(retailPrice) || isNaN(stock)) {
      toast.error("Please fill in all fields correctly.");
      return;
    }
    
    addProduct({
      name: newItemData.name,
      category: newItemData.category,
      costPrice,
      retailPrice,
      price: retailPrice, // initially price matches retail
      stock,
      unit: newItemData.unit,
      warehouseLocation: newItemData.warehouseLocation,
      estimatedExpiry: newItemData.estimatedExpiry,
      vendor: newItemData.vendor
    });
    
    toast.success("Product added successfully!");
    setIsAddDialogOpen(false);
    setNewItemData({ 
      name: '', category: 'Groceries', costPrice: '', retailPrice: '', stock: '', 
      unit: 'pcs', warehouseLocation: '', estimatedExpiry: '', vendor: '' 
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      toast.success("Product deleted successfully!");
    }
  };

  const handleReceiveOrder = (id: string, qty: number, name: string) => {
    receiveOrder(id);
    toast.success(`Received ${qty} units of ${name}. Stock updated.`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Inventory</h1>
          <p className="text-muted-foreground">Manage and override your current stock levels.</p>
        </div>
        
        {/* Add Product Dialog */}
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
                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                <Input 
                  id="costPrice" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newItemData.costPrice}
                  onChange={e => setNewItemData({...newItemData, costPrice: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retailPrice">Retail Price / MRP (₹)</Label>
                <Input 
                  id="retailPrice" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newItemData.retailPrice}
                  onChange={e => setNewItemData({...newItemData, retailPrice: e.target.value})}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of the product below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input 
                id="edit-name" 
                value={editItemData.name}
                onChange={e => setEditItemData({...editItemData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select 
                id="edit-category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={editItemData.category}
                onChange={e => setEditItemData({...editItemData, category: e.target.value})}
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
              <Label htmlFor="edit-vendor">Vendor / Distributor</Label>
              <Input 
                id="edit-vendor" 
                value={editItemData.vendor}
                onChange={e => setEditItemData({...editItemData, vendor: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-warehouseLocation">Warehouse Location</Label>
              <Input 
                id="edit-warehouseLocation" 
                value={editItemData.warehouseLocation}
                onChange={e => setEditItemData({...editItemData, warehouseLocation: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit Type</Label>
              <select 
                id="edit-unit"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={editItemData.unit}
                onChange={e => setEditItemData({...editItemData, unit: e.target.value})}
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
              <Label htmlFor="edit-estimatedExpiry">Est. Expiry Date</Label>
              <Input 
                id="edit-estimatedExpiry" 
                type="date"
                value={editItemData.estimatedExpiry}
                onChange={e => setEditItemData({...editItemData, estimatedExpiry: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Cost Price (₹)</Label>
              <Input 
                id="edit-costPrice" 
                type="number" 
                min="0" 
                step="0.01" 
                value={editItemData.costPrice}
                onChange={e => setEditItemData({...editItemData, costPrice: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-retailPrice">Retail Price / MRP (₹)</Label>
              <Input 
                id="edit-retailPrice" 
                type="number" 
                min="0" 
                step="0.01" 
                value={editItemData.retailPrice}
                onChange={e => setEditItemData({...editItemData, retailPrice: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Current Selling Price (₹)</Label>
              <Input 
                id="edit-price" 
                type="number" 
                min="0" 
                step="0.01" 
                value={editItemData.price}
                onChange={e => setEditItemData({...editItemData, price: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock Left</Label>
              <Input 
                id="edit-stock" 
                type="number" 
                min="0" 
                value={editItemData.stock}
                onChange={e => setEditItemData({...editItemData, stock: e.target.value})}
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2 mt-4">
              <Button type="submit" className="w-full">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
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
              <Label htmlFor="reorder-quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="reorder-quantity"
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
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Retail / MRP</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
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
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={
                          item.status === 'In Stock' ? 'default' : 
                          item.status === 'Low' ? 'secondary' : 'destructive'
                        }>
                          {item.status}
                        </Badge>
                        {item.orderedQuantity ? (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                            + {item.orderedQuantity} Ordered
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(item.costPrice)}</TableCell>
                    <TableCell className="text-right">
                      {item.retailPrice > item.price ? (
                        <span className="line-through text-muted-foreground">{formatCurrency(item.retailPrice)}</span>
                      ) : (
                        formatCurrency(item.retailPrice)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">
                      <span>{item.stock} <span className="text-xs text-muted-foreground">{item.unit}</span></span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.orderedQuantity ? (
                          <Button size="sm" variant="outline" className="text-xs h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleReceiveOrder(item.id, item.orderedQuantity!, item.name)}>
                            Receive
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => handleOpenReorder(item.id, item.name)} title="Reorder">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
