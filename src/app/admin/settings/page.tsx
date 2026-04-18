"use client";

import { Save, Building, Globe, Bell, Shield, Wallet, Smartphone, Mail, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const settingsSections = [
    { id: "general", title: "General Info", icon: Building, desc: "Company details, logos, and regional settings." },
    { id: "localization", title: "Localization", icon: Globe, desc: "Languages, currency, and timezone." },
    { id: "notifications", title: "Notifications", icon: Bell, desc: "Email, SMS, and push notification rules." },
    { id: "security", title: "Security", icon: Shield, desc: "2FA, password policies, and session limits." },
    { id: "payment", title: "Payment Gateways", icon: Wallet, desc: "Stripe, PayPal, and bank transfer setups." },
    { id: "mobile", title: "Passenger App", icon: Smartphone, desc: "App controls, versions, and features." },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Configure global application parameters and integrations.</p>
        </div>
        <button className="bg-[#00ff9d] hover:bg-[#00e68d] text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(0,255,157,0.3)] flex items-center gap-2">
          <Save className="h-4 w-4" /> Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Settings Navigation */}
        <div className="space-y-2 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-4 shadow-xl">
           <h3 className="text-xs font-black text-white/40 uppercase tracking-widest pl-4 mb-4 mt-2">Configuration</h3>
           {settingsSections.map((section, idx) => (
             <button
               key={idx}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl justify-start text-sm transition-all ${idx === 0 ? 'bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 shadow-[0_0_15px_rgba(0,255,157,0.1)] font-bold' : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'}`}
             >
               <section.icon className={`h-4 w-4 ${idx === 0 ? 'text-[#00ff9d]' : 'text-white/40'}`} />
               {section.title}
             </button>
           ))}
        </div>

        {/* Settings Form Content */}
        <div className="md:col-span-3 space-y-6">
           
           <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d]/5 blur-[60px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <h2 className="text-xl font-black text-white mb-6 relative z-10">General Information</h2>
              
              <div className="space-y-6 relative z-10">
                 
                 <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Company Name</label>
                       <input type="text" defaultValue="WEEGO Premium Travel" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Support Email</label>
                       <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
                         <input type="email" defaultValue="support@weegotravel.com" className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all font-medium" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">HQ Address</label>
                    <input type="text" defaultValue="Cairo Business Park, Building 4" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all font-medium" />
                 </div>

                 <div className="pt-6 border-t border-white/5 grid sm:grid-cols-2 gap-6 items-center">
                    <div>
                        <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
                        <p className="text-xs text-white/50 mt-1 pb-4 sm:pb-0">Disable client applications temporarily.</p>
                    </div>
                    <div className="flex sm:justify-end">
                       <button className="relative w-14 h-7 bg-white/10 rounded-full border border-white/20 transition-colors">
                          <div className="absolute top-0.5 left-1 h-5 w-5 bg-white/50 rounded-full transition-transform" />
                       </button>
                    </div>
                 </div>

              </div>
           </div>

           <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md p-8 shadow-2xl">
              <h2 className="text-xl font-black text-white mb-6">Booking Rules</h2>
              
              <div className="space-y-6">
                 <div className="p-4 rounded-xl border border-white/10 bg-black flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div>
                       <h4 className="text-sm font-bold text-white">Auto-Assign Airport Trips</h4>
                       <p className="text-xs text-white/50 mt-1">Automatically assign VIP airport requests to available Fleet S-Class vehicles.</p>
                    </div>
                    <button className="relative w-14 h-7 bg-[#00ff9d]/20 border border-[#00ff9d]/50 rounded-full transition-colors shrink-0">
                       <div className="absolute top-0.5 left-[1.65rem] h-5 w-5 bg-[#00ff9d] rounded-full transition-transform shadow-[0_0_10px_#00ff9d]" />
                    </button>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Minimum Advance Booking Time (Hours)</label>
                    <input type="number" defaultValue="2" className="w-full sm:w-1/3 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all font-mono font-bold" />
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
