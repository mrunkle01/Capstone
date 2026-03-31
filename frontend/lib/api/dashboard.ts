import { SectionResponse } from "@/lib/types/dashboard";

export type UserInfo = {
    topic: string;
    timeCommit: string;
    skillLevel: string;
};

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Try to load a previously saved dashboard from the backend.
 * Returns the SectionResponse if the user has one, or null if not.
 */
export async function loadDashboard(): Promise<SectionResponse | null> {
    const res = await fetch(`${API}/api/dashboard`, { credentials: "include" });
    if (!res.ok) return null;

    const data = await res.json();
    // Backend returns {message: "No contents"} with 404 when empty,
    // but also might return an empty object if nothing saved yet
    if (!data || data.message || !data.Section) return null;

    return data as SectionResponse;
}

/**
 * Kick off AI generation and poll until complete.
 * Returns the generated SectionResponse.
 */
export async function generateSections(userInfo: UserInfo): Promise<SectionResponse> {
    const url = `${API}/api/generate?topic=${encodeURIComponent(userInfo.topic)}&timeCommit=${encodeURIComponent(userInfo.timeCommit)}&skillLevel=${encodeURIComponent(userInfo.skillLevel)}`;
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
        // status === "pending" — keep polling
    }
}

/**
 * Save user preferences (topic, time commitment, skill level) to their profile.
 */
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