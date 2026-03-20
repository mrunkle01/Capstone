"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function Dashboard() {
    const searchParams = useSearchParams();
    const [sectionInfo, setSectionInfo] = useState<SectionResponse | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const userInfo = {
            topic: searchParams.get("topic") ?? "Generic Drawing",
            timeCommit: searchParams.get("timeCommit") ?? "30 minutes",
            skillLevel: searchParams.get("skillLevel") ?? "Beginner",
        };
        loadSections(userInfo)
            .then(setSectionInfo)
            .catch((e) => { setError(true); console.error(e); });
    }, [searchParams]);

    if (error) {
        return (
            <div className="d-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "grey" }}>Failed to load dashboard</div>
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