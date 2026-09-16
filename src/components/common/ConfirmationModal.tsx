"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, X, Loader2, Trash2 } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          icon: <AlertCircle className="text-amber-600" size={22} />,
          iconBg: "bg-amber-50 border-amber-100",
          confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
        };
      case "info":
        return {
          icon: <Info className="text-blue-600" size={22} />,
          iconBg: "bg-blue-50 border-blue-100",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
        };
      case "danger":
      default:
        return {
          icon: <Trash2 className="text-red-600" size={22} />,
          iconBg: "bg-red-50 border-red-100",
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20",
        };
    }
  };

  const { icon, iconBg, confirmBtn } = getVariantStyles();
  const busy = isLoading || isProcessing;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${iconBg}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Please confirm this action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${confirmBtn}`}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
