import {SectionResponse} from "@/lib/types/dashboard";
export type UserInfo = {
    topic: string
    timeCommit: string
    skillLevel: string
}

const API = process.env.NEXT_PUBLIC_API_URL;
export async function loadSections(userInfo: UserInfo): Promise<SectionResponse> {
    const url = `${API}/api/generate?topic=${userInfo.topic}&timeCommit=${userInfo.timeCommit}%2FDay&skillLevel=${userInfo.skillLevel}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to start generation");

    const { job_id } = await res.json();

    while (true) {
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(`${API}/api/generate/status/${job_id}`, { credentials: "include" });
        if (!poll.ok) throw new Error("Failed to check job status");

        const job = await poll.json();
        if (job.status === "complete") return job.data as SectionResponse;
        if (job.status === "error") throw new Error(job.error || "AI generation failed");
        // status === "pending" — keep polling
    }
}
