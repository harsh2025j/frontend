export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto animate-pulse">
                    {/* Header Placeholder */}
                    <div className="mb-10">
                        <div className="h-10 bg-gray-200 rounded-lg w-64 mb-4"></div>
                        <div className="h-5 bg-gray-100 rounded w-96"></div>
                    </div>

                    {/* Tabs Placeholder */}
                    <div className="flex gap-2 mb-8 border-b border-gray-100 pb-0">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 w-32 bg-gray-100 rounded-t-xl"></div>
                        ))}
                    </div>

                    {/* Results Count Placeholder */}
                    <div className="mb-6">
                        <div className="h-5 bg-gray-100 rounded w-64"></div>
                    </div>

                    {/* Results List Placeholder */}
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-40 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex gap-6 h-full">
                                    <div className="w-28 bg-gray-50 rounded-xl hidden sm:block"></div>
                                    <div className="flex-1 space-y-4 pt-2">
                                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-50 rounded w-full"></div>
                                        <div className="h-4 bg-gray-50 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
