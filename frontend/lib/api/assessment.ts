const API = process.env.NEXT_PUBLIC_API_URL;

export async function testImage(formData: FormData, assignment: string){
    const res = await fetch(`${API}/api/gradeImage?assignment=${encodeURIComponent(assignment)}`, {
        method: "POST",
        credentials: "include",
        body: formData
    })
    if (!res.ok) {
        const err = await res.text();
        console.error("gradeImage error:", err);
        throw new Error("Failed to start grading");
    }

    const { job_id } = await res.json();

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

