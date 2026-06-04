"use client";

import React from "react";
import { X, FileText, Plus, Send } from "lucide-react";
import { toast } from "react-hot-toast";

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

interface DocumentUploadModalProps {
  selectedFiles: File[];
  role: "user" | "advocate";
  partnerName: string;
  docRequiresPayment: boolean;
  docPaymentAmount: string;
  onFilesChange: (files: File[]) => void;
  onRequiresPaymentChange: (val: boolean) => void;
  onPaymentAmountChange: (val: string) => void;
  onSend: (files: File[], paymentParams?: { requiresPayment: boolean; amount: number }) => void;
  onClose: () => void;
}

export default function DocumentUploadModal({
  selectedFiles,
  role,
  partnerName,
  docRequiresPayment,
  docPaymentAmount,
  onFilesChange,
  onRequiresPaymentChange,
  onPaymentAmountChange,
  onSend,
  onClose,
}: DocumentUploadModalProps) {
  const handleAddMore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,image/*";
    input.onchange = (e: any) => {
      const newFiles = Array.from(e.target.files || []) as File[];
      onFilesChange([...selectedFiles, ...newFiles]);
    };
    input.click();
  };

  const handleSend = () => {
    if (
      role === "advocate" &&
      docRequiresPayment &&
      (!docPaymentAmount || Number(docPaymentAmount) <= 0)
    ) {
      toast.error("Please enter a valid payment amount greater than 0.");
      return;
    }
    onSend(
      selectedFiles,
      role === "advocate"
        ? { requiresPayment: docRequiresPayment, amount: Number(docPaymentAmount) }
        : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-stone-100 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#0A2342] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} />
            Send Document{selectedFiles.length > 1 ? "s" : ""} ({selectedFiles.length})
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 bg-white">

          {/* Left: file list */}
          <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-stone-100 bg-[#F8F9FA]">
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white border border-stone-200 shadow-sm rounded-2xl relative group pr-12"
                >
                  {file.type.startsWith("image/") ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-[#0A2342]/5 text-[#C9A227] rounded-xl flex items-center justify-center shrink-0 border border-[#0A2342]/10">
                      <FileText size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className="text-stone-900 font-bold text-sm line-clamp-2 break-all"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-stone-400 text-[10px] font-semibold mt-1 uppercase tracking-widest">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => onFilesChange(selectedFiles.filter((_, i) => i !== index))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm border border-stone-100 transition-all"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-stone-100 shrink-0">
              <button
                onClick={handleAddMore}
                className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 font-bold text-xs uppercase tracking-wider hover:border-[#0A2342] hover:text-[#0A2342] hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add More Files
              </button>
            </div>
          </div>

          {/* Right: options + actions */}
          <div className="w-full md:w-[360px] flex flex-col p-6 shrink-0 bg-white">
            <p className="text-stone-500 text-sm bg-stone-50 py-3 px-4 rounded-xl border border-stone-100 mb-6 text-center">
              Send to <span className="font-bold text-[#0A2342]">{partnerName}</span>?
            </p>

            {role === "advocate" && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 text-left space-y-4 shadow-sm mb-6 flex-1 md:flex-none">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <label className="text-sm font-bold text-[#0A2342] block">
                      Require Payment
                    </label>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Client must pay
                    </span>
                  </div>
                  <button
                    onClick={() => onRequiresPaymentChange(!docRequiresPayment)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      docRequiresPayment ? "bg-emerald-500" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        docRequiresPayment ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {docRequiresPayment ? (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-2">
                      Amount to Unlock (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={docPaymentAmount}
                        onChange={(e) => onPaymentAmountChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        }}
                        placeholder="500"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-stone-300 focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] text-base font-bold transition-all outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-center text-xs font-semibold leading-relaxed">
                      Documents will be sent for free and unlocked immediately.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3.5 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex-1 px-4 py-3.5 bg-[#0A2342] hover:bg-[#06162a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#0A2342]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
