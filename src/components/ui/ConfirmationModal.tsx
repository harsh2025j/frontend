import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'success' | 'warning';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'primary'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle className="text-red-500" size={24} />;
            case 'success':
                return <CheckCircle className="text-green-500" size={24} />;
            case 'warning':
                return <AlertTriangle className="text-orange-500" size={24} />;
            default:
                return <Info className="text-blue-500" size={24} />;
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'warning':
                return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
            default:
                return 'bg-[#0A2342] hover:bg-[#1a3a75] focus:ring-blue-500';
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            {/* Modal */}
            <div
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-50' : variant === 'success' ? 'bg-green-50' : variant === 'warning' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                            {getIcon()}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 font-medium transition-colors shadow-sm ${getButtonColor()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
