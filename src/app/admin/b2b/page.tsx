"use client";

import { useState } from "react";
import { Search, Plus, Filter, Briefcase, Users, FileText, CheckCircle2, Building, X, MoreVertical } from "lucide-react";

export default function AdminB2BPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const companies = [
    { id: "C-001", name: "Vodafone Egypt", plan: "Enterprise Premium", employees: 450, contracts: "Active (3)", invoices: "Up to date", status: "Active" },
    { id: "C-002", name: "Orange Telecom", plan: "Corporate Standard", employees: 120, contracts: "Active (1)", invoices: "Pending (1)", status: "Active" },
    { id: "C-003", name: "Etisalat Misr", plan: "Enterprise Premium", employees: 300, contracts: "Expired", invoices: "Up to date", status: "Inactive" },
    { id: "C-004", name: "WE Telecom", plan: "Basic Business", employees: 50, contracts: "Active (1)", invoices: "Up to date", status: "Active" },
  ];

  return (
    <div className="space-y-8 pb-12 relative h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      
      {/* Modal Backdrop and Content */}
      {isModalOpen && (
         <div className="absolute inset-x-0 inset-y-[-2rem] z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden animate-[fade_0.2s_ease-out]">
               <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <Building className="h-5 w-5 text-[#00ff9d]" /> Add Corporate Account
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                     <X className="h-5 w-5" />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Company Name</label>
                     <input type="text" placeholder="e.g. Acme Corp" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Billing Address</label>
                     <input type="text" placeholder="Full address..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Tax ID Number</label>
                     <input type="text" placeholder="xxx-xxx-xxx" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Contract Type</label>
                     <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all appearance-none">
                        <option>Enterprise Premium</option>
                        <option>Corporate Standard</option>
                        <option>Basic Business</option>
                     </select>
                  </div>
               </div>
               <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all">
                     Cancel
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-[#00ff9d] hover:bg-[#00e68d] text-black rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(0,255,157,0.3)] transition-all transform hover:scale-105">
                     Create Company
                  </button>
               </div>
            </div>
         </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">B2B Corporate Accounts</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Manage corporate clients, active contracts, and billing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Company
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by Company Name or ID..." 
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
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Billing Plan</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Contracts</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Invoices</th>
                <th className="px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {companies.map((company, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Building className="h-5 w-5 text-white/50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{company.name}</p>
                        <p className="text-xs font-mono font-medium text-[#00ff9d]">{company.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 text-xs font-bold bg-white/5 border border-white/10 rounded-md text-white/80">
                       {company.plan}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                      <Users className="h-4 w-4 text-white/30" />
                      {company.employees} Enrolled
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-white/70 font-bold">
                      <Briefcase className={`h-4 w-4 ${company.contracts.includes('Active') ? 'text-[#00ff9d]' : 'text-red-400'}`} />
                      <span className={company.contracts.includes('Active') ? 'text-white' : 'text-red-400'}>{company.contracts}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-white/30" />
                      <span className={company.invoices === 'Pending (1)' ? 'text-yellow-500 font-bold' : 'text-white/70'}>{company.invoices}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
