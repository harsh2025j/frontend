"use client";

import React from "react";

const ServerErrorPage = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white px-4">
            <div className="text-center max-w-md">

                {/* Minimal Icon */}
                <div className="flex justify-center mb-6">
                    <svg
                        className="w-16 h-16 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Server Error
                </h1>

                <p className="text-gray-600 mb-6">
                    Something went wrong on our end. Please try again.
                </p>

                <button
                    onClick={handleRefresh}
                    className="px-5 py-2.5 bg-[#1b3550] text-white rounded-md font-medium hover:bg-[#24466a] transition"
                >
                    Refresh Page
                </button>
            </div>
        </div>
    );
};

export default ServerErrorPage;
