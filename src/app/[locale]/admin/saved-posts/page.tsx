"use client";

import { Bookmark, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SavedPostsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Bookmark size={48} strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Posts</h1>
            <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
                You haven't bookmarked any articles yet. Save important cases and legal news to view them here later.
            </p>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm inline-block">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Search size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Find something interesting?</h2>
                    <p className="text-sm text-gray-500 mb-6">Explore our library of legal articles and insights.</p>

                    <Link
                        href="/"
                        className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-lg shadow-blue-100"
                    >
                        Browse Latest News
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none select-none">
                <div className="bg-white p-4 rounded-xl border border-gray-100 h-32"></div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 h-32"></div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 h-32"></div>
            </div>
        </div>
    );
}
