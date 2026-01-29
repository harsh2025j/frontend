"use client";

import MembershipForm from "./components/MembershipForm";

export default function MembershipPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900">Membership Application</h1>
                <p className="text-gray-500">Complete your profile to request content management permissions.</p>
            </div>

            <MembershipForm />
        </div>
    );
}
