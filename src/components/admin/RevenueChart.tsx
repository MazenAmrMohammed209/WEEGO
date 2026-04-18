"use client";

export default function RevenueChart({ payments, invoices, filter }: { payments: any[], invoices: any[], filter: string }) {
  // Compute chart max bounds and points
  const now = new Date();
  let daysLimit = 30;
  
  if (filter === "7D") daysLimit = 7;
  else if (filter === "1M") daysLimit = 30;
  else if (filter === "3M") daysLimit = 90;
  else if (filter === "1Y") daysLimit = 365;

  // We want to divide the timeframe into 6 data points
  const binsCount = 6;
  const binMs = (daysLimit * 24 * 60 * 60 * 1000) / (binsCount - 1);
  
  const startMs = now.getTime() - (daysLimit * 24 * 60 * 60 * 1000);

  const b2cBins = new Array(binsCount).fill(0);
  const b2bBins = new Array(binsCount).fill(0);

  payments.forEach(p => {
    if (p.status !== 'completed') return;
    const t = new Date(p.created_at).getTime();
    if (t < startMs) return;
    const binIdx = Math.floor((t - startMs) / binMs);
    if (binIdx >= 0 && binIdx < binsCount) b2cBins[binIdx] += Number(p.amount || 0);
  });

  invoices.forEach(inv => {
    if (inv.status !== 'success') return;
    const t = new Date(inv.created_at).getTime();
    if (t < startMs) return;
    const binIdx = Math.floor((t - startMs) / binMs);
    if (binIdx >= 0 && binIdx < binsCount) b2bBins[binIdx] += Number(inv.amount || 0);
  });

  const getSmoothPath = (points: number[]) => {
    if (!points.length) return { path: "", lastY: 0 };
    const width = 800;
    const height = 300;
    const step = width / (points.length - 1 || 1);
    
    // global max so both lines use the same scale
    const globalMax = Math.max(...b2cBins, ...b2bBins, 100);
    
    const mappedPoints = points.map((val, i) => ({
      x: i * step,
      y: height - (val / globalMax) * 250 - 20 // 20px padding bottom
    }));

    let d = `M${mappedPoints[0].x},${mappedPoints[0].y}`;
    for (let i = 1; i < mappedPoints.length; i++) {
      const prev = mappedPoints[i-1];
      const curr = mappedPoints[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp2x = curr.x - (curr.x - prev.x) / 2;
      d += ` C${cp1x},${prev.y} ${cp2x},${curr.y} ${curr.x},${curr.y}`;
    }
    return { path: d, lastY: mappedPoints[mappedPoints.length - 1].y };
  };

  const b2c = getSmoothPath(b2cBins);
  const b2b = getSmoothPath(b2bBins);

  return (
    <div className="h-[300px] w-full relative z-10 flex items-end">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
        <defs>
          <linearGradient id="glowDirect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#00ff9d" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="glowCorporate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={i} x1="0" y1={i * 60 + 30} x2="800" y2={i * 60 + 30} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
        ))}
        
        {/* B2C Revenue Line (Neon Green) */}
        {b2cBins.some(v => v > 0) ? (
           <>
           <path className="animate-[dash_3s_ease-out_forwards]" d={b2c.path as string} fill="none" stroke="#00ff9d" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 255, 157, 0.4))' }} />
           <path d={`${b2c.path} L800,300 L0,300 Z`} fill="url(#glowDirect)" className="animate-[fade_2s_ease-in]" />
           </>
        ) : (
           <line x1="0" y1="280" x2="800" y2="280" stroke="#00ff9d" strokeWidth="2" strokeDasharray="5 5" opacity="0.3"/>
        )}

        {/* B2B Revenue Line (Blue) */}
        {b2bBins.some(v => v > 0) ? (
           <>
           <path className="animate-[dash_4s_ease-out_forwards]" d={b2b.path as string} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 4px 6px rgba(59, 130, 246, 0.4))' }} />
           <path d={`${b2b.path} L800,300 L0,300 Z`} fill="url(#glowCorporate)" className="animate-[fade_2s_ease-in]" />
           </>
        ) : (
           <line x1="0" y1="280" x2="800" y2="280" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5" opacity="0.3"/>
        )}
      </svg>

      {/* Chart Legend */}
      <div className="absolute top-0 right-0 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]" />
          <span className="text-xs text-white/60">Direct (B2C)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span className="text-xs text-white/60">Corporate (B2B)</span>
        </div>
      </div>
    </div>
  );
}
