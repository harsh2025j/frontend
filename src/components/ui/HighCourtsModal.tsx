"use client";

import React from 'react';
import { X } from 'lucide-react';
import StateJudgement from './stateJudgement';
import { highCourts } from '@/data/highCourts';
import { Link } from '@/i18n/routing';

interface HighCourtsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HighCourtsModal({ isOpen, onClose }: HighCourtsModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Modal Content */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">All High Courts of India</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pb-30  overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {highCourts.map((court, index) => (
                         
                            <div
                                key={court.id}
                                className="animate-fadeInUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            > <Link href={`category/${court.slug}`}>
                                <StateJudgement img={court.image} state={court.name} />
                            </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#1a3a75] transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}
