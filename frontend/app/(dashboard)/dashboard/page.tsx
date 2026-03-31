"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SectionResponse } from "@/lib/types/dashboard";
import { loadDashboard, generateSections } from "@/lib/api/dashboard";
import Greeting from "@/components/dashboard/Greeting";
import LessonList from "@/components/dashboard/LessonList";
import DashboardSkeleton from "./loading";

function DashboardContent() {
    const searchParams = useSearchParams();
    const [sectionInfo, setSectionInfo] = useState<SectionResponse | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [retryKey, setRetryKey] = useState(0);
    const expandLesson = searchParams.get("expandLesson");

    useEffect(() => {
        let cancelled = false;
        setError(false);
        setLoading(true);
        setSectionInfo(null);

        async function fetchDashboard() {
            try {
                // First, try to load a previously saved dashboard from the backend
                const saved = await loadDashboard();
                if (!cancelled && saved) {
                    setSectionInfo(saved);
                    setLoading(false);
                    return;
                }

                // No saved dashboard — check if we have generation params (from pretest)
                const topic = searchParams.get("topic");
                const timeCommit = searchParams.get("timeCommit");
                const skillLevel = searchParams.get("skillLevel");

                if (!topic || !timeCommit || !skillLevel) {
                    // No saved dashboard and no params to generate — show empty state
                    if (!cancelled) {
                        setLoading(false);
                    }
                    return;
                }

                // Generate a new plan via AI
                const data = await generateSections({ topic, timeCommit, skillLevel });
                if (!cancelled) {
                    setSectionInfo(data);
                    setLoading(false);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                    console.error(e);
                }
            }
        }

        fetchDashboard();
        return () => { cancelled = true; };
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

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!sectionInfo) {
        return (
            <div className="d-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <Greeting />
                <div style={{ color: "grey", textAlign: "center" }}>
                    You don&apos;t have a lesson plan yet.
                </div>
                <Link href="/pretest" className="d-btn-demo-pretest">
                    Create your first plan
                </Link>
            </div>
        );
    }

    return (
        <div className="d-main">
            <Greeting />
            <LessonList sectionInfo={sectionInfo} expandCurrent={expandLesson === "current"} />
            <div style={{ marginTop: "24px", textAlign: "center" }}>
                <Link href="/pretest" className="d-btn-demo-pretest">
                    Try a different plan
                </Link>
            </div>
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