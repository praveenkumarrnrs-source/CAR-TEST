import { Skeleton } from '@/components/ui/skeleton';

interface CarGridSkeletonProps {
  count?: number;
}

export const CarGridSkeleton = ({ count = 6 }: CarGridSkeletonProps) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="group">
          {/* Image skeleton */}
          <Skeleton className="aspect-[16/10] rounded-t-lg" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3 bg-card rounded-b-lg border border-t-0 border-border">
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            
            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
