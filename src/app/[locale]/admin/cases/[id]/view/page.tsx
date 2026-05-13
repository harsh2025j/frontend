"use client";

import React from "react";
import CaseView from "@/app/[locale]/cases/[id]/CaseView";
import { useParams } from "next/navigation";

export default function AdminCaseViewPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="max-w-6xl mx-auto">
            <CaseView caseId={id} />
        </div>
    );
}
