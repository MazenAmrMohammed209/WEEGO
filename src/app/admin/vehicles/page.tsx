"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, Plus, CarFront, Users, Hash, MapPin, SearchCheck, MoreVertical, CheckCircle2, ShieldAlert, Wrench, Briefcase, Loader2, X } from "lucide-react";
import { fetchAdminVehicles } from "@/lib/supabaseActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { RowActions } from "@/components/admin/RowActions";

interface CategoryRecord {
  id: string;
  name?: string;
  slug?: string;
  capacity?: number;
  [key: string]: unknown;
}

interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  year: number | string;
  category_id?: string;
  status?: string;
  base_price?: number | string;
  license_plate?: string;
  capacity?: number | string;
  vehicle_categories?: { name?: string };
  raw_id?: string;
  raw_make?: string;
  raw_model?: string;
  raw_year?: string | number;
  raw_category_id?: string;
  raw_status?: string;
  raw_base_price?: number | string;
  plate?: string;
  caps?: number | string;
}

export default function AdminVehiclesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    license_plate: "",
    category_id: "",
    capacity: "4",
    status: "active",
    base_price: "1000"
  });

  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    async function getCategories() {
      const { data, error } = await supabase.from('vehicle_categories').select('*').order('capacity', { ascending: true });
      if (error) {
        console.error("Failed to fetch categories:", error);
      }
      if (data) {
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    }
    getCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("[Add Vehicle] Starting...", formData);
    try {
      const selectedCategory = categories.find(c => c.id === formData.category_id);
      
      if (!selectedCategory) {
        throw new Error("Please select a valid category.");
      }

      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year.toString(), 10) || new Date().getFullYear(),
        license_plate: formData.license_plate.trim(),
        category_id: selectedCategory.id,
        capacity: parseInt(formData.capacity.toString(), 10) || selectedCategory.capacity || 4,
        status: formData.status.toLowerCase(),
        base_price: parseFloat(formData.base_price.toString()) || 0
      };

      console.log("Final Vehicle Payload:", payload);

      if (editingId) {
        const { error } = await supabase.from('vehicles').update(payload).eq('id', editingId);
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
        showToast("Vehicle updated successfully!", "success");
      } else {
        const { error } = await supabase.from('vehicles').insert([payload]);
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
        showToast("Vehicle added successfully!", "success");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear().toString(),
        license_plate: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        capacity: "4",
        status: "active",
        base_price: "1000"
      });
    } catch (err: any) {
      const errorMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      // console.warn("Vehicle error:", err); // Log suppressed to avoid dev overlay
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInit = (v: Partial<VehicleRecord>) => {
    setEditingId(v.raw_id || null);
    setFormData({
      make: v.raw_make || "",
      model: v.raw_model || "",
      year: v.raw_year?.toString() || new Date().getFullYear().toString(),
      license_plate: v.plate || "",
      category_id: v.raw_category_id || (categories.length > 0 ? categories[0].id : ""),
      capacity: v.caps?.toString() || "4",
      status: v.raw_status || "active",
      base_price: v.raw_base_price?.toString() || "1000"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
      showToast("Vehicle deleted successfully", "success");
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error("Delete error:", currentErr.message);
      showToast(currentErr.message || "Failed to delete vehicle", "error");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["adminVehicles", currentPage, searchQuery],
    queryFn: async () => {
      const { data, count, error } = await fetchAdminVehicles(currentPage, itemsPerPage, searchQuery);
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }
  });

  const rawVehicles = queryData?.data || [];
  const totalCount = queryData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const channel = supabase
      .channel("public:vehicles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["adminVehicles"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const vehicles = useMemo(() => {
    if (!rawVehicles) return [];
    return rawVehicles.map((v: VehicleRecord) => {
      const driverName = "Unassigned";
      let statusText = v.status || "active";
      statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1).toLowerCase();
      
      return {
        id: v.id.substring(0, 8),
        raw_id: v.id,
        raw_make: v.make,
        raw_model: v.model,
        raw_year: v.year,
        raw_category_id: v.category_id,
        raw_status: v.status,
        raw_base_price: v.base_price,
        model: `${v.make} ${v.model} ${v.year}`,
        category: v.vehicle_categories?.name || "Uncategorized",
        plate: v.license_plate,
        driver: driverName,
        caps: v.capacity || 0,
        luggage: v.capacity || 0,
        status: statusText,
        cond: statusText === "Maintenance" ? "Service Required" : "Good"
      };
    });
  }, [rawVehicles]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Available": return "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/20";
      case "Maintenance": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-white/10 text-white/70 border-white/20";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Vehicles Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage fleet registry, capacity, and maintenance status.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              make: "",
              model: "",
              year: new Date().getFullYear().toString(),
              license_plate: "",
              category_id: categories.length > 0 ? categories[0].id : "",
              capacity: "4",
              status: "active",
              base_price: "1000"
            });
            setIsModalOpen(true);
          }}
          className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by Vehicle Model, or License Plate..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors h-full">
          <Filter className="h-4 w-4" />
          Class Filters
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/5">
              <tr className="bg-black/40">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Vehicle ID & Model</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Assigned Driver</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10">
                    <TableSkeleton rows={5} columns={6} />
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No vehicles found.
                  </td>
                </tr>
              ) : vehicles.map((v, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <CarFront className="h-6 w-6 text-white/50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white max-w-[200px] truncate">{v.model}</p>
                        <p className="text-xs font-mono font-medium text-white/40">{v.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 text-xs font-black bg-white/5 border border-white/10 text-white rounded-md tracking-wider">
                      {v.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 font-mono text-xs font-black bg-white/10 border border-white/20 text-white rounded-md tracking-wider">
                      {v.plate}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-white">{v.driver}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Users className="h-3.5 w-3.5 text-white/40" /> {v.caps} PAX
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Briefcase className="h-3.5 w-3.5 text-white/40" /> {v.luggage} Bags
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 w-max ${getStatusColor(v.status)}`}>
                          {v.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          {v.status === 'Available' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {v.status === 'Maintenance' && <Wrench className="h-3.5 w-3.5" />}
                          {v.status}
                        </span>
                        {v.cond === 'Service Required' && (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-red-100">
                              <ShieldAlert className="h-3 w-3" /> Service Required
                           </span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => handleEditInit(v)}
                      onDelete={() => handleDelete(v.raw_id)}
                      itemsName="vehicle"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2 bg-[#0a0a0a]">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors border ${
                  currentPage === num 
                    ? 'bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30' 
                    : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-[9999] text-sm font-bold animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-[#00ff9d] text-black' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 pb-12 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <div className="max-h-[85vh] overflow-y-auto custom-scrollbar rounded-3xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
                <h2 className="text-xl font-black text-white">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setIsSubmitting(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Make</label>
                  <input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="e.g. Mercedes" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Model</label>
                  <input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="e.g. S-Class" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Year</label>
                  <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">License Plate</label>
                  <input required value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none uppercase" placeholder="ABC-123" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Capacity</label>
                  <input required type="number" min="1" max="50" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Base Price (EGP)</label>
                  <input required type="number" min="0" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Category</label>
                  <select 
                    required 
                    value={formData.category_id} 
                    onChange={e => {
                      const selectedId = e.target.value;
                      const cat = categories.find(c => c.id === selectedId);
                      setFormData({
                        ...formData, 
                        category_id: selectedId,
                        capacity: cat?.capacity?.toString() || "4"
                      });
                    }} 
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none"
                  >
                    {categories.length === 0 ? (
                      <option value="" disabled>Loading categories...</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} (Up to {cat.capacity} pax)</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setIsSubmitting(false); }} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-[#00ff9d] hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
