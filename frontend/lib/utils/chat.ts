import { ChatMessage } from "@/lib/types/chat";

export const mockConversation: ChatMessage[] = [
    {
        id: "1",
        role: "assistant",
        content:
            "Hey! I can answer questions about your current lessons or suggest changes to your plan. What do you need?",
        actionStatus: null,
        timestamp: new Date("2026-04-14T10:00:00"),
    },
    {
        id: "2",
        role: "user",
        content: "Can you add a harder exercise on cylinders to my current section?",
        actionStatus: null,
        timestamp: new Date("2026-04-14T10:00:30"),
    },
    {
        id: "3",
        role: "assistant",
        content:
            "Done! I've added an advanced cylinder foreshortening exercise as Lesson 4 in your current section.",
        actionStatus: "accepted",
        timestamp: new Date("2026-04-14T10:00:45"),
    },
    {
        id: "4",
        role: "user",
        content: "Move me to the Perspective section",
        actionStatus: null,
        timestamp: new Date("2026-04-14T10:01:10"),
    },
    {
        id: "5",
        role: "assistant",
        content:
            "I can't do that — Perspective is locked until you complete and pass Sections 2 and 3.",
        actionStatus: "rejected",
        timestamp: new Date("2026-04-14T10:01:20"),
    },
];
