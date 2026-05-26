"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CreditCard, Building2, Hash, Landmark, Smartphone,
    FileText, ShieldCheck, Save, Loader2, CheckCircle2,
    Eye, EyeOff, AlertCircle, Edit2
} from "lucide-react";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { BankDetails, UserData } from "@/data/features/profile/profile.types";
import { toast } from "react-hot-toast";

interface BankDetailsSectionProps {
    user: UserData;
    onUpdate?: (updatedUser: UserData) => void;
}

const MaskedInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    maskable = false,
    ...rest
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    maskable?: boolean;
    [key: string]: any;
}) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input
                type={maskable && !visible ? "password" : type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl outline-none transition-all text-sm font-semibold pr-12"
                {...rest}
            />
            {maskable && (
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    );
};

export default function BankDetailsSection({ user, onUpdate }: BankDetailsSectionProps) {
    const existing = user.bankDetails || {};

    const [form, setForm] = useState<BankDetails>({
        accountHolderName: existing.accountHolderName || "",
        accountNumber: existing.accountNumber || "",
        ifscCode: existing.ifscCode || "",
        bankName: existing.bankName || "",
        upiId: existing.upiId || "",
        panNumber: existing.panNumber || "",
        aadhaarNumber: existing.aadhaarNumber || "",
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(!existing.accountNumber && !existing.ifscCode && !existing.bankName);

    // Sync if parent user object changes
    useEffect(() => {
        const b = user.bankDetails || {};
        setForm({
            accountHolderName: b.accountHolderName || "",
            accountNumber: b.accountNumber || "",
            ifscCode: b.ifscCode || "",
            bankName: b.bankName || "",
            upiId: b.upiId || "",
            panNumber: b.panNumber || "",
            aadhaarNumber: b.aadhaarNumber || "",
        });
    }, [user.bankDetails]);

    const hasDetails = !!(
        existing.accountNumber || existing.ifscCode || existing.bankName
    );

    const handleSave = async () => {
        if (!form.accountHolderName || !form.accountNumber || !form.ifscCode || !form.bankName) {
            toast.error("Please fill Account Holder Name, Account Number, IFSC, and Bank Name.");
            return;
        }
        // Basic IFSC validation: 11 chars, first 4 alpha
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode?.toUpperCase() || "")) {
            toast.error("Please enter a valid IFSC Code (e.g. SBIN0001234).");
            return;
        }

        setSaving(true);
        try {
            const res = await profileApi.updateBankDetails({
                ...form,
                ifscCode: form.ifscCode?.toUpperCase(),
                panNumber: form.panNumber?.toUpperCase(),
            });
            const updatedUser: UserData = res.data?.data || res.data;
            onUpdate?.(updatedUser);
            setSaved(true);
            setIsEditing(false);
            toast.success("Bank details saved successfully!");
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to save bank details.");
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof BankDetails) => (v: string) =>
        setForm((prev) => ({ ...prev, [key]: v }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-sm md:col-span-2"
        >
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9A227] uppercase mb-1.5 block leading-none">
                        Payment Setup
                    </span>
                    <h4 className="text-2xl font-serif text-[#0A2342] tracking-tight">
                        Bank & Payment Details
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-2 font-serif italic">
                        Your bank information is stored securely and used only for consultation fee payouts.
                    </p>
                </div>
                {hasDetails && (
                    <div className="flex items-center gap-2 shrink-0">
                        {!isEditing && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest shrink-0">
                                <ShieldCheck size={14} />
                                <span>Details Saved</span>
                            </div>
                        )}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors text-[10px] font-bold uppercase tracking-widest shrink-0"
                            >
                                <Edit2 size={14} />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-6">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                    Keep your account details accurate. Incorrect IFSC or account numbers may result in failed payouts. Your Aadhaar & PAN are masked for security.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Account Holder Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={12} className="text-[#C9A227]" />
                        Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <MaskedInput
                        value={form.accountHolderName || ""}
                        onChange={set("accountHolderName")}
                        placeholder="Full name as per bank records"
                        disabled={!isEditing}
                    />
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12} className="text-[#C9A227]" />
                        Bank Name <span className="text-red-500">*</span>
                    </label>
                    <MaskedInput
                        value={form.bankName || ""}
                        onChange={set("bankName")}
                        placeholder="e.g. State Bank of India"
                        disabled={!isEditing}
                    />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-[#C9A227]" />
                        Account Number <span className="text-red-500">*</span>
                    </label>
                    <MaskedInput
                        value={form.accountNumber || ""}
                        onChange={set("accountNumber")}
                        placeholder="Enter account number"
                        maskable
                        disabled={!isEditing}
                    />
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={12} className="text-[#C9A227]" />
                        IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <MaskedInput
                        value={form.ifscCode || ""}
                        onChange={(v: string) => set("ifscCode")(v.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                        disabled={!isEditing}
                    />
                </div>

                {/* UPI ID */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={12} className="text-[#C9A227]" />
                        UPI ID <span className="text-gray-300 font-normal normal-case tracking-normal ml-1">(Optional)</span>
                    </label>
                    <MaskedInput
                        value={form.upiId || ""}
                        onChange={set("upiId")}
                        placeholder="yourname@upi"
                        disabled={!isEditing}
                    />
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} className="text-[#C9A227]" />
                        PAN Number <span className="text-gray-300 font-normal normal-case tracking-normal ml-1">(KYC)</span>
                    </label>
                    <MaskedInput
                        value={form.panNumber || ""}
                        onChange={(v: string) => set("panNumber")(v.toUpperCase())}
                        placeholder="ABCDE1234F"
                        maskable
                        disabled={!isEditing}
                    />
                </div>

                {/* Aadhaar Number */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} className="text-[#C9A227]" />
                        Aadhaar Number <span className="text-gray-300 font-normal normal-case tracking-normal ml-1">(KYC — stored masked)</span>
                    </label>
                    <MaskedInput
                        value={form.aadhaarNumber || ""}
                        onChange={set("aadhaarNumber")}
                        placeholder="12-digit Aadhaar number"
                        maskable
                        maxLength={12}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-60 ${
                            saved
                                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                : "bg-[#0A2342] text-white hover:bg-[#0d2d58] shadow-[#0A2342]/20"
                        }`}
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : saved ? (
                            <CheckCircle2 size={16} />
                        ) : (
                            <Save size={16} />
                        )}
                        <span>{saving ? "Saving..." : saved ? "Saved!" : "Save Bank Details"}</span>
                    </button>
                </div>
            )}

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </motion.div>
    );
}
