"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, DollarSign, Receipt, User, Calendar, CheckCircle, Clock, AlertCircle, Download, Loader2, Plus, X, ChevronDown, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { RowActions } from "@/components/admin/RowActions";

interface InvoiceRecord {
  id: string;
  reference_number?: string;
  customer_name?: string;
  customer_email?: string;
  amount?: number | string;
  payment_date?: string;
  status: string;
  [key: string]: unknown;
}

function StatusDropdown({ invoice, onStatusUpdate }: { invoice: InvoiceRecord, onStatusUpdate: (referenceNumber: string, newStatus: string) => Promise<void> }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    if (invoice.reference_number) {
      await onStatusUpdate(invoice.reference_number, newStatus);
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      default: return "bg-white/10 text-white/70 border-white/20 hover:bg-white/20";
    }
  };

  return (
    <select
      value={invoice.status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`appearance-none w-fit inline-flex items-center justify-center px-3 py-1.5 rounded-lg border text-xs font-medium uppercase tracking-wider text-center leading-[1.2] focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer disabled:opacity-50 transition-colors ${getStatusColor(invoice.status)}`}
    >
      <option value="paid" className="bg-[#0a0a0a] text-green-400">PAID</option>
      <option value="pending" className="bg-[#0a0a0a] text-yellow-400">PENDING</option>
      <option value="cancelled" className="bg-[#0a0a0a] text-red-400">CANCELLED</option>
    </select>
  );
}

export default function AdminFinancePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["financeData"],
    queryFn: async () => {
      const { fetchFinanceData } = await import("@/lib/supabaseActions");
      return await fetchFinanceData();
    }
  });

  const invoices = data?.invoices || [];
  const totalPoints = data?.totalPoints || 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We use reference_number as the primary identifier for editing
  const [editingReferenceNumber, setEditingReferenceNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and Validation States
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    reference_number: "",
    customer_name: "",
    customer_email: "",
    amount: "",
    payment_date: "",
    status: "pending"
  });

  const searchBookings = async (value: string) => {
    try {
      if (!value) {
        setResults([]);
        return;
      }

      setLoadingSearch(true);
      const clean = value.trim();

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          reference_number,
          customer_name,
          customer_email,
          full_name
        `)
        .or(`reference_number.ilike.%${clean}%,customer_email.ilike.%${clean}%,customer_name.ilike.%${clean}%`)
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        return;
      }

      setResults(data || []);
    } catch (err) {
      console.error("Search crash:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchBookings(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const calculatePoints = (amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return 0;
    return Math.floor(amount / 100) * 10;
  };



  const handleStatusUpdate = async (referenceNumber: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("reference_number", referenceNumber);
      
      if (error) throw error;
      toast.success("Status updated successfully");
      await fetchInvoicesAndPoints();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Error updating status");
    }
  };

  const handleAddOrEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference_number) {
      toast.error("Reference number is required");
      return;
    }

    if (!selectedBooking && !editingReferenceNumber) {
      toast.error("Please select a booking from the dropdown");
      return;
    }

    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Missing required customer data (name or email).");
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Submitting invoice:", formData);
      console.log("BOOKING DATA:", selectedBooking);

      const pointsToAdd = calculatePoints(formData.amount);
      const payload = {
        reference_number: formData.reference_number,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        amount: parseFloat(formData.amount),
        payment_date: new Date().toISOString(),
        status: formData.status
      };

      if (editingReferenceNumber) {
        const { error } = await supabase
          .from("invoices")
          .update(payload)
          .eq("reference_number", editingReferenceNumber);

        if (error) {
           console.error("Supabase Error:", error.message, error.details);
           throw error;
        }
        toast.success("Invoice updated successfully");
      } else {
        const { error } = await supabase
          .from("invoices")
          .insert([payload]);

        if (error) {
           console.error("Supabase Error:", error.message, error.details);
           throw error;
        }

        if (pointsToAdd > 0) {
           toast.success(`Invoice created! ${pointsToAdd} loyalty points awarded via system.`);
        } else {
           toast.success("Invoice created successfully");
        }
      }

      await fetchInvoicesAndPoints();
      resetForm();
    } catch (err: unknown) {
      console.error("FULL ERROR:", JSON.stringify(err, null, 2));
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingReferenceNumber(null);
    setFormData({
      reference_number: "",
      customer_name: "",
      customer_email: "",
      amount: "",
      payment_date: "",
      status: "pending"
    });
    setSearch("");
    setResults([]);
    setSelectedBooking(null);
  };

  const handleEditInit = (inv: InvoiceRecord) => {
    if (!inv.reference_number) {
       toast.error("Cannot edit this invoice: missing Reference Number.");
       return;
    }
    
    setEditingReferenceNumber(inv.reference_number);
    setSearch(inv.reference_number || "");
    setFormData({
      reference_number: inv.reference_number,
      customer_name: inv.customer_name || "",
      customer_email: inv.customer_email || "",
      amount: inv.amount?.toString() || "",
      payment_date: inv.payment_date || "",
      status: inv.status || "pending"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (referenceNumber: string) => {
    if (!referenceNumber) return;
    
    try {
      console.log("DELETE ID:", referenceNumber);
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("reference_number", referenceNumber);
        
      if (error) {
        console.error("DELETE ERROR:", error);
        return;
      }
      toast.success("Invoice deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["financeData"] });
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error("Failed to delete invoice");
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = 
        (inv.reference_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (inv.customer_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (inv.customer_email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const cardsData = useMemo(() => {
    const totalRevenue = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((acc, curr) => acc + (parseFloat(curr.amount as string) || 0), 0);
    
    return { totalRevenue, totalTransactions: invoices.length };
  }, [invoices]);

  const handleExport = () => {
    if (!filteredInvoices.length) return;
    const exportData = filteredInvoices.map((inv) => ({
      "Reference Number": inv.reference_number || "-",
      "Customer Name": inv.customer_name || "-",
      "Customer Email": inv.customer_email || "-",
      "Amount": inv.amount || 0,
      "Payment Date": inv.payment_date || "-",
      "Status": inv.status || "-"
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "finance_export.xlsx");
  };

  const pointsPreview = calculatePoints(formData.amount);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Finance & Rewards</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage billing and track customer loyalty points automatically.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExport} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
             <Download className="h-4 w-4" /> Export
           </button>
           <button onClick={() => {
             resetForm();
             setIsModalOpen(true);
           }} className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2">
             <Plus className="h-4 w-4" /> Create Invoice
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
           { label: "Total Revenue", val: `$${cardsData.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: "text-white" },
           { label: "Total Points Issued", val: totalPoints.toLocaleString(), icon: Award, color: "text-yellow-500" },
           { label: "Total Invoices", val: cardsData.totalTransactions.toString(), icon: Receipt, color: "text-[#00ff9d]" },
         ].map((m, i) => (
            <div key={i} className="bg-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <m.icon className="w-32 h-32" />
               </div>
               <div className="flex items-center gap-3 mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${m.color}`}>
                     <m.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{m.label}</span>
               </div>
               <span className={`text-3xl font-black ${m.color} drop-shadow-lg`}>{m.val}</span>
            </div>
         ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by Code, Name, or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-medium"
            />
          </div>
          <div className="relative min-w-[160px] shrink-0 h-[46px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-full appearance-none bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm font-bold text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#0a0a0a]">All Statuses</option>
              <option value="paid" className="bg-[#0a0a0a]">Paid</option>
              <option value="pending" className="bg-[#0a0a0a]">Pending</option>
              <option value="cancelled" className="bg-[#0a0a0a]">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#050505] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Reference Number</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-center">Status</th>
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
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No payment records found.
                  </td>
                </tr>
              ) : paginatedInvoices.map((inv: InvoiceRecord, idx: number) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <Receipt className="h-5 w-5 text-white/30" />
                       <span className="font-mono text-xs font-bold text-[#00ff9d]">{inv.reference_number || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/50">
                          <User className="h-4 w-4" />
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-white text-sm">{inv.customer_name || "-"}</span>
                         <span className="text-xs text-white/50">{inv.customer_email || "-"}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-black text-white tracking-tight">
                        ${Number(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 text-xs font-medium">
                       <div className="flex items-center gap-2 text-white/60">
                         <Calendar className="h-3 w-3 opacity-50" /> {inv.payment_date || "-"}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusDropdown invoice={inv} onStatusUpdate={handleStatusUpdate} />
                  </td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => handleEditInit(inv)}
                      onDelete={() => handleDelete(inv.reference_number!)}
                      itemsName="invoice"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            if (!isSubmitting) resetForm();
          }} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">{editingReferenceNumber ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                <p className="text-xs text-white/40 mt-1">Enter Reference Number to auto-fill details.</p>
              </div>
              <button onClick={() => {
                if (!isSubmitting) resetForm();
              }} className="text-white/40 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEditInvoice} className="p-6 space-y-5">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-white/70 uppercase flex justify-between items-center">
                  <span>REFERENCE NUMBER <span className="text-red-500">*</span></span>
                  {loadingSearch && <Loader2 className="h-3 w-3 animate-spin text-white/50" />}
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input 
                      required
                      type="text" 
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setFormData({...formData, reference_number: e.target.value});
                        if (!e.target.value) setSelectedBooking(null);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all font-mono"
                      placeholder="Search by reference, email or name"
                    />
                  </div>

                  {results.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                      {results.map((item) => (
                        <div
                          key={item.reference_number}
                          onClick={() => {
                            setSelectedBooking(item);
                            setSearch(item.reference_number);

                            setFormData(prev => ({
                              ...prev,
                              reference_number: item.reference_number,
                              customer_name: item.customer_name || item.full_name || "",
                              customer_email: item.customer_email || ""
                            }));

                            setResults([]);
                          }}
                          className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-[#00ff9d] font-mono text-sm">{item.reference_number}</strong>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                            <User className="h-3 w-3" />
                            <span className="truncate">{item.customer_name || item.full_name || "Unknown"}</span>
                            <span className="text-white/20">•</span>
                            <span className="truncate">{item.customer_email || "No Email"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedBooking && <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Booking Selected</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Customer Name <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Customer Email <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="email" 
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white/70 uppercase">Paid Amount (EGP) <span className="text-red-500">*</span></label>
                  {!editingReferenceNumber && pointsPreview > 0 && (
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="h-3 w-3" /> +{pointsPreview} Points
                    </span>
                  )}
                </div>
                <input 
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Payment Date <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Status <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) resetForm();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || (!selectedBooking && !editingReferenceNumber)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#00ff9d] text-black font-bold text-sm hover:bg-[#00e68d] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : editingReferenceNumber ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
