import { SectionResponse, DashboardSection } from "@/lib/types/dashboard";

export type UserInfo = {
    topic: string;
    timeCommit: string;
    skillLevel: string;
};

const API = process.env.NEXT_PUBLIC_API_URL;

export async function loadDashboard(): Promise<DashboardSection[] | null> {
    const res = await fetch(`${API}/api/dashboard`, { credentials: "include" });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.message || !data.sections || data.sections.length === 0) return null;

    return data.sections as DashboardSection[];
}


export async function loadLatestSection(): Promise<SectionResponse | null> {
    const sections = await loadDashboard();
    if (!sections || sections.length === 0) return null;
    return sections[sections.length - 1].contents;
}

export async function generateSections(userInfo: UserInfo, amount: number = 3): Promise<SectionResponse> {
    const url = `${API}/api/generate?topic=${encodeURIComponent(userInfo.topic)}&timeCommit=${encodeURIComponent(userInfo.timeCommit)}&skillLevel=${encodeURIComponent(userInfo.skillLevel)}&amount=${amount}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to start generation");

    const { job_id } = await res.json();

    while (true) {
        await new Promise((r) => setTimeout(r, 5000));
        const poll = await fetch(`${API}/api/generate/status/${job_id}`, { credentials: "include" });
        if (!poll.ok) throw new Error("Failed to check job status");

        const job = await poll.json();
        if (job.status === "complete") return job.data as SectionResponse;
        if (job.status === "error") throw new Error(job.error || "AI generation failed");
        // status === "pending" — keep polling.
    }
}

export type DashboardProgress = {
    completedLessons: number;
    assessmentReportId: number | null;
    assessmentScore: number | null;
};

export async function loadProgress(): Promise<DashboardProgress> {
    const res = await fetch(`${API}/api/dashboard/progress`, { credentials: "include" });
    if (!res.ok) return { completedLessons: 0, assessmentReportId: null, assessmentScore: null };
    const data = await res.json();
    return {
        completedLessons: data.completedLessons ?? 0,
        assessmentReportId: data.assessmentReportId ?? null,
        assessmentScore: data.assessmentScore ?? null,
    };
}

export async function saveProgress(sectionId: number, progress: DashboardProgress): Promise<void> {
    await fetch(`${API}/api/dashboard/progress/${sectionId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
    });
}

export async function updateUserInfo(userInfo: UserInfo): Promise<void> {
    const res = await fetch(`${API}/api/userInfo`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            artistic_goal: userInfo.topic,
            time_commitment: userInfo.timeCommit,
            skill_level: userInfo.skillLevel,
        }),
    });
    if (!res.ok) {
        console.error("Failed to save user preferences");
    }
}