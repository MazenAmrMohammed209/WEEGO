"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Building, MessageSquare, X, Filter, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { RowActions } from "@/components/admin/RowActions";

interface RawCorporateAccount {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

interface CorporateAccount {
  id: string;
  name: string;
  contact_person: string;
  status: string;
  message: string;
  raw: RawCorporateAccount;
}

// Reusable Status Dropdown Component for Corporate Accounts
function StatusDropdown({ company, setCompanies }: { company: CorporateAccount, setCompanies: React.Dispatch<React.SetStateAction<CorporateAccount[]>> }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("corporate_accounts")
      .update({ status: newStatus })
      .eq("id", company.raw.id);
      
    if (error) {
      console.error("Failed to update status:", error);
      toast.error("Error updating status");
    } else {
      setCompanies((prev: CorporateAccount[]) => 
        prev.map(c => c.id === company.id ? { ...c, status: newStatus } : c)
      );
      toast.success("Status updated successfully");
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      default: return "bg-white/10 text-white/70 border-white/20 hover:bg-white/20";
    }
  };

  return (
    <select
      value={company.status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`appearance-none inline-flex w-fit items-center justify-center px-3 py-1.5 rounded-lg border text-xs font-medium uppercase tracking-wider text-center leading-[1.2] focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer disabled:opacity-50 transition-colors ${getStatusColor(company.status)}`}
    >
      <option value="pending" className="bg-[#0a0a0a] text-yellow-400">PENDING</option>
      <option value="success" className="bg-[#0a0a0a] text-green-400">SUCCESS</option>
      <option value="failed" className="bg-[#0a0a0a] text-red-400">FAILED</option>
    </select>
  );
}

export default function AdminB2BPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companies, setCompanies] = useState<CorporateAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [selectedMessage, setSelectedMessage] = useState<{name: string, message: string} | null>(null);

  // Edit and Delete state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CorporateAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    status: "pending",
    message: ""
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("corporate_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formattedCompanies = data.map((account: RawCorporateAccount) => ({
        id: `C-${String(account.id).substring(0, 4).toUpperCase()}`,
        name: account.company_name || "",
        contact_person: account.contact_person || "-",
        status: account.status || "pending",
        message: account.message || "",
        raw: account
      }));
      setCompanies(formattedCompanies);
    } else {
      console.error("Failed to fetch corporate accounts:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleEditInit = (company: CorporateAccount) => {
    setEditingCompany(company);
    setEditForm({
      company_name: company.raw.company_name || "",
      contact_person: company.raw.contact_person || "",
      email: company.raw.email || "",
      status: company.raw.status || "pending",
      message: company.raw.message || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setIsSubmitting(true);
    
    try {
      const payload = { ...editForm };
      
      const { data, error } = await supabase
        .from("corporate_accounts")
        .update(payload)
        .eq("id", editingCompany.raw.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? {
        ...c,
        name: data.company_name,
        contact_person: data.contact_person || "-",
        status: data.status,
        message: data.message,
        raw: data
      } : c));
      
      toast.success("Corporate account updated");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      toast.error(currentErr.message || "Failed to update corporate account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, rawId: string) => {
    try {
      const { error } = await supabase.from("corporate_accounts").delete().eq("id", rawId);
      if (error) throw error;
      
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success("Account deleted successfully");
    } catch (err: unknown) {
      const currentErr = err instanceof Error ? err : new Error(String(err));
      console.error(currentErr);
      toast.error(currentErr.message || "Failed to delete account");
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company: CorporateAccount) => {
      const matchSearch = 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === "all" || company.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [companies, searchQuery, statusFilter]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-12 relative animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Corporate Accounts</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage B2B partnership inquiries and messages.</p>
        </div>
      </div>

      {/* Unified Search + Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by Company Name or ID..." 
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
              <option value="pending" className="bg-[#0a0a0a]">Pending</option>
              <option value="success" className="bg-[#0a0a0a]">Success</option>
              <option value="failed" className="bg-[#0a0a0a]">Failed</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
          </div>
        </div>
      </div>

      {/* Corporate Table */}
      <div className="rounded-xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider w-1/3">Message</th>
                <th className="px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00ff9d]" />
                  </td>
                </tr>
              ) : paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50 font-medium text-sm">
                    No corporate accounts found.
                  </td>
                </tr>
              ) : paginatedCompanies.map((company, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Building className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{company.name}</p>
                        <p className="text-[11px] font-mono font-medium text-[#00ff9d]">{company.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-white/80 font-bold">{company.contact_person}</span>
                      <span className="text-[11px] text-white/40">{company.raw.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] lg:max-w-xs xl:max-w-md">
                    {company.message ? (
                      <div 
                        onClick={() => setSelectedMessage({ name: company.name, message: company.message })}
                        className="group/msg flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Click to view full message"
                      >
                         <MessageSquare className="h-4 w-4 text-white/30 group-hover/msg:text-[#00ff9d] shrink-0" />
                         <span className="text-xs text-white/60 group-hover/msg:text-white transition-colors truncate">
                           {company.message.length > 60 ? company.message.slice(0, 60) + "..." : company.message}
                         </span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/20 italic px-2">No message provided</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusDropdown company={company} setCompanies={setCompanies} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => handleEditInit(company)}
                      onDelete={() => handleDelete(company.id, company.raw.id)}
                      itemsName="account"
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

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-[#00ff9d]" />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inquiry Message</h3>
                   <p className="text-xs text-[#00ff9d] font-medium">{selectedMessage.name}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white/80 leading-relaxed font-medium">
                {selectedMessage.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-black text-white">Edit Corporate Account</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Company Name</label>
                <input required value={editForm.company_name} onChange={e => setEditForm({...editForm, company_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Contact Person</label>
                  <input required value={editForm.contact_person} onChange={e => setEditForm({...editForm, contact_person: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/70">Email</label>
                  <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none appearance-none">
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Message</label>
                <textarea value={editForm.message} onChange={e => setEditForm({...editForm, message: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#00ff9d]/50 focus:outline-none resize-none" />
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
