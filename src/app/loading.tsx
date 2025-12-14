import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 max-w-4xl mx-auto bg-background text-white min-h-screen">
      <header className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-7 w-7" />
        </div>
      </header>

      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-[90px] w-[90px] rounded-full" />
        <div className="flex-1 flex justify-around items-center">
          <div className="text-center">
            <Skeleton className="h-5 w-8 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="text-center">
            <Skeleton className="h-5 w-10 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="text-center">
            <Skeleton className="h-5 w-6 mb-1" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <Skeleton className="h-16 w-full rounded-lg mb-4" />

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
      
      <div className="flex justify-around border-t border-zinc-700 mb-1">
         <Skeleton className="w-1/3 h-12" />
         <Skeleton className="w-1/3 h-12" />
         <Skeleton className="w-1/3 h-12" />
      </div>

      <div className="grid grid-cols-3 gap-1">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
