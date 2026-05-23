"use client";

import React, { useEffect, useState } from "react";
import { payoutsService } from "@/data/services/payouts-service/payoutsService";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { toast } from "react-hot-toast";
import { ArrowLeft, Building, CreditCard, Banknote, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";

export default function AdvocatePayoutDetails({ params }: { params: Promise<{ advocateId: string }> }) {
  const { advocateId } = React.use(params);
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState<string>("");
  const [payoutNote, setPayoutNote] = useState<string>("");

  // Paginated data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsTotalCount, setAppointmentsTotalCount] = useState(0);
  const [appointmentsHasMore, setAppointmentsHasMore] = useState(false);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);

  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsTotalCount, setPayoutsTotalCount] = useState(0);
  const [payoutsHasMore, setPayoutsHasMore] = useState(false);
  const [isPayoutsLoading, setIsPayoutsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [detailsRes, appointmentsRes, payoutsRes] = await Promise.all([
        payoutsService.getAdvocateDetails(advocateId),
        payoutsService.getAdvocateAppointments(advocateId, 1, 20),
        payoutsService.getAdvocatePayoutHistory(advocateId, 1, 20),
      ]);

      const detailsData = detailsRes.data?.data || detailsRes.data;
      setDetails(detailsData);

      const aptData = appointmentsRes.data?.data || appointmentsRes.data;
      const initialAppointments = aptData?.data || [];
      const aptTotal = aptData?.totalCount || 0;
      setAppointments(initialAppointments);
      setAppointmentsPage(1);
      setAppointmentsTotalCount(aptTotal);
      setAppointmentsHasMore(initialAppointments.length < aptTotal);

      const payData = payoutsRes.data?.data || payoutsRes.data;
      const initialPayouts = payData?.data || [];
      const payTotal = payData?.totalCount || 0;
      setPayouts(initialPayouts);
      setPayoutsPage(1);
      setPayoutsTotalCount(payTotal);
      setPayoutsHasMore(initialPayouts.length < payTotal);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [advocateId]);

  const fetchMoreAppointments = async () => {
    if (isAppointmentsLoading || !appointmentsHasMore) return;
    setIsAppointmentsLoading(true);
    try {
      const nextPage = appointmentsPage + 1;
      const res = await payoutsService.getAdvocateAppointments(advocateId, nextPage, 20);
      const resData = res.data?.data || res.data;
      const newAppointments = resData?.data || [];
      const totalCount = resData?.totalCount || 0;

      setAppointments(prev => {
        const combined = [...prev, ...newAppointments];
        setAppointmentsHasMore(combined.length < totalCount);
        return combined;
      });
      setAppointmentsPage(nextPage);
    } catch (err) {
      toast.error("Failed to load more appointments");
    } finally {
      setIsAppointmentsLoading(false);
    }
  };

  const fetchMorePayouts = async () => {
    if (isPayoutsLoading || !payoutsHasMore) return;
    setIsPayoutsLoading(true);
    try {
      const nextPage = payoutsPage + 1;
      const res = await payoutsService.getAdvocatePayoutHistory(advocateId, nextPage, 20);
      const resData = res.data?.data || res.data;
      const newPayouts = resData?.data || [];
      const totalCount = resData?.totalCount || 0;

      setPayouts(prev => {
        const combined = [...prev, ...newPayouts];
        setPayoutsHasMore(combined.length < totalCount);
        return combined;
      });
      setPayoutsPage(nextPage);
    } catch (err) {
      toast.error("Failed to load more payouts");
    } finally {
      setIsPayoutsLoading(false);
    }
  };

  const handleAppointmentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      fetchMoreAppointments();
    }
  };

  const handlePayoutsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      fetchMorePayouts();
    }
  };

  const refreshPayoutsAndSummary = async () => {
    try {
      const [detailsRes, payoutsRes] = await Promise.all([
        payoutsService.getAdvocateDetails(advocateId),
        payoutsService.getAdvocatePayoutHistory(advocateId, 1, 20),
      ]);

      const detailsData = detailsRes.data?.data || detailsRes.data;
      setDetails(detailsData);

      const payData = payoutsRes.data?.data || payoutsRes.data;
      const initialPayouts = payData?.data || [];
      const payTotal = payData?.totalCount || 0;
      setPayouts(initialPayouts);
      setPayoutsPage(1);
      setPayoutsTotalCount(payTotal);
      setPayoutsHasMore(initialPayouts.length < payTotal);
    } catch (err) {
      toast.error("Failed to refresh payout history");
    }
  };

  const handleFetchBankDetails = async () => {
    if (bankDetails) {
      setShowBankModal(true);
      return;
    }
    setIsBankLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE.PUBLIC.replace(':id', advocateId));
      setBankDetails(res.data?.data?.bankDetails || {});
      setShowBankModal(true);
    } catch (err) {
      toast.error("Failed to fetch bank details");
    } finally {
      setIsBankLoading(false);
    }
  };

  const handleLogPayout = async () => {
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await payoutsService.logPayout(advocateId, Number(payoutAmount), payoutNote);
      toast.success("Payout logged successfully!");
      setPayoutAmount("");
      setPayoutNote("");
      refreshPayoutsAndSummary();
    } catch (err) {
      toast.error("Failed to log payout");
    }
  };

  const totalNet = details?.totalNet || 0;
  const totalPaid = details?.totalPaid || 0;
  const balance = details?.balance || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Advocate Payout Ledger</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Totals & Bank Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500">Total Net Earned</span>
                {isLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                ) : (
                  <span className="font-semibold text-gray-900">₹{totalNet.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500">Total Paid by Admin</span>
                {isLoading ? (
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <span className="font-semibold text-green-600">₹{totalPaid.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-900 font-medium">Balance to Pay</span>
                {isLoading ? (
                  <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <span className={`text-xl font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    ₹{balance.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleFetchBankDetails}
              disabled={isBankLoading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-medium transition"
            >
              <Building size={18} />
              {isBankLoading ? "Loading..." : "View Bank Details"}
            </button>
          </div>

          {/* Log Manual Payout */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Banknote size={18} className="text-gray-500" />
              Log Manual Payout
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note / Reference</label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. NEFT Trans #12345"
                />
              </div>
              <button
                onClick={handleLogPayout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm"
              >
                Log Payment
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Histories */}
        <div className="md:col-span-2 space-y-6">

          {/* Appointments Earnings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                Paid Appointments (Earnings)
              </h2>
            </div>
            <div 
              onScroll={handleAppointmentsScroll}
              className="p-0 overflow-auto max-h-[500px] custom-scrollbar relative"
            >
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider w-16">S.No.</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Date</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Client</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Gross</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Comm.</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Net Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      </tr>
                    ))
                  ) : appointments.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-500">No paid appointments yet.</td></tr>
                  ) : (
                    appointments.map((apt: any, idx: number) => (
                      <tr key={apt.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-sm text-gray-500 font-medium">{appointmentsTotalCount - idx}</td>
                        <td className="p-4 text-sm text-gray-600">{formatDate(apt.createdAt)}</td>
                        <td className="p-4 text-sm font-medium text-gray-900">{apt.fullName}</td>
                        <td className="p-4 text-sm text-gray-600">₹{apt.finalPrice}</td>
                        <td className="p-4 text-sm text-red-500">-₹{apt.commissionAmount || 0} ({apt.commissionRate || 0}%)</td>
                        <td className="p-4 text-sm font-semibold text-green-700">₹{apt.netPayable || apt.finalPrice}</td>
                      </tr>
                    ))
                  )}
                  {isAppointmentsLoading && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading more...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Payouts History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" />
                Admin Payouts History
              </h2>
            </div>
            <div 
              onScroll={handlePayoutsScroll}
              className="p-0 overflow-auto max-h-[500px] custom-scrollbar relative"
            >
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider w-16">S.No.</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Date</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Note</th>
                    <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      </tr>
                    ))
                  ) : payouts.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-gray-500">No payouts logged yet.</td></tr>
                  ) : (
                    payouts.map((pay: any, idx: number) => (
                      <tr key={pay.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-sm text-gray-500 font-medium">{payoutsTotalCount - idx}</td>
                        <td className="p-4 text-sm text-gray-600">{formatDate(pay.createdAt)}</td>
                        <td className="p-4 text-sm text-gray-600">{pay.adminNote || '-'}</td>
                        <td className="p-4 text-sm font-semibold text-gray-900">₹{pay.amount}</td>
                      </tr>
                    ))
                  )}
                  {isPayoutsLoading && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading more...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building size={18} className="text-blue-600" />
                Advocate Bank Details
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {bankDetails ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{bankDetails.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Holder</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{bankDetails.accountHolderName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Number</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg font-mono tracking-wider">{bankDetails.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg font-mono tracking-wider">{bankDetails.ifscCode || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                      <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg text-sm">{bankDetails.panNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">UPI ID</p>
                      <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg text-sm">{bankDetails.upiId || 'N/A'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No bank details provided by advocate.</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
