"use client";

import { useEffect, useState } from "react";
import { SectionResponse } from "@/lib/types/dashboard";
import { loadSections, UserInfo } from "@/lib/api/dashboard";
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
    const [sectionInfo, setSectionInfo] = useState<SectionResponse | null>(null);
    const [error, setError] = useState(false);
    const userInfo: UserInfo = {
        topic: "realism",
        timeCommit: "30 minutes",
        skillLevel: "Beginner"
    }
    useEffect(() => {
        loadSections(userInfo)
            .then(setSectionInfo)
            .catch((e) => {setError(true);console.error(e);});
    }, []);

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