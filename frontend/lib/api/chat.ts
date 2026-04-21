import { ChatAction, ChatContext } from "@/lib/types/chat";

const API = process.env.NEXT_PUBLIC_API_URL;

export interface ChatResult {
    reply: string;
    action: ChatAction | null;
}

export async function sendChatMessage(
    message: string,
    context: ChatContext = {}
): Promise<ChatResult> {
    const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
    });
    if (!res.ok) throw new Error("Failed to send message");

    const { job_id } = await res.json();

    while (true) {
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await fetch(`${API}/api/chat/status/${job_id}`, {
            credentials: "include",
        });
        if (!poll.ok) throw new Error("Failed to check chat status");

        const job = await poll.json();
        if (job.status === "complete") {
            return { reply: job.reply ?? "", action: job.action ?? null };
        }
        if (job.status === "error") throw new Error(job.error || "Chat failed");
    }
}

export async function pollJobUntilDone(job_id: string): Promise<void> {
    while (true) {
        await new Promise((r) => setTimeout(r, 4000));
        const poll = await fetch(`${API}/api/chat/status/${job_id}`, {
            credentials: "include",
        });
        if (!poll.ok) return;
        const job = await poll.json();
        if (job.status === "complete" || job.status === "error") return;
    }
}

export async function confirmChatAction(
    action_type: string,
    data: Record<string, unknown>
): Promise<void> {
    const res = await fetch(`${API}/api/chat/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type, data }),
    });
    if (!res.ok) throw new Error("Failed to confirm action");
}
