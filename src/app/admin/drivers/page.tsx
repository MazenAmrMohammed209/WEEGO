"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, User, Phone, Star, Car, MoreVertical, CheckCircle2, XCircle, Clock, Loader2, X } from "lucide-react";
import { fetchAdminDrivers } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { RowActions } from "@/components/admin/RowActions";

interface DriverRecord {
  id: string;
  name?: string;
  national_id?: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  user_id?: string;
  status?: string;
  raw_id?: string;
  raw_name?: string;
  raw_national_id?: string;
  raw_phone?: string;
  raw_license_number?: string;
  raw_license_expiry?: string;
}

export default function AdminDriversPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

const [formData, setFormData] = useState({
  name: "",
  national_id: "",
  phone: "",
  license_number: "",
  license_expiry: "",
});

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["adminDrivers", currentPage, searchQuery],
    queryFn: async () => {
        const { data, count, error } = await fetchAdminDrivers(currentPage, itemsPerPage, searchQuery);
      if (error) throw error;
        return { data: data || [], count: count || 0 };
    }
  });

  const rawDrivers = queryData?.data || [];
  const totalCount = queryData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const channel = supabase
      .channel("public:drivers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "drivers" },
        (payload) => {
          console.log("Realtime INSERT, invalidating cache:", payload.new);
          queryClient.invalidateQueries({ queryKey: ["adminDrivers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.national_id || !formData.license_number || !formData.license_expiry) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    console.log("[Add Driver] Starting insert...", formData);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        status: "available",
        national_id: formData.national_id,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry
      };

      if (editingId) {
        const { data, error } = await supabase
          .from("drivers")
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        
        queryClient.setQueryData(
          ["adminDrivers", currentPage, searchQuery], 
          (old: any) => {
            if (!old) return { data: [data], count: 1 };
            return { data: old.data.map((d: any) => d.id === editingId ? data : d), count: old.count };
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["adminDrivers"] });
        showToast("Driver updated successfully", "success");
      } else {
        const { data: newDriver, error } = await supabase
          .from("drivers")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        
        queryClient.setQueryData(
          ["adminDrivers", currentPage, searchQuery], 
          (old: any) => {
            if (!old) return { data: [newDriver], count: 1 };
            return { data: [newDriver, ...old.data], count: old.count + 1 };
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["adminDrivers"] });
        showToast("Driver added successfully", "success");
      }

      setIsModalOpen(false);
      setEditingId(null);

      setFormData({
        name: "",
        national_id: "",
        phone: "",
        license_number: "",
        license_expiry: ""
      });

    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error("Driver save failed:", currentErr.message);
      showToast(currentErr.message || "Failed to save driver", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInit = (d: DriverRecord) => {
    setEditingId(d.raw_id || null);
    setFormData({
      name: d.raw_name || "",
      national_id: d.raw_national_id || "",
      phone: d.raw_phone || "",
      license_number: d.raw_license_number || "",
      license_expiry: d.raw_license_expiry || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
      
      queryClient.setQueryData(
        ["adminDrivers", currentPage, searchQuery], 
        (old: any) => {
          if (!old) return { data: [], count: 0 };
          return { data: old.data.filter((d: any) => d.id !== id), count: Math.max(0, old.count - 1) };
        }
      );
      await queryClient.invalidateQueries({ queryKey: ["adminDrivers"] });
      showToast("Driver deleted successfully", "success");
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error("Delete error:", currentErr.message);
      showToast(currentErr.message || "Failed to delete driver", "error");
    }
  };

  const drivers = useMemo(() => {
    if (!rawDrivers) return [];

    return rawDrivers.map((d: DriverRecord) => {
      const userName = d?.name || "Unknown Driver";
      const userPhone = d?.phone || "No phone";

      const rawIdStr = String(d?.user_id || d?.id || "");
      const shortId = rawIdStr ? rawIdStr.substring(0, 4) : "NA";

      return {
        id: `DRV-${shortId}`,
        raw_id: d.id,
        raw_name: d.name,
        raw_national_id: d.national_id,
        raw_phone: d.phone,
        raw_license_number: d.license_number,
        raw_license_expiry: d.license_expiry,
        name: userName,
        phone: userPhone,
        national_id: d?.national_id || "Not Provided",
        license_number: d?.license_number || "Not Provided",
        license_expiry: d?.license_expiry || "Not Provided"
      };
    });
  }, [rawDrivers, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Drivers Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage driver fleets, ratings, and vehicle assignments.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              national_id: "",
              phone: "",
              license_number: "",
              license_expiry: ""
            });
            setIsModalOpen(true);
          }}
          className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Driver
        </button>
      </div>

      <div className="mb-4 max-w">
        <div className="bg-gradient-to-br from-[#00ff9d]/20 to-[#0a0a0a] border border-[#00ff9d]/30 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,255,157,0.12)]">
          <div className="absolute -right-4 -top-4 text-[#00ff9d]/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
            <User className="w-32 h-32" />
          </div>
          <span className="text-sm font-bold text-[#00ff9d] uppercase tracking-wider relative z-10 flex items-center gap-2">
            Total Drivers
          </span>
          <span className="text-5xl font-black text-white relative z-10 drop-shadow-lg">{totalCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by Driver Name or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors h-full">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/5">
              <tr className="bg-black/40">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Driver Profile</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">National ID</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">License Number</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">License Expiry</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <TableSkeleton rows={5} columns={6} />
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No drivers found.
                  </td>
                </tr>
              ) : drivers.map((driver, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-white/50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{driver.name}</p>
                        <p className="text-xs font-mono font-medium text-white/40">{driver.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                      <Phone className="h-4 w-4 text-white/40" />
                      {driver.phone}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-white">
                      {driver.national_id}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-mono font-bold text-white/80">
                      {driver.license_number}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-white/70">
                      {driver.license_expiry}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => handleEditInit(driver)}
                      onDelete={() => handleDelete(driver.raw_id)}
                      itemsName="driver"
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
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-bold animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-[#00ff9d] text-black' : 'bg-red-500 text-white'
          }`}>
          {toast.message}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-black text-white">{editingId ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white" title="Close modal" aria-label="Close modal">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-6">
              <form id="add-driver-form" onSubmit={handleAddDriver} className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl space-y-4 border border-white/10">
                  <h3 className="text-sm font-bold text-[#00ff9d] uppercase tracking-wider">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-xs font-bold text-white/70">Full Name</label>
                      <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="First Second Third Last" pattern="^([\w-]+\s){3}[\w-]+$" title="Please enter full name (4 parts)" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">National ID</label>
                      <input required value={formData.national_id} onChange={e => setFormData({ ...formData, national_id: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="14 Digits" pattern="\d{14}" maxLength={14} minLength={14} title="Must be exactly 14 numeric digits" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">Phone Number</label>
                      <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="01XXXXXXXXX" pattern="^01\d{9}$" maxLength={11} minLength={11} title="Must be exactly 11 digits starting with 01" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl space-y-4 border border-white/10">
                  <h3 className="text-sm font-bold text-[#00ff9d] uppercase tracking-wider">License & Vehicle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">License Number</label>
                      <input required value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none uppercase" placeholder="DL-123456" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70">License Expiry</label>
                      <input required type="date" value={formData.license_expiry} onChange={e => setFormData({ ...formData, license_expiry: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none cursor-text [color-scheme:dark]" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 shrink-0 flex justify-end gap-3 bg-[#0a0a0a]">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" form="add-driver-form" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-[#00ff9d] hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_14px_rgba(0,255,157,0.3)]">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : editingId ? 'Update Driver' : 'Add Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
