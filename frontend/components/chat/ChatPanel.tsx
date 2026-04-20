"use client";

import { useEffect, useRef, useState} from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { sendChatMessage } from "@/lib/api/chat";
import styles from "./chat.module.css";

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
    const messagesRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState("");
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        if (isOpen && messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [isOpen, messages]);

    async function handleSubmit() {
        const trimmed = input.trim();
        if (!trimmed || waiting) return;

        const userMsg: ChatMessageType = {
            id: Date.now().toString(),
            role: "user",
            content: trimmed,
            actionStatus: null,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setWaiting(true);

        try {
            const reply = await sendChatMessage(trimmed);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: reply,
                actionStatus: null,
                timestamp: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
                actionStatus: null,
                timestamp: new Date(),
            }]);
        } finally {
            setWaiting(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") handleSubmit();
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
                <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid #d8d0c0" }}>
                    <h2 className="text-base font-semibold" style={{ color: "#2d2d2a", fontFamily: "Georgia, 'Playfair Display', serif", fontWeight: 400 }}>Pikaso</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close chat"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-xl leading-none"
                        style={{ color: "#9a8e7a" }}
                    >
                        ×
                    </button>
                </header>

                <div ref={messagesRef} className={`${styles.messages} px-5 py-4`}>
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {waiting && (
                        <div className={styles.typingIndicator}>
                            <span /><span /><span />
                        </div>
                    )}
                </div>

                <div className="px-4 py-3" style={{ borderTop: "0.5px solid #d8d0c0" }}>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Pikaso..."
                            disabled={waiting}
                            className="flex-1 px-4 py-2 text-sm rounded-full focus:outline-none disabled:opacity-50"
                            style={{ background: "#ede8df", border: "0.5px solid #d8d0c0", color: "#2d2d2a" }}
                        />
                        <button
                            onClick={handleSubmit}
                            aria-label="Send message"
                            disabled={waiting}
                            className="w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-40"
                            style={{ background: "#b5995a", color: "#ffffff" }}
                        >
                            →
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
