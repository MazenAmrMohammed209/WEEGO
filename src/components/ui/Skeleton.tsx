import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gray-700/40 rounded-xl ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-gray-800/20 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number, columns?: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-gray-800/20 backdrop-blur-md overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-black/20 border-b border-white/5">
                  {Array.from({ length: columns }).map((_, i) => (
                    <th key={i} className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {Array.from({ length: rows }).map((_, i) => (
                 <tr key={i}>
                    {Array.from({ length: columns }).map((_, j) => (
                      <td key={j} className="px-6 py-5">
                         <Skeleton className="h-4 w-full max-w-[200px]" />
                         {j === 1 && <Skeleton className="h-3 w-3/4 mt-2" />}
                      </td>
                    ))}
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-3xl border border-white/5 bg-gray-800/20 backdrop-blur-md p-6 shadow-xl relative overflow-hidden h-[400px] flex flex-col justify-end gap-2 pb-10">
      <div className="flex justify-between items-center w-full absolute top-6 left-6 right-6 pr-12">
        <div>
           <Skeleton className="h-6 w-48 mb-2" />
           <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
           <Skeleton className="h-8 w-12" />
           <Skeleton className="h-8 w-12" />
           <Skeleton className="h-8 w-12" />
        </div>
      </div>
      {/* Fake bars/chart lines */}
      <div className="flex items-end justify-between gap-4 h-48 px-6 mt-auto">
         <Skeleton className="w-full h-1/3" />
         <Skeleton className="w-full h-2/3" />
         <Skeleton className="w-full h-1/2" />
         <Skeleton className="w-full h-full" />
         <Skeleton className="w-full h-4/5" />
         <Skeleton className="w-full h-2/5" />
         <Skeleton className="w-full h-3/5" />
      </div>
    </div>
  );
}
