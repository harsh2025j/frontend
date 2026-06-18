export default function NewsArticleLoading() {
    return (
        <div className="bg-white min-h-screen font-georgia">
            <div className="max-w-7xl mx-auto py-8 px-4">
                
                {/* Article Top Banner Placeholder */}
                <div className="mt-1 w-full flex justify-center">
                    <div className="w-full max-w-[728px] h-[90px] bg-gray-100 rounded-lg animate-pulse mb-8 lg:mb-0"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 lg:mt-0">
                    
                    {/* ── Main content column ── */}
                    <div className="lg:col-span-9 animate-pulse">
                        <div className="article-wrapper">
                            {/* Title */}
                            <div className="mb-6">
                                <div className="h-8 sm:h-10 bg-gray-200 rounded w-full mb-2 sm:mb-3"></div>
                                <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4 mb-4 sm:mb-6"></div>
                                
                                {/* Author metadata */}
                                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8 p-3 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                                    <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0 ring-2 ring-gray-100"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-5 bg-gray-200 rounded w-32"></div>
                                            <div className="h-4 w-14 bg-gray-200 rounded-md"></div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail */}
                            <div className="w-full aspect-video mb-8 rounded-2xl bg-gray-200 shadow-sm border border-gray-100"></div>

                            {/* Tags + AI Summary skeleton */}
                            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[40px]">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-10 bg-gray-200 rounded"></div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="h-7 bg-gray-100 rounded-full w-24 border border-gray-200"></div>
                                        <div className="h-7 bg-gray-100 rounded-full w-32 border border-gray-200"></div>
                                        <div className="h-7 bg-gray-100 rounded-full w-28 border border-gray-200"></div>
                                    </div>
                                </div>
                                <div className="h-9 bg-blue-500/20 rounded-full w-full md:w-32 self-end md:self-auto border border-blue-500/10"></div>
                            </div>

                            {/* Mobile Social Share Skeleton */}
                            <div className="flex sm:hidden items-center justify-between w-full mb-10 py-2 px-2 bg-white rounded-xl sm:rounded-full border border-gray-200 shadow-sm">
                                <div className="h-6 w-20 bg-gray-100 rounded"></div>
                                <div className="w-px h-6 bg-gray-200" />
                                <div className="h-6 w-20 bg-gray-100 rounded"></div>
                            </div>

                            {/* Desktop Social Share Skeleton */}
                            <div className="hidden sm:flex flex-row items-center gap-6 mb-10 py-3 px-6 bg-white rounded-full border border-gray-200 w-fit mx-0 shadow-sm">
                                <div className="h-5 w-24 bg-gray-100 rounded"></div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                    <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                </div>
                            </div>

                            {/* Content Skeleton */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-10/12"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
                                
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                                <div className="h-4 bg-gray-200 rounded w-9/12"></div>
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar column ── */}
                    <div className="hidden lg:block lg:col-span-3 border-l border-gray-100 pl-8">
                        {/* Sidebar Top Ad Placeholder */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-[300px] h-[250px] bg-gray-100 rounded-lg animate-pulse"></div>
                        </div>

                        {/* Related Articles Title */}
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                            <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
                        </div>

                        {/* Related Articles List */}
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-[85px] h-[65px] rounded-lg bg-gray-200 shrink-0"></div>
                                    <div className="flex-1 min-w-0 space-y-2 pt-1">
                                        <div className="h-3.5 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3.5 bg-gray-200 rounded w-4/5"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
