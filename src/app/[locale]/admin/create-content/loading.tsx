import React from "react";

export default function CreateContentLoading() {
    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 p-3 sm:p-4 md:p-6 lg:p-8 animate-pulse w-full">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4 sm:mb-6 px-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="w-40 h-8 bg-gray-200 rounded" />
                </div>
                {/* Form Box */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6 border border-gray-100">
                    {/* 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                    </div>
                    {/* 1 col */}
                    <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                    <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                    {/* 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                    </div>
                    {/* 3 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                        <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-11 bg-gray-200 rounded-lg"/></div>
                    </div>
                    {/* 2 cols (Image upload) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="h-40 bg-gray-200 rounded-lg" />
                        <div className="h-40 bg-gray-200 rounded-lg" />
                    </div>
                    {/* Rich text */}
                    <div className="space-y-2"><div className="w-24 h-4 bg-gray-200 rounded"/><div className="h-64 bg-gray-200 rounded-lg"/></div>
                </div>
            </div>
        </div>
    );
}
