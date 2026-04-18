"use client";

import { useState, useMemo } from "react";
import { Search, Filter, HelpCircle, User, Calendar, MessageSquare, AlertTriangle, ArrowRight, Loader2, X } from "lucide-react";
import { fetchAdminTickets } from "@/lib/supabaseActions";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { RowActions } from "@/components/admin/RowActions";

interface TicketRecord {
  id: string;
  rawId: string;
  raw: Record<string, unknown>;
  customer: string;
  subject: string;
  status: string;
  assigned: string;
  date: string;
  prior: string;
}

export default function AdminTicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketRecord | null>(null);
  const [editForm, setEditForm] = useState({ subject: "", status: "Open", priority: "Medium" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawTickets, loading: isLoading } = useAdminRealtime("support_tickets", fetchAdminTickets);

  const tickets = useMemo(() => {
    if (!rawTickets) return [];
    
    return rawTickets.map((t: Record<string, any>) => {
      let customerName = "Unknown Customer";
      if (t.users) {
        customerName = `${t.users.first_name || ""} ${t.users.last_name || ""}`.trim();
      }

      const dateCreated = new Date(t.created_at);
      const hoursAgo = Math.floor((new Date().getTime() - dateCreated.getTime()) / (1000 * 60 * 60));
      let dateString = `${hoursAgo} hrs ago`;
      if (hoursAgo > 24) dateString = `${Math.floor(hoursAgo / 24)} days ago`;
      else if (hoursAgo === 0) dateString = "Just now";

      return {
        id: `T-${t.id.substring(0, 4).toUpperCase()}`,
        rawId: t.id,
        raw: t,
        customer: customerName,
        subject: t.subject,
        status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Open",
        assigned: "Unassigned", // To be implemented later with staff assignment
        date: dateString,
        prior: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : "Medium",
      };
    });
  }, [rawTickets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "In Progress": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Closed": return "bg-white/5 text-white/40 border-white/10";
      default: return "";
    }
  };

  const getPriorityBadge = (p: string) => {
     switch (p) {
        case "High": return "text-red-500";
        case "Medium": return "text-yellow-500";
        case "Low": return "text-blue-400";
        default: return "";
     }
  }

  const handleEditInit = (t: TicketRecord) => {
    setEditingTicket(t);
    setEditForm({
      subject: t.subject || "",
      status: t.status || "Open",
      priority: t.prior || "Medium",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .update({
          subject: editForm.subject,
          status: editForm.status.toLowerCase(),
          priority: editForm.priority.toLowerCase()
        })
        .eq("id", editingTicket.rawId)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Ticket updated successfully");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      toast.error(currentErr.message || "Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rawId: string) => {
    try {
      const { error } = await supabase.from("support_tickets").delete().eq("id", rawId);
      if (error) throw error;
      toast.success("Ticket deleted successfully");
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      toast.error(currentErr.message || "Failed to delete ticket");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Support Tickets</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage customer issues, complaints, and corporate inquiries.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by Ticket ID, Customer, or Subject..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors h-full">
          <Filter className="h-4 w-4" />
          Priority
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#000000] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider w-16">ID</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Customer & Subject</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00ff9d]" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No support tickets found.
                  </td>
                </tr>
              ) : tickets.map((t, idx) => (
                <tr key={idx} className={`hover:bg-white/[0.02] transition-colors group ${t.status === 'Closed' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-5">
                     <span className="font-mono text-xs font-bold text-white/50">{t.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                       <p className="text-sm font-bold text-white max-w-sm truncate text-wrap flex items-center gap-2">
                         <MessageSquare className="h-3 w-3 text-[#00ff9d] shrink-0" /> {t.subject}
                       </p>
                       <p className="text-xs text-white/50 flex items-center gap-2">
                         <User className="h-3 w-3" /> {t.customer} • <Calendar className="h-3 w-3 ml-2" /> {t.date}
                       </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${getPriorityBadge(t.prior)}`}>
                        {t.prior === 'High' && <AlertTriangle className="h-3 w-3" />}
                        {t.prior}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider inline-block ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 border-l border-white/5 bg-white/[0.01]">
                     <span className={`text-xs font-bold flex items-center gap-2 ${t.assigned === 'Unassigned' ? 'text-white/30 italic' : 'text-white/80'}`}>
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                          <User className="h-3 w-3 text-white/50" />
                        </div>
                        {t.assigned}
                     </span>
                  </td>
                  <td className="px-6 py-5 text-right relative bg-white/[0.01]">
                    <RowActions
                      onEdit={() => handleEditInit(t)}
                      onDelete={() => handleDelete(t.rawId)}
                      itemsName="ticket"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-black text-white">Edit Ticket</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Subject</label>
                <input required value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-[#00ff9d] hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
