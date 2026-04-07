const API = process.env.NEXT_PUBLIC_API_URL;

export async function submitPretestImage(
    formData: FormData,
    assignment: string
): Promise<{ job_id: string; report_id: string }> {
    const res = await fetch(
        `${API}/api/gradeImage?assignment=${encodeURIComponent(assignment)}`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        }
    );
    if (!res.ok) {
        const err = await res.text();
        console.error("gradeImage error:", err);
        throw new Error("Failed to start grading");
    }
    return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function pollGradingJob(job_id: string): Promise<Record<string, any>> {
    while (true) {
        await new Promise((r) => setTimeout(r, 5000));
        const poll = await fetch(`${API}/api/gradeImage/status/${job_id}`, {
            method: "POST",
            credentials: "include",
        });
        if (!poll.ok) throw new Error("Failed to check grading status");

        const job = await poll.json();
        if (job.status === "complete") return job.data;
        if (job.status === "error") throw new Error(job.error || "AI grading failed");
        // status === "pending" — keep polling
    }
}

export async function resolveAllPretestScores(
    jobIds: string[],
    goal: string,
    timeCommitment: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ dashboard: Record<string, unknown>; pretestScores: Record<string, any> }> {
    // Poll all 4 jobs in at same time
    const results = await Promise.all(jobIds.map((id) => pollGradingJob(id)));

    const pretestScores = {
        gesture: results[0],
        lifeDrawing: results[1],
        stillLife: results[2],
        thumbnail: results[3],
    };
    // Hit the generate endpoint with pretest body
    const res = await fetch(`${API}/api/generate/pretest`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pretest_scores: pretestScores,
            goal,
            time_commitment: timeCommitment,
        }),
    });
    if (!res.ok) throw new Error("Failed to start dashboard generation");

    const { job_id } = await res.json();

    while (true) {
        await new Promise((r) => setTimeout(r, 5000));
        const poll = await fetch(`${API}/api/generate/status/${job_id}`, {
            credentials: "include",
        });
        if (!poll.ok) throw new Error("Failed to check generation status");

        const job = await poll.json();
        if (job.status === "complete") return { dashboard: job.data, pretestScores };
        if (job.status === "error") throw new Error(job.error || "Dashboard generation failed");
        // status === "pending" — keep polling
    }
}
