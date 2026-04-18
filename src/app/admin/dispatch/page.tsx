"use client";

import { MapPin, Navigation, CarFront, UserX, Clock, ArrowRight, ShieldAlert, Check } from "lucide-react";

export default function AdminDispatchPage() {
  const needsAssignment: any[] = [];
  const availableDrivers: any[] = [];

  return (
    <div className="space-y-8 pb-12 h-calc(100vh-80px)">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Live Dispatch Board</h1>
          <p className="text-sm font-medium text-white/50 mt-1">Real-time trip processing and assignment control.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold text-sm">
             <ShieldAlert className="h-4 w-4" />
             <span>1 Urgent Assignment</span>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            Auto-Assign All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
        
        {/* COLUMN 1: Needs Assignment */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Queues
              </h2>
              <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-lg text-xs font-bold">3 Trips</span>
           </div>

           <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
             {needsAssignment.map((trip) => (
               <div key={trip.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all group cursor-pointer relative overflow-hidden">
                 {trip.urgency === "High" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                 {trip.urgency === "Medium" && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />}
                 {trip.urgency === "Low" && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />}
                 
                 <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-white/70">{trip.id}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-1 rounded-md border border-[#00ff9d]/20">
                      {trip.tier}
                    </span>
                 </div>
                 
                 <h3 className="text-base font-bold text-white mb-2">{trip.pass}</h3>
                 
                 <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                       <MapPin className="h-3.5 w-3.5" /> {trip.route}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                       <Clock className="h-3.5 w-3.5" /> {trip.time}
                    </div>
                 </div>

                 <button className="w-full py-2 bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 hover:bg-[#00ff9d] hover:text-black rounded-xl text-xs font-black transition-all group-hover:shadow-[0_4px_14px_rgba(0,255,157,0.3)]">
                   Assign Now
                 </button>
               </div>
             ))}
           </div>
        </div>

        {/* COLUMN 2: Assignment Control Area (Middle) */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 shadow-2xl relative shadow-[#00ff9d]/5">
           <div className="absolute -top-[20%] -right-[20%] w-[50%] h-[50%] bg-[#00ff9d]/10 blur-[100px] pointer-events-none rounded-full" />
           
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <h2 className="text-lg font-black text-[#00ff9d] flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Active Selection
              </h2>
           </div>

           {/* Placeholder for selected Trip */}
           <div className="bg-black/60 border border-[#00ff9d]/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-50" />
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-xl font-black text-white">#BKG-9925</h3>
                    <p className="text-sm font-medium text-white/50 mt-1">John Doe • Premium</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-bold text-red-400">Due in 45 mins</p>
                 </div>
              </div>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white/50 font-bold text-xs mt-0.5">A</div>
                    <div>
                       <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Pickup Location</p>
                       <p className="text-sm font-bold text-white">Cairo International Airport, Terminal 3</p>
                    </div>
                 </div>
                 <div className="h-4 w-px bg-white/10 ml-4" />
                 <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white/50 font-bold text-xs mt-0.5">B</div>
                    <div>
                       <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Drop-off Location</p>
                       <p className="text-sm font-bold text-white">Four Seasons Hotel, Nile Plaza</p>
                    </div>
                 </div>
                 <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 border-dashed">
                    <p className="text-xs text-white/60 font-medium">Guest requested S-Class specifically. 2 passengers, 3 large bags.</p>
                 </div>
              </div>

              <div className="w-full flex justify-center">
                 <ArrowRight className="h-8 w-8 text-white/20 animate-pulse" />
              </div>
           </div>
        </div>

        {/* COLUMN 3: Available Resources */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CarFront className="h-5 w-5 text-blue-400" />
                Available Resources
              </h2>
           </div>

           <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
             {availableDrivers.map((driver, i) => (
               <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/20 transition-all cursor-pointer group flex gap-4 items-center relative overflow-hidden">
                 
                 <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#00ff9d]/10 group-hover:border-[#00ff9d]/30 transition-colors">
                    <UserX className="h-6 w-6 text-white/50 group-hover:text-[#00ff9d]" />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white truncate pr-2">{driver.name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${driver.status === 'Available' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {driver.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 truncate font-medium mb-1">{driver.vehicle}</p>
                    <p className="text-[10px] text-white/40 font-bold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {driver.dist} from Pickup
                    </p>
                 </div>
                 
                 {/* Match interaction overlay */}
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <button className="flex items-center gap-2 bg-[#00ff9d] text-black px-6 py-2.5 rounded-full font-black text-sm shadow-[0_4px_14px_rgba(0,255,157,0.3)] hover:scale-105 transition-transform">
                       <Check className="h-4 w-4" /> Match Resource
                    </button>
                 </div>

               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
