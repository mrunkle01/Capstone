"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionResponse } from "@/lib/types/dashboard";
import { loadSections } from "@/lib/api/dashboard";
import Greeting from "@/components/dashboard/Greeting";
import LessonList from "@/components/dashboard/LessonList";


function DashboardSkeleton() {
    return (
        <div className="d-main d-skeleton">
            <div className="d-skel-label-row">
                <div className="d-skel-gold-dash" />
                <div className="d-skel-label" />
            </div>
            <div className="d-skel-welcome" />
            <div className="d-skel-section-bar" />
        </div>
    );
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const [sectionInfo, setSectionInfo] = useState<SectionResponse | null>(null);
    const [error, setError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        setError(false);
        setSectionInfo(null);
        const userInfo = {
            topic: searchParams.get("topic") ?? "Generic Drawing",
            timeCommit: searchParams.get("timeCommit") ?? "30 minutes",
            skillLevel: searchParams.get("skillLevel") ?? "Beginner",
        };
        loadSections(userInfo)
            .then(setSectionInfo)
            .catch((e) => { setError(true); console.error(e); });
    }, [searchParams, retryKey]);

    if (error) {
        return (
            <div className="d-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <div style={{ color: "grey" }}>Something went wrong loading your lesson plan.</div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setRetryKey(k => k + 1)}
                        style={{ padding: "8px 16px", cursor: "pointer" }}
                    >
                        Retry
                    </button>
                    <Link href="/pretest" style={{ padding: "8px 16px" }}>
                        Back to form
                    </Link>
                </div>
            </div>
        );
    }

    if (!sectionInfo) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="d-main">
            <Greeting />
            <LessonList sectionInfo={sectionInfo} />
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}