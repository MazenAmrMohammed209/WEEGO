"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, MoreVertical, MapPin, Calendar, Clock, Car, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { fetchAllBookings, fetchAdminDrivers } from "@/lib/supabaseActions";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RowActions } from "@/components/admin/RowActions";
import { createPortal } from "react-dom";

interface BookingRecord {
  id: string;
  dbId: string;
  driver_id?: string;
  passenger?: string;
  phone?: string;
  passengers_count?: string | number;
  luggage_count?: string | number;
  pickup?: string;
  dropoff?: string;
  date?: string;
  rawDate?: string;
  time?: string;
  vehicle_category?: string;
  category_id?: string;
  vehicle_id?: string;
  status: string;
  note?: string;
  customerId?: string;
  created_at?: string | number | Date;
  pickup_location?: string;
  dropoff_location?: string;
  customer_name?: string;
  customer_phone?: string;
  users?: any;
  reference_number?: string;
  [key: string]: unknown;
}

interface RawUserRecord {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

interface DriverRecord {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
}

function DriverDropdown({ booking, drivers, updateDriver }: { booking: BookingRecord, drivers: DriverRecord[], updateDriver: (bookingId: string, driverId: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = async (driverId: string | null) => {
    setIsUpdating(true);
    await updateDriver(booking.dbId, driverId);
    setIsUpdating(false);
    setIsOpen(false);
  };

  const currentDriver = drivers.find(d => d.id === booking.driver_id);
  const filteredDrivers = drivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render modal content
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Assign Driver</h3>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input 
              type="text"
              autoFocus
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00ff9d] transition-colors"
            />
          </div>
        </div>

        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2">
          <button onClick={() => handleSelect(null)} className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors font-bold mb-2">
            Unassign Driver
          </button>
          
          {filteredDrivers.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-sm font-medium">No drivers found</div>
          ) : (
            <div className="space-y-1">
              {filteredDrivers.map(driver => (
                <button 
                  key={driver.id} 
                  onClick={() => handleSelect(driver.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between rounded-lg transition-colors group ${booking.driver_id === driver.id ? 'bg-[#00ff9d]/10 border border-[#00ff9d]/20' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <span className={`font-semibold truncate ${booking.driver_id === driver.id ? 'text-[#00ff9d]' : 'text-white/80 group-hover:text-white'}`}>
                    {driver.name}
                  </span>
                  {driver.status === 'active' || driver.status === 'available' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] shrink-0" title="Available"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" title="Busy"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        disabled={isUpdating}
        className={`flex items-center justify-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${currentDriver ? 'text-black border-[#00ff9d] bg-[#00ff9d] hover:bg-[#00e68d]' : 'text-white/50 border-dashed border-white/20 hover:border-white/40 hover:text-white'}`}
      >
        <User className={`h-3.5 w-3.5 ${currentDriver ? 'text-black' : 'text-white/40'}`} />
        {isUpdating ? 'Wait...' : currentDriver ? currentDriver.name : 'Assign Driver'}
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    pickup_location: "",
    dropoff_location: "",
    passengers: 1,
    luggage: 0,
    category_id: "",
    vehicle_id: "",
    scheduled_time: "",
    status: "pending",
    note: ""
  });

  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["adminBookings", currentPage, searchQuery, selectedStatus, selectedDate],
    queryFn: async () => {
      const { data, count, error } = await fetchAllBookings(currentPage, itemsPerPage, searchQuery, selectedStatus, selectedDate);
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }
  });

  const rawBookings = queryData?.data || [];
  const totalCount = queryData?.count || 0;

  const { data: driversData } = useQuery({
    queryKey: ["adminDrivers"],
    queryFn: async () => {
      const { data, error } = await fetchAdminDrivers();
      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["vehicleCategories"],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicle_categories').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const [selectedUser, setSelectedUser] = useState<RawUserRecord | null>(null);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("admin_bookings_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        async () => {
          queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  async function openUserModal(userId: string) {
    if (!userId) return;
    setIsModalLoading(true);
    try {
      // fetch user info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      // fetch user bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, vehicle_categories(id, name, capacity)')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
        
      setSelectedUser(user);
      setUserBookings(bookings || []);
    } catch (err) {
      console.error("Failed to load user info", err);
    } finally {
      setIsModalLoading(false);
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditInit = (b: BookingRecord) => {
    setEditingBooking(b);
    setEditFormData({
      pickup_location: b.pickup || "",
      dropoff_location: b.dropoff || "",
      passengers: Number(b.passengers_count) || 1,
      luggage: Number(b.luggage_count) || 0,
      category_id: b.category_id || "",
      vehicle_id: b.vehicle_id || "",
      scheduled_time: b.rawDate ? new Date(b.rawDate).toISOString().slice(0, 16) : "",
      status: b.status || "pending",
      note: b.note || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking?.dbId) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({
          pickup_location: editFormData.pickup_location,
          dropoff_location: editFormData.dropoff_location,
          passengers: editFormData.passengers,
          luggage: editFormData.luggage,
          scheduled_time: new Date(editFormData.scheduled_time).toISOString(),
          vehicle_id: editFormData.vehicle_id || null,
          category_id: editFormData.category_id || null,
          status: editFormData.status,
          note: editFormData.note || null
        })
        .eq("id", editingBooking.dbId)
        .select()
        .single();
        
      if (error) {
        console.error("Booking error details:", error);
        throw error;
      }
      queryClient.setQueryData(
        ["adminBookings", currentPage, searchQuery, selectedStatus, selectedDate], 
        (old: any) => {
          if (!old) return { data: [data], count: 1 };
          return {
            count: old.count,
            data: old.data.map((b: any) => b.id === editingBooking.dbId ? data : b)
          };
        }
      );
      await queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      showToast("Booking updated successfully", "success");
      setIsEditModalOpen(false);
      setEditingBooking(null);
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      showToast(currentErr.message || "Failed to update booking", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingBooking(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("DELETE ID:", id);
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) {
        console.error("DELETE ERROR:", error);
        throw error;
      }
      queryClient.setQueryData(
        ["adminBookings", currentPage, searchQuery, selectedStatus, selectedDate], 
        (old: any) => {
          if (!old) return { data: [], count: 0 };
          return {
            count: Math.max(0, old.count - 1),
            data: old.data.filter((b: any) => b.id !== id)
          };
        }
      );
      await queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      showToast("Booking deleted successfully", "success");
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      showToast(currentErr.message || "Failed to delete booking", "error");
    }
  };

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    if (!bookingId) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus.toLowerCase() })
        .eq('id', bookingId);
        
      if (error) {
        console.error("Update failed:", error.message);
      } else {
        queryClient.setQueryData(
          ["adminBookings", currentPage, searchQuery, selectedStatus, selectedDate], 
          (old: any) => {
            if (!old) return old;
            return {
              count: old.count,
              data: old.data.map((b: any) => b.id === bookingId ? { ...b, status: newStatus.toLowerCase() } : b)
            };
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateDriverAssignment(bookingId: string, driverId: string | null) {
      try {
        const { error, data } = await supabase
          .from('bookings')
          .update({ driver_id: driverId })
          .eq('id', bookingId)
          .select('*, users(first_name, last_name, phone), drivers(id, name, status)')
          .single();
          
        if (error) {
          console.error("Failed to assign driver:", error);
          showToast(error.message, "error");
        } else {
          queryClient.setQueryData(
            ["adminBookings", currentPage, searchQuery, selectedStatus, selectedDate], 
            (old: any) => {
              if (!old) return old;
              return {
                count: old.count,
                data: old.data.map((b: any) => b.id === bookingId ? data : b)
              };
            }
          );
          await queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
          showToast("Driver assigned successfully", "success");
        }
      } catch (err: unknown) {
        console.error(err);
      }
  }

  const bookings = useMemo(() => {
    if (!rawBookings) return [];
    return rawBookings.map((b: Record<string, any>) => {
      const dt = new Date(b.scheduled_time);
      const passengerName = b.customer_name || (b.users ? `${b.users.first_name} ${b.users.last_name}` : "Unknown");
      const phone = b.customer_phone || (b.users ? b.users.phone : "Unknown");
      return {
         id: b.reference_number || (b.id ? b.id.substring(0,8) : 'UNK'),
         passenger: passengerName,
         phone: phone || "No Phone",
         passengers_count: b.passengers || "-",
         luggage_count: b.luggage || "-",
         pickup: b.pickup_location,
         dropoff: b.dropoff_location,
         date: dt.toLocaleDateString(),
         rawDate: b.scheduled_time,
         time: dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
         vehicle_category: b.vehicle_categories?.name || "Standard",
         category_id: b.category_id || "",
         vehicle_id: b.vehicle_id || "",
         driver_id: b.driver_id,
         status: b.status || "pending",
         note: b.note || "",
         customerId: b.customer_id,
         dbId: b.id
      };
    });
  }, [rawBookings]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "accepted": return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      default: return "bg-white/10 text-white/70 border-white/20 hover:bg-white/20";
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDate]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedBookings = bookings;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bookings Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1">View, edit, and manage all passenger trips.</p>
        </div>

      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center justify-center gap-2 px-6 py-3 backdrop-blur-md border rounded-xl text-sm font-bold transition-colors shrink-0 h-[46px] ${showFilters ? 'bg-white/10 border-[#00ff9d] text-[#00ff9d]' : 'bg-[#0a0a0a]/80 border-white/10 text-white hover:bg-white/5'}`}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/50 outline-none appearance-none"
              >
                <option value="all" className="bg-[#0a0a0a]">All Statuses</option>
                <option value="pending" className="bg-[#0a0a0a]">Pending</option>
                <option value="accepted" className="bg-[#0a0a0a]">Accepted</option>
                <option value="rejected" className="bg-[#0a0a0a]">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Date</label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/50 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setSearchQuery(""); setSelectedStatus("all"); setSelectedDate(""); }} className="w-full px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-bold transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Route Details</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10">
                    <TableSkeleton rows={5} columns={7} />
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No bookings found.
                  </td>
                </tr>
              ) : paginatedBookings.map((booking, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm font-bold text-white/80 group-hover:text-[#00ff9d] transition-colors">{booking.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-white/50" />
                      </div>
                      <div>
                        <button 
                          onClick={() => openUserModal(booking.customerId)}
                          disabled={!booking.customerId || isModalLoading}
                          className="text-sm font-bold text-white max-w-[150px] truncate hover:text-[#00ff9d] transition-colors text-left disabled:opacity-50 disabled:hover:text-white"
                        >
                          {booking.passenger}
                        </button>
                        <p className="text-xs font-medium text-white/40 max-w-[150px] truncate">{booking.phone}</p>
                        <div className="flex gap-2.5 mt-1.5">
                          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/70 uppercase">Pax: {booking.passengers_count}</span>
                          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/70 uppercase">Bags: {booking.luggage_count}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex flex-col items-center gap-1">
                         <div className="h-2 w-2 rounded-full bg-[#00ff9d]" />
                         <div className="h-4 w-px bg-white/20" />
                         <MapPin className="h-3 w-3 text-red-500" />
                      </div>
                      <div className="flex flex-col gap-2">
                         <p className="text-xs font-semibold text-white truncate max-w-[200px]">{booking.pickup}</p>
                         <p className="text-xs font-semibold text-white truncate max-w-[200px]">{booking.dropoff}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                        <Calendar className="h-3.5 w-3.5 text-white/40" />
                        {booking.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                        <Clock className="h-3.5 w-3.5 text-white/40" />
                        {booking.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-white/50">
                        <Car className="h-3.5 w-3.5" />
                        <span className="font-medium">{booking.vehicle_category}</span>
                      </div>
                      <DriverDropdown booking={booking} drivers={driversData || []} updateDriver={updateDriverAssignment} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <select
                      value={booking.status.toLowerCase()}
                      onChange={(e) => updateBookingStatus(booking.dbId, e.target.value)}
                      className={`appearance-none inline-flex w-fit items-center justify-center px-3 py-1.5 rounded-lg border text-xs font-medium uppercase tracking-wider text-center leading-[1.2] focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer transition-colors ${getStatusColor(booking.status)} outline-none`}
                    >
                      <option value="pending" className="bg-[#0a0a0a] text-yellow-400">PENDING</option>
                      <option value="accepted" className="bg-[#0a0a0a] text-green-400">ACCEPTED</option>
                      <option value="rejected" className="bg-[#0a0a0a] text-red-400">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => handleEditInit(booking)}
                      onDelete={() => handleDelete(booking.dbId)}
                      itemsName="booking"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination System */}
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
      
      {/* User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedUser.avatar_url ? (
                     <img src={selectedUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <User className="h-4 w-4 text-white/50" />
                  )}
                </div>
                {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase mb-1">Contact Phone</p>
                  <p className="text-sm font-semibold text-white">📞 {selectedUser.phone || "No phone listed"}</p>
                </div>
                {selectedUser.phone && (
                  <a 
                    href={`https://wa.me/${selectedUser.phone}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 rounded-lg text-sm font-bold transition-colors"
                  >
                    WhatsApp Contact
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Trip History ({userBookings.length})</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {userBookings.length === 0 ? (
                    <p className="text-sm text-white/50">No trips recorded for this user.</p>
                  ) : (
                    userBookings.map(b => (
                      <div key={b.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-white/80 line-clamp-2">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs text-[#00ff9d] px-2 py-0.5 rounded bg-[#00ff9d]/10 uppercase font-bold tracking-widest truncate">{b.status}</span>
                           <span className="text-xs text-white/40 shrink-0">{new Date(b.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <MapPin className="h-3 w-3 text-white/50 shrink-0" />
                           <span className="truncate">{b.pickup_location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <MapPin className="h-3 w-3 text-white/50 shrink-0" />
                           <span className="truncate">{b.dropoff_location}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 pb-12 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <div className="max-h-[85vh] overflow-y-auto custom-scrollbar rounded-3xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
              <h2 className="text-xl font-black text-white">Edit Booking</h2>
              <button type="button" onClick={handleCancelEdit} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Scheduled Time</label>
                  <input required type="datetime-local" value={editFormData.scheduled_time} onChange={e => setEditFormData({...editFormData, scheduled_time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none [color-scheme:dark]" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Pickup Location</label>
                  <input required value={editFormData.pickup_location} onChange={e => setEditFormData({...editFormData, pickup_location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Dropoff Location</label>
                  <input required value={editFormData.dropoff_location} onChange={e => setEditFormData({...editFormData, dropoff_location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Passengers</label>
                  <input required type="number" min="1" value={editFormData.passengers} onChange={e => setEditFormData({...editFormData, passengers: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Luggage</label>
                  <input required type="number" min="0" value={editFormData.luggage} onChange={e => setEditFormData({...editFormData, luggage: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Vehicle Category</label>
                  <select required value={editFormData.category_id} onChange={e => setEditFormData({...editFormData, category_id: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                    <option value="">Select Category...</option>
                    {categories.map((cat: Record<string, any>) => (
                      <option key={cat.id} value={cat.id}>{cat.name} (Max {cat.capacity})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Vehicle ID (Optional)</label>
                  <input type="text" value={editFormData.vehicle_id} onChange={e => setEditFormData({...editFormData, vehicle_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" placeholder="e.g. uuid-of-vehicle" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Status</label>
                  <select value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-white/70">Notes</label>
                  <textarea value={editFormData.note} onChange={e => setEditFormData({...editFormData, note: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none resize-none" rows={3} placeholder="Add any special notes or requests here..." />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-[#00ff9d] hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Booking'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-bold animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-[#00ff9d] text-black' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
