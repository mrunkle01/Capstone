"use client";

import { useEffect, useRef, useState} from "react";
import ChatMessage from "./ChatMessage";
import styles from "./chat.module.css";
import {handleSubmit, mockConversation} from "@/lib/utils/chat";

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
    const messagesRef = useRef<HTMLDivElement>(null);
    const [mockConversation, setMockConversation] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (isOpen && messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [isOpen]);

    function handleSubmit(message: string){
        mockConversation.push({
            id: Date.now().toString(),
            role: "user",
            content: message,
            actionStatus: null,
            timestamp: new Date()
        });
    }

    return (
        <>
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
                role="dialog"
                aria-label="Atelier AI chat"
            >
                <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                    <h2 className="text-base font-semibold text-neutral-900">Atelier AI</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close chat"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 text-xl leading-none"
                    >
                        ×
                    </button>
                </header>

                <div ref={messagesRef} className={`${styles.messages} px-5 py-4`}>
                    {mockConversation.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                </div>

                <div className="border-t border-neutral-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ask Atelier AI..."
                            className="flex-1 px-4 py-2 text-sm rounded-full bg-neutral-100 border border-transparent focus:outline-none focus:border-neutral-300"
                        />
                        <button
                            onClick={handleSubmit()}
                            aria-label="Send message"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                        >
                            →
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
