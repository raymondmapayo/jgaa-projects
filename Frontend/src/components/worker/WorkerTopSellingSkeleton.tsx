// components/worker/WorkerTopSellingSkeleton.tsx

const WorkerTopSellingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-6 pb-10 w-full flex flex-col">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2 flex-wrap">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b pb-4 animate-pulse"
          >
            {/* Image */}
            <div className="w-12 h-12 bg-gray-300 rounded-lg" />
            {/* Text Columns */}
            <div className="flex-1 space-y-2">
              <div className="w-40 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-3 bg-gray-100 rounded" />
            </div>
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex justify-end">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default WorkerTopSellingSkeleton;
