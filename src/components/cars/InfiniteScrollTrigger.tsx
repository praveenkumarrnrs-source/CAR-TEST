import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
  onTrigger: () => void;
  loading: boolean;
  hasMore: boolean;
}

export const InfiniteScrollTrigger = ({ 
  onTrigger, 
  loading, 
  hasMore 
}: InfiniteScrollTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          onTrigger();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before user reaches the bottom
        threshold: 0,
      }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onTrigger, loading, hasMore]);

  if (!hasMore) return null;

  return (
    <div 
      ref={triggerRef} 
      className="flex justify-center py-8 col-span-full"
    >
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading more cars...</span>
        </div>
      )}
    </div>
  );
};
