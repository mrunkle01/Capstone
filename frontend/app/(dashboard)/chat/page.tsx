"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/chat/ChatPanel";

export default function Chat() {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => router.back(), 300);
    };

    return (
        <div className="flex-1 min-h-screen" style={{ background: "#f0ece3" }}>
            <ChatPanel isOpen={isOpen} onClose={handleClose} />
        </div>
    );
}
