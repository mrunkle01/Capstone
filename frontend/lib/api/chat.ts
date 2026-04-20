const API = process.env.NEXT_PUBLIC_API_URL;

export async function sendChatMessage(message: string): Promise<string> {
    // Start the chat job
    const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to send message");

    const { job_id } = await res.json();

    // Poll every 3 seconds until the AI replies
    while (true) {
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await fetch(`${API}/api/chat/status/${job_id}`, {
            credentials: "include",
        });
        if (!poll.ok) throw new Error("Failed to check chat status");

        const job = await poll.json();
        if (job.status === "complete") return job.reply as string;
        if (job.status === "error") throw new Error(job.error || "Chat failed");
    }
}
