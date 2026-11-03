export default function AuthorLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Top Bar Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-20 bg-gray-200 rounded-xl" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
              <div className="h-7 w-48 bg-gray-200 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-32 bg-gray-100 rounded mx-auto sm:mx-0" />
              <div className="flex gap-2 pt-1 justify-center sm:justify-start">
                <div className="h-6 w-24 bg-gray-100 rounded-lg" />
                <div className="h-6 w-16 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-200">
          <div className="h-6 w-36 bg-gray-200 rounded" />
          <div className="h-9 w-full sm:w-72 bg-gray-100 rounded-xl" />
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-2xs space-y-3"
            >
              <div className="aspect-video w-full bg-gray-200" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-20 bg-amber-100 rounded" />
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="pt-2 border-t border-gray-100 flex justify-between">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-3 w-14 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
