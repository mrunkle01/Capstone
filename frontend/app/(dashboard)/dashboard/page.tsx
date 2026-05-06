"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardSection } from "@/lib/types/dashboard";
import { loadDashboard, generateSections } from "@/lib/api/dashboard";
import { useDashboardContext } from "@/lib/context/DashboardContext";
import Greeting from "@/components/dashboard/Greeting";
import LessonList from "@/components/dashboard/LessonList";
import SectionPlaceholder from "@/components/dashboard/SectionPlaceholder";
import DashboardSkeleton from "./loading";

function DashboardContent() {
    const searchParams = useSearchParams();
    const { setAssessment } = useDashboardContext();
    const [sections, setSections] = useState<DashboardSection[] | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [retryKey, setRetryKey] = useState(0);
    const expandLesson = searchParams.get("expandLesson");

    useEffect(() => {
        let cancelled = false;
        setError(false);
        setLoading(true);
        setSections(null);

        async function fetchDashboard() {
            try {
                const saved = await loadDashboard();
                if (!cancelled && saved && saved.length > 0) {
                    setSections(saved);
                    const latest = saved[saved.length - 1];
                    setAssessment(latest.contents.Assessment);
                    setLoading(false);
                    return;
                }

                const topic = searchParams.get("topic");
                const timeCommit = searchParams.get("timeCommit");
                const skillLevel = searchParams.get("skillLevel");

                if (!topic || !timeCommit || !skillLevel) {
                    if (!cancelled) {
                        setLoading(false);
                    }
                    return;
                }

                // Guard against React Strict Mode double-firing the effect
                if (cancelled) return;
                const data = await generateSections({ topic, timeCommit, skillLevel });
                if (!cancelled) {
                    // Re-fetch to get the saved section with its DB id
                    const refreshed = await loadDashboard();
                    if (refreshed && refreshed.length > 0) {
                        setSections(refreshed);
                        const latest = refreshed[refreshed.length - 1];
                        setAssessment(latest.contents.Assessment);
                    } else {
                        // Fallback: wrap the generated data as a single section
                        setSections([{ id: 0, order: 1, contents: data, progress: { completedLessons: 0, assessmentReportId: null, assessmentScore: null } }]);
                        setAssessment(data.Assessment);
                    }
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

    if (!sections || sections.length === 0) {
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
            {sections.map((section, idx) => {
                const isLatest = idx === sections.length - 1;
                return (
                    <LessonList
                        key={section.id}
                        sectionId={section.id}
                        sectionOrder={section.order}
                        sectionInfo={section.contents}
                        initialProgress={section.progress}
                        expandCurrent={isLatest && expandLesson === "current"}
                        isCompleted={!isLatest}
                    />
                );
            })}
            <SectionPlaceholder order={sections.length + 1} />
            <SectionPlaceholder order={sections.length + 2} />
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