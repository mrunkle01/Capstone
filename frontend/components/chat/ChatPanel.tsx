"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType, ChatContext } from "@/lib/types/chat";
import { sendChatMessage, confirmChatAction, pollJobUntilDone } from "@/lib/api/chat";
import { loadUser } from "@/lib/api/profile";
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
    const [chatContext, setChatContext] = useState<ChatContext>({});
    // Tracks a pending TIME_CHANGE confirmation — { msgId, time_value }
    const [pendingConfirm, setPendingConfirm] = useState<{ msgId: string; time_value: string } | null>(null);

    useEffect(() => {
        if (isOpen && messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [isOpen, messages]);

    // Load user context once when the panel opens
    useEffect(() => {
        if (!isOpen) return;
        loadUser().then((user) => {
            if (!user) return;
            setChatContext({
                user_goal: user.artistic_goal ?? "",
                user_time_availability: user.time_commitment ?? "",
            });
        });
    }, [isOpen]);

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
            const result = await sendChatMessage(trimmed, chatContext);
            const aiMsg: ChatMessageType = {
                id: Date.now().toString(),
                role: "assistant",
                content: result.reply,
                actionStatus: null,
                timestamp: new Date(),
                action: result.action,
            };
            setMessages(prev => [...prev, aiMsg]);

            // If lesson swap approved, keep loading until background generation finishes
            if (
                result.action?.type === "LESSON_SWAP" &&
                result.action.status === "approved" &&
                result.action.data?.generation_job_id
            ) {
                await pollJobUntilDone(result.action.data.generation_job_id as string);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Your lesson has been updated — refresh your dashboard to see it.",
                    actionStatus: null,
                    timestamp: new Date(),
                }]);
            }

            // Surface a confirmation card if the AI is requesting a time change
            if (
                result.action?.type === "TIME_CHANGE" &&
                result.action.status === "pending_confirmation" &&
                result.action.data?.time_value
            ) {
                const requested = result.action.data.time_value.toString().split("/")[0].trim().toLowerCase();
                const current = (chatContext.user_time_availability || "").split("/")[0].trim().toLowerCase();
                if (requested === current) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: `You're already practicing ${result.action.data.time_value} — no change needed.`,
                        actionStatus: null,
                        timestamp: new Date(),
                    }]);
                } else {
                    setPendingConfirm({
                        msgId: aiMsg.id,
                        time_value: result.action.data.time_value as string,
                    });
                }
            }
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

    async function handleConfirm() {
        if (!pendingConfirm) return;
        try {
            await confirmChatAction("TIME_CHANGE", { time_value: pendingConfirm.time_value });
            setMessages(prev => prev.map(m =>
                m.id === pendingConfirm.msgId ? { ...m, actionStatus: "accepted" as const } : m
            ));
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: `Done — your practice time has been updated to ${pendingConfirm.time_value}.`,
                actionStatus: null,
                timestamp: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Couldn't save that change. Please try again.",
                actionStatus: null,
                timestamp: new Date(),
            }]);
        } finally {
            setPendingConfirm(null);
        }
    }

    function handleDeny() {
        if (!pendingConfirm) return;
        setMessages(prev => prev.map(m =>
            m.id === pendingConfirm.msgId ? { ...m, actionStatus: "rejected" as const } : m
        ));
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: "No problem — your practice time stays the same.",
            actionStatus: null,
            timestamp: new Date(),
        }]);
        setPendingConfirm(null);
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
                    {pendingConfirm && (
                        <div className={styles.confirmCard}>
                            <p className={styles.confirmText}>
                                Update practice time to <strong>{pendingConfirm.time_value}</strong>?
                            </p>
                            <div className={styles.confirmButtons}>
                                <button onClick={handleConfirm} className={styles.confirmYes}>Confirm</button>
                                <button onClick={handleDeny} className={styles.confirmNo}>Cancel</button>
                            </div>
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
