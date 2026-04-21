export type MessageRole = "user" | "assistant";

export type ActionStatus = "accepted" | "rejected" | null;

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    actionStatus: ActionStatus;
    timestamp: Date;
    action?: ChatAction | null;
}

export interface ChatAction {
    type: "LESSON_SWAP" | "TIME_CHANGE";
    status: "approved" | "denied" | "pending_confirmation";
    reason: string;
    data: Record<string, unknown>;
}

export interface ChatContext {
    current_lesson_id?: number | null;
    current_section_id?: number | null;
    user_goal?: string;
    user_time_availability?: string;
}
