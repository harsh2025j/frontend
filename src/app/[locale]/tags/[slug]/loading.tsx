export default function TagLoading({ showSidebar = false }: { showSidebar?: boolean }) {
    return (
        <div className="container mx-auto px-4 py-10">
            {/* Top Category Banner */}
            <div className="mb-10 w-full flex justify-center">
                <div className="w-full max-w-[728px] h-[90px] bg-gray-100 rounded-lg animate-pulse border border-gray-200"></div>
            </div>

            <div className="text-left mb-10 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-48"></div>
                </div>
                <div className="h-5 bg-gray-100 rounded w-full max-w-2xl"></div>
                <div className="w-24 h-1 bg-gray-200 rounded-full mt-3" />
            </div>

            <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-8`}>
                <div className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-10`}>
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${showSidebar ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 items-stretch`}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-full rounded-[4px] bg-white border border-gray-200 overflow-hidden flex flex-col h-[380px] animate-pulse">
                                {/* Image — 16:9 ratio */}
                                <div className="relative aspect-video w-full flex-shrink-0 bg-gray-100 border-b border-gray-100"></div>

                                {/* Content */}
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <div className="flex flex-wrap gap-2 items-center text-xs">
                                        <div className="bg-gray-100 h-6 w-16 rounded-full"></div>
                                        <div className="ml-auto h-4 w-16 bg-gray-100 rounded"></div>
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        <div className="h-5 bg-gray-200 rounded w-full"></div>
                                        <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                                    </div>
                                    <div className="flex-1" />
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {showSidebar && (
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl w-[300px] h-[250px] animate-pulse mx-auto shadow-sm"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
