export type MessageRole = "user" | "assistant";

export type ActionStatus = "accepted" | "rejected" | null;

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    actionStatus: ActionStatus;
    timestamp: Date;
}
