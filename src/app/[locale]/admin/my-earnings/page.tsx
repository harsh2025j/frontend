"use client";

import React, { useEffect, useState } from "react";
import { payoutsService } from "@/data/services/payouts-service/payoutsService";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { toast } from "react-hot-toast";
import { ArrowLeft, Building, CreditCard, Calendar, TrendingUp, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

export default function MyEarnings() {
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const advocateId = reduxProfileUser?.id || reduxProfileUser?._id;

  const [details, setDetails] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

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

  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsPage, setDocumentsPage] = useState(1);
  const [documentsTotalCount, setDocumentsTotalCount] = useState(0);
  const [documentsHasMore, setDocumentsHasMore] = useState(false);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);

  const fetchData = async () => {
    if (!advocateId) return;
    setIsLoading(true);
    try {
      const [detailsRes, appointmentsRes, documentsRes, payoutsRes] = await Promise.all([
        payoutsService.getAdvocateDetails(advocateId),
        payoutsService.getAdvocateAppointments(advocateId, 1, 20),
        payoutsService.getAdvocateDocuments(advocateId, 1, 20),
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

      const docData = documentsRes.data?.data || documentsRes.data;
      const initialDocuments = docData?.data || [];
      const docTotal = docData?.totalCount || 0;
      setDocuments(initialDocuments);
      setDocumentsPage(1);
      setDocumentsTotalCount(docTotal);
      setDocumentsHasMore(initialDocuments.length < docTotal);
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
    if (isAppointmentsLoading || !appointmentsHasMore || !advocateId) return;
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
    if (isPayoutsLoading || !payoutsHasMore || !advocateId) return;
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

  const fetchMoreDocuments = async () => {
    if (isDocumentsLoading || !documentsHasMore || !advocateId) return;
    setIsDocumentsLoading(true);
    try {
      const nextPage = documentsPage + 1;
      const res = await payoutsService.getAdvocateDocuments(advocateId, nextPage, 20);
      const resData = res.data?.data || res.data;
      const newDocuments = resData?.data || [];
      const totalCount = resData?.totalCount || 0;

      setDocuments(prev => {
        const combined = [...prev, ...newDocuments];
        setDocumentsHasMore(combined.length < totalCount);
        return combined;
      });
      setDocumentsPage(nextPage);
    } catch (err) {
      toast.error("Failed to load more documents");
    } finally {
      setIsDocumentsLoading(false);
    }
  };

  const handleAppointmentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      fetchMoreAppointments();
    }
  };

  const handleDocumentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      fetchMoreDocuments();
    }
  };

  const handlePayoutsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      fetchMorePayouts();
    }
  };

  const handleFetchBankDetails = async () => {
    if (bankDetails) {
      setShowBankModal(true);
      return;
    }
    if (!advocateId) return;
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

  const totalNet = details?.totalNet || 0;
  const totalPaid = details?.totalPaid || 0;
  const balance = details?.balance || 0;
  const percentPaid = totalNet > 0 ? Math.min(Math.round((totalPaid / totalNet) * 100), 100) : 0;

  if (isLoading) {
    return <MyEarningsSkeleton />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">My Earnings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your settlements and earnings accounting
            </p>
          </div>
        </div>
        <button
          onClick={handleFetchBankDetails}
          disabled={isBankLoading}
          className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          <Building size={16} />
          {isBankLoading ? "Loading..." : "View Bank Details"}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Net Earned */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow transition-shadow">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Net Earned</span>
            <div className="text-2xl font-black text-gray-900">₹{totalNet.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* KPI: Paid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow transition-shadow">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Paid to You</span>
            <div className="text-2xl font-black text-green-600">₹{totalPaid.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* KPI: Outstanding Balance */}
        <div className={`rounded-2xl p-5 flex items-center justify-between transition-all duration-300 border ${balance > 0
          ? "bg-amber-50/80 border-amber-200/90 shadow-sm shadow-amber-100/40 hover:border-amber-300"
          : "bg-green-50/70 border-green-200/80 shadow-sm"
          }`}>
          <div className="space-y-1 flex-1">
            <span className={`text-xs uppercase tracking-wider font-extrabold ${balance > 0 ? 'text-amber-800' : 'text-green-800'}`}>
              {balance > 0 ? "Pending Balance" : "Fully Settled"}
            </span>
            <div className={`text-2xl font-black ${balance > 0 ? 'text-amber-900' : 'text-green-900'}`}>
              ₹{balance.toLocaleString()}
            </div>
            {balance > 0 && (
              <p className="text-xs font-medium text-amber-700/80 mt-1">Will be settled shortly.</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${balance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {balance > 0 ? <AlertCircle size={22} /> : <CheckCircle size={22} />}
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
          <span>Settlement Progress</span>
          <span>
            <span>₹{totalPaid.toLocaleString()} paid of ₹{totalNet.toLocaleString()} ({percentPaid}%)</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentPaid}%` }}
          ></div>
        </div>
      </div>

      {/* Middle Section: Appointments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              Paid Appointments (Earnings)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gross: <span className="font-semibold text-gray-700">₹{details?.appointmentsGross || 0}</span> • Net: <span className="font-semibold text-green-600">₹{details?.appointmentsNet || 0}</span>
            </p>
          </div>
          <span className="text-xs text-gray-500 font-medium">Scroll to load more</span>
        </div>
        <div
          onScroll={handleAppointmentsScroll}
          className="p-0 overflow-auto max-h-[380px] custom-scrollbar relative"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-gray-100 bg-white">
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider w-16">S.No.</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Date</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Client</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Gross</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Platform Fee</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Net Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                    No paid appointments yet.
                  </td>
                </tr>
              ) : (
                appointments.map((apt: any, idx: number) => (
                  <tr key={apt.id} className="hover:bg-blue-50/20 transition-colors odd:bg-white even:bg-gray-50/30">
                    <td className="p-4 text-sm text-gray-500 font-medium">{appointmentsTotalCount - idx}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(apt.createdAt)}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{apt.fullName}</td>
                    <td className="p-4 text-sm text-gray-600">₹{apt.finalPrice}</td>
                    <td className="p-4 text-sm text-red-500 font-medium">-₹{apt.commissionAmount || 0} ({apt.commissionRate || 0}%)</td>
                    <td className="p-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Earned ₹{apt.netPayable || apt.finalPrice}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {isAppointmentsLoading && (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

      {/* Middle Section: Document Sharing Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              Document Sharing Earnings
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Gross: <span className="font-semibold text-gray-700">₹{details?.documentsGross || 0}</span> • Net: <span className="font-semibold text-green-600">₹{details?.documentsNet || 0}</span>
            </p>
          </div>
          <span className="text-xs text-gray-500 font-medium">Scroll to load more</span>
        </div>
        <div
          onScroll={handleDocumentsScroll}
          className="p-0 overflow-auto max-h-[380px] custom-scrollbar relative"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b border-gray-100 bg-white">
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider w-16">S.No.</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Date</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Client</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Gross</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Platform Fee</th>
                <th className="p-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">Net Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                    No document sharing payments yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc: any, idx: number) => (
                  <tr key={doc.id} className="hover:bg-blue-50/20 transition-colors odd:bg-white even:bg-gray-50/30">
                    <td className="p-4 text-sm text-gray-500 font-medium">{documentsTotalCount - idx}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(doc.createdAt)}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{doc.fullName}</td>
                    <td className="p-4 text-sm text-gray-600">₹{doc.finalPrice}</td>
                    <td className="p-4 text-sm text-red-500 font-medium">-₹{doc.commissionAmount || 0} ({doc.commissionRate || 0}%)</td>
                    <td className="p-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Earned ₹{doc.netPayable || doc.finalPrice}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {isDocumentsLoading && (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

      {/* Bottom Section: Timeline History */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="md:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" />
                Payout History
              </h2>
            </div>
            <div
              onScroll={handlePayoutsScroll}
              className="p-6 overflow-auto max-h-[350px] custom-scrollbar flex-1"
            >
              {payouts.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No payouts received yet.
                </div>
              ) : (
                <div className="relative border-l border-gray-200 ml-2 pl-6 space-y-6">
                  {payouts.map((pay: any, idx: number) => (
                    <div key={pay.id} className="relative group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-3 h-3 bg-white rounded-full border border-green-500 group-hover:scale-125 transition-transform duration-200 z-10">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      </span>
                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-bold text-gray-900">
                            Received ₹{pay.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {formatDate(pay.createdAt)}
                          </span>
                        </div>
                        {pay.adminNote && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100/50 mt-1 break-words break-all whitespace-pre-wrap">
                            {pay.adminNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isPayoutsLoading && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading more...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Building size={18} className="text-blue-600" />
                My Bank Details
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {bankDetails ? (
                <>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Bank Name</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{bankDetails.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Account Holder</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{bankDetails.accountHolderName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Account Number</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono tracking-wider">{bankDetails.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">IFSC Code</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono tracking-wider text-blue-700">{bankDetails.ifscCode || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">PAN Number</p>
                      <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm font-mono">{bankDetails.panNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">UPI ID</p>
                      <p className="font-semibold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm">{bankDetails.upiId || 'N/A'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No bank details provided. Go to profile to update.</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
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

function MyEarningsSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-9 w-40 bg-gray-100 rounded-xl" />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-28 bg-gray-200 rounded" />
            </div>
            <div className="w-[46px] h-[46px] bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Progress Visualization Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3" />
      </div>

      {/* Tables Skeleton */}
      {[1, 2].map((tableIndex) => (
        <div key={tableIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-56 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white">
                <tr className="border-b border-gray-100">
                  <th className="p-4"><div className="h-3 w-8 bg-gray-200 rounded" /></th>
                  <th className="p-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="p-4"><div className="h-3 w-20 bg-gray-200 rounded" /></th>
                  <th className="p-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                  <th className="p-4"><div className="h-3 w-24 bg-gray-200 rounded" /></th>
                  <th className="p-4"><div className="h-3 w-16 bg-gray-200 rounded" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-6" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                    <td className="p-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Payout History Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 ml-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full mt-1.5 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
                <div className="h-10 w-3/4 bg-gray-50 border border-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
