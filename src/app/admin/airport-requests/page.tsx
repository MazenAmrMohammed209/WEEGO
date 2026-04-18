"use client";

import { useState, useEffect } from "react";
import { Search, Filter, PlaneLanding, Users, Briefcase, FileText, CheckCircle, XCircle, Clock, MapPin, Loader2, DollarSign } from "lucide-react";
import { fetchAdminAirportRequests } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";
import { RowActions } from "@/components/admin/RowActions";

export default function AdminAirportRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [editForm, setEditForm] = useState({ status: "pending", time: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCb = useCallback(() => fetchAdminAirportRequests(debouncedSearch, statusFilter), [debouncedSearch, statusFilter]);
  const { data: rawRequests, loading: isLoading, setData: setRawRequests } = useAdminRealtime("bookings", fetchCb);

  const stats = useMemo(() => {
    if (!rawRequests) return { total: 0, pending: 0, missingTickets: 0, assigned: 0, revenue: 0 };
    return {
      total: rawRequests.length,
      pending: rawRequests.filter(b => b.status === "pending").length,
      missingTickets: rawRequests.filter(b => !b.flight_number).length,
      assigned: rawRequests.filter(b => b.driver_id !== null).length,
      revenue: rawRequests.reduce((sum, b) => sum + (b.price_final || b.price_estimated || 0), 0)
    };
  }, [rawRequests]);

  const requests = useMemo(() => {
    if (!rawRequests) return [];
    return rawRequests.map((req: any) => {
      const passengerName = req.full_name || (req.users ? `${req.users.first_name} ${req.users.last_name}` : "Unknown Passenger");
      const statusText = req.status || "pending";
      const arrTime = req.arrival_time ? new Date(req.arrival_time) : new Date(req.scheduled_time || '');
      const timeFormatted = isNaN(arrTime.getTime()) ? "Unknown Time" : arrTime.toLocaleString();

      return {
        id: req.id.substring(0, 8).toUpperCase(),
        rawId: req.id,
        passenger: passengerName,
        flight: req.flight_number || "N/A",
        airport: req.pickup_location || "Airport",
        time: timeFormatted,
        rawTime: req.arrival_time || req.scheduled_time || '',
        pax: req.passengers || 1,
        luggage: req.luggage || 0,
        ticket: !!req.flight_number,
        status: statusText,
        notes: req.notes || ''
      };
    });
  }, [rawRequests]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return "bg-yellow-500/20 text-yellow-400";
    if (s === "accepted") return "bg-green-500/20 text-green-400";
    if (s === "canceled") return "bg-red-500/20 text-red-400";
    return "bg-white/10 text-white"; // default
  };

  const handleEditClick = (req: any) => {
    setEditForm({
      status: req.status,
      time: req.rawTime.substring(0, 16), // datetime-local format
      notes: req.notes
    });
    setEditingBooking(req);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking?.rawId) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: editForm.status,
          arrival_time: editForm.time || null,
          notes: editForm.notes || null,
        })
        .eq('id', editingBooking.rawId)
        .select()
        .single();

      if (error) throw error;

      if (setRawRequests) {
        setRawRequests((prev: any[]) => prev.map(r => r.id === editingBooking.rawId ? data : r));
      }

      toast.success("Booking updated successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update booking");
    } finally {
      setIsSaving(false);
      setEditingBooking(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setIsSaving(false);
  };

  const handleDelete = async (rawId: string) => {
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", rawId);
      if (error) throw error;
      if (setRawRequests) {
        setRawRequests((prev: any[]) => prev.filter(r => r.id !== rawId));
      }
      toast.success("Request deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Airport Pickup Requests</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Review and manage inbound flight transfers from the website form.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by Passenger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md hover:bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors outline-none cursor-pointer appearance-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 text-white">
        {[
          { label: "Total Requests", val: stats.total, col: "text-white" },
          { label: "Pending Approval", val: stats.pending, col: "text-yellow-500" },
          { label: "Missing Tickets", val: stats.missingTickets, col: "text-red-400" },
          { label: "Fully Assigned", val: stats.assigned, col: "text-[#00ff9d]" },
          { label: "Total Revenue", val: `$${stats.revenue.toLocaleString()}`, col: "text-green-400" },
        ].map((m, i) => (
          <div key={i} className="bg-[#0a0a0a]/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{m.label}</span>
            <span className={`text-2xl font-black ${m.col}`}>{m.val}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/5">
              <tr className="bg-black/40">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Flight Details</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Requirements</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-center">Ticket</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Status</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No airport requests found.
                  </td>
                </tr>
              ) : requests.map((req, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-white">{req.passenger}</p>
                      <p className="text-xs font-mono font-medium text-white/40 mt-1">{req.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#00ff9d]">
                        <PlaneLanding className="h-4 w-4" />
                        Flight {req.flight}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                        <MapPin className="h-3.5 w-3.5 text-white/40" />
                        {req.airport}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                        <Clock className="h-3.5 w-3.5 text-white/40" />
                        Arrival: {req.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <Users className="h-3.5 w-3.5 text-white/50" />
                        <span className="text-xs font-bold text-white">{req.pax}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <Briefcase className="h-3.5 w-3.5 text-white/50" />
                        <span className="text-xs font-bold text-white">{req.luggage}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {req.ticket ? (
                      <span className="text-xs font-bold text-blue-400 flex flex-col items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Provided
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-500/50 flex flex-col items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold w-max capitalize ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === "pending" && (
                        <button onClick={async () => {
                          const { data, error } = await supabase.from("bookings").update({ status: "accepted" }).eq("id", req.rawId).select().single();
                          if (!error && setRawRequests && data) {
                            setRawRequests((prev: any[]) => prev.map(r => r.id === req.rawId ? data : r));
                          }
                        }} className="bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 hover:bg-[#00ff9d] hover:text-black px-4 py-2 rounded-xl text-xs font-black transition-all mr-2">
                          Accept
                        </button>
                      )}
                      <RowActions
                        onEdit={() => handleEditClick(req)}
                        onDelete={() => handleDelete(req.rawId)}
                        itemsName="request"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Edit Booking</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Arrival Time</label>
                <input
                  type="datetime-local"
                  value={editForm.time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d] [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/60 mb-2">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#00ff9d]"
                  placeholder="Add notes here..."
                />
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="w-full mt-2 bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black font-black py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
