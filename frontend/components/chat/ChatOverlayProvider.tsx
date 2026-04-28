"use client";

import { createContext, useContext, useState } from "react";
import ChatPanel from "@/components/chat/ChatPanel";

interface ChatOverlayContextValue {
    openChat: () => void;
    closeChat: () => void;
}

const ChatOverlayContext = createContext<ChatOverlayContextValue>({
    openChat: () => {},
    closeChat: () => {},
});

export function useChatOverlay() {
    return useContext(ChatOverlayContext);
}

export default function ChatOverlayProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <ChatOverlayContext.Provider value={{ openChat: () => setIsOpen(true), closeChat: () => setIsOpen(false) }}>
            {children}
            <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </ChatOverlayContext.Provider>
    );
}
