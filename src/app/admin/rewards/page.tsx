"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Shield, Award, Plus, X, Loader2, Save, Download, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { RowActions } from "@/components/admin/RowActions";

interface RewardLevel {
  id: string;
  level_name: string;
  points_required: number;
  discount_percent: number;
  free_trips: number;
  description: string;
  color: string;
}

export default function AdminRewardsPage() {
  const [levels, setLevels] = useState<RewardLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    level_name: "",
    points_required: "",
    discount_percent: "",
    free_trips: "",
    description: "",
    color: ""
  });

  const fetchLevels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reward_levels")
        .select("*")
        .order("points_required", { ascending: true });
        
      if (error) throw error;
      if (data) setLevels(data);
    } catch (err) {
      console.error("Failed to fetch levels:", err);
      toast.error("Failed to load reward levels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleEditInit = (level: RewardLevel) => {
    setEditingId(level.id);
    setFormData({
      level_name: level.level_name,
      points_required: level.points_required.toString(),
      discount_percent: level.discount_percent.toString(),
      free_trips: level.free_trips.toString(),
      description: level.description || "",
      color: level.color || "#ffffff"
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        level_name: formData.level_name,
        points_required: parseInt(formData.points_required, 10),
        discount_percent: parseFloat(formData.discount_percent),
        free_trips: parseInt(formData.free_trips, 10),
        description: formData.description,
        color: formData.color
      };

      const { data, error } = await supabase
        .from("reward_levels")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLevels(prev => prev.map(l => l.id === editingId ? data : l).sort((a, b) => a.points_required - b.points_required));
        toast.success("Reward level updated successfully");
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update reward level");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Loyalty Rewards</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Configure loyalty tiers, discounts, and point thresholds.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#050505] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Level Name</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Points Range</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Benefits</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <TableSkeleton rows={5} columns={5} />
                  </td>
                </tr>
              ) : levels.map((lvl) => (
                <tr key={lvl.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10" style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}>
                          <Award className="h-4 w-4" />
                       </div>
                       <span className="font-bold" style={{ color: lvl.color }}>{lvl.level_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-white">
                        {lvl.points_required} pts
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-bold text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded-full w-fit">
                         {lvl.discount_percent}% Discount
                       </span>
                       {lvl.free_trips > 0 && (
                         <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full w-fit">
                           {lvl.free_trips} Free Trips
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-white/60 truncate block max-w-[200px]">{lvl.description || "-"}</span>
                  </td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => handleEditInit(lvl)}
                      onDelete={async () => { toast.error("Levels cannot be deleted, only edited."); }}
                      itemsName="level"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">Edit Reward Level</h2>
                <p className="text-xs text-white/40 mt-1">Configure thresholds and perks for {formData.level_name}.</p>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Level Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.level_name}
                    onChange={(e) => setFormData({...formData, level_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-bold"
                    style={{ color: formData.color || '#fff' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Theme Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="h-11 w-11 rounded-xl cursor-pointer bg-white/5 border border-white/10 p-1"
                    />
                    <input 
                      type="text" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase">Points Required <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="number" 
                  value={formData.points_required}
                  onChange={(e) => setFormData({...formData, points_required: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Discount (%) <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({...formData, discount_percent: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Free Trips <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={formData.free_trips}
                    onChange={(e) => setFormData({...formData, free_trips: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all min-h-[80px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#00ff9d] text-black font-bold text-sm hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
