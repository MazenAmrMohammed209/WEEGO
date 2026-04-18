"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, DollarSign, Receipt, Building, Calendar, CheckCircle, Clock, AlertCircle, Download, Loader2, Plus, X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/Skeleton";

function StatusDropdown({ invoice, setInvoices }: { invoice: any, setInvoices: any }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoice.id);
      
    if (error) {
      console.error("Failed to update status:", error);
      toast.error("Error updating status");
    } else {
      setInvoices((prev: any[]) => 
        prev.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus } : inv)
      );
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "active": return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
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
      <option value="success" className="bg-[#0a0a0a] text-green-400">SUCCESS</option>
      <option value="pending" className="bg-[#0a0a0a] text-yellow-400">PENDING</option>
      <option value="failed" className="bg-[#0a0a0a] text-red-400">FAILED</option>
      <option value="active" className="bg-[#0a0a0a] text-green-400">ACTIVE</option>
    </select>
  );
}

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    company_name: "",
    amount: "",
    paid_date: "",
    due_date: "",
    status: "pending"
  });

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setInvoices(data);
      } else {
        console.error("Failed to fetch invoices:", error);
      }
    } catch (err) {
      console.error("fetchInvoices error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const invoice_code = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newInvoiceData = {
        company_name: formData.company_name,
        invoice_code: invoice_code,
        amount: parseFloat(formData.amount),
        paid_date: formData.paid_date || null,
        due_date: formData.due_date || null,
        status: formData.status
      };

      const { data, error } = await supabase
        .from("invoices")
        .insert([newInvoiceData])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Error creating invoice: " + error.message);
        return;
      }

      if (data) {
        setInvoices(prev => [data, ...prev]);
        setIsModalOpen(false);
        setFormData({
          company_name: "",
          amount: "",
          paid_date: "",
          due_date: "",
          status: "pending"
        });
      }
    } catch (err: any) {
      console.error("Unexpected error during invoice creation:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = 
        (inv.invoice_code?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (inv.company_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Reset page relative to valid search results
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
      .filter((inv) => inv.status === "success")
      .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const pendingCount = invoices.filter((inv) => inv.status === "pending").length;
    const failedCount = invoices.filter((inv) => inv.status === "failed").length;
    
    return { totalRevenue, pendingCount, failedCount, totalTransactions: invoices.length };
  }, [invoices]);



  const handleExport = () => {
    if (!filteredInvoices.length) return;
    const exportData = filteredInvoices.map((inv) => ({
      "Invoice Code": inv.invoice_code || "-",
      "Company": inv.company_name || "-",
      "Amount": inv.amount || 0,
      "Paid Date": inv.paid_date || "-",
      "Due Date": inv.due_date || "-",
      "Status": inv.status || "-"
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "finance_export.xlsx");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Finance & Invoices</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage B2B billing, track revenue, and monitor payment statuses.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExport} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
             <Download className="h-4 w-4" /> Export Excel
           </button>
           <button onClick={() => setIsModalOpen(true)} className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2">
             <Plus className="h-4 w-4" /> Create Invoice
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Total Revenue", val: `$${cardsData.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: "text-white" },
           { label: "Pending Payments", val: cardsData.pendingCount.toString(), icon: Clock, color: "text-yellow-500" },
           { label: "Failed / Overdue", val: cardsData.failedCount.toString(), icon: AlertCircle, color: "text-red-500" },
           { label: "Total Transactions", val: cardsData.totalTransactions.toString(), icon: CheckCircle, color: "text-[#00ff9d]" },
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
              placeholder="Search by Invoice Code or Company Name..." 
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
              <option value="success" className="bg-[#0a0a0a]">Success</option>
              <option value="pending" className="bg-[#0a0a0a]">Pending</option>
              <option value="failed" className="bg-[#0a0a0a]">Failed</option>
              <option value="active" className="bg-[#0a0a0a]">Active</option>
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
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Invoice Code</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <TableSkeleton rows={5} columns={5} />
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-white/50 font-medium text-sm">
                    No payment records found.
                  </td>
                </tr>
              ) : paginatedInvoices.map((inv: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <Receipt className="h-5 w-5 text-white/30" />
                       <span className="font-mono text-xs font-bold text-[#00ff9d]">{inv.invoice_code || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/50">
                          <Building className="h-4 w-4" />
                       </div>
                       <span className="font-bold text-white">{inv.company_name || "-"}</span>
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
                         <span className="w-10 opacity-50 uppercase font-bold tracking-wider text-[10px]">Paid</span> {inv.paid_date || "-"}
                       </div>
                       <div className={`flex items-center gap-2 ${inv.status === 'failed' ? 'text-red-400 font-bold' : 'text-white/60'}`}>
                         <span className="w-10 opacity-50 uppercase font-bold tracking-wider text-[10px]">Due</span> {inv.due_date || "-"}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusDropdown invoice={inv} setInvoices={setInvoices} />
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white">Create New Invoice</h2>
                <p className="text-xs text-white/40 mt-1">Fill out the details to generate an invoice.</p>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase">Company Name <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase">Amount (USD) <span className="text-red-500">*</span></label>
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
                  <label className="text-xs font-bold text-white/70 uppercase">Paid Date</label>
                  <input 
                    type="date"
                    value={formData.paid_date}
                    onChange={(e) => setFormData({...formData, paid_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase">Due Date</label>
                  <input 
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 uppercase">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
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
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
