const SkeletonLoader = ({ variant = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {items.map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
