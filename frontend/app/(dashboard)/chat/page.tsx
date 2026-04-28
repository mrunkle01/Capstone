"use client";

// Chat is now a global overlay mounted in (dashboard)/layout.tsx via ChatOverlayProvider.
// This route redirects to /dashboard so old links/bookmarks don't 404.
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import ChatPanel from "@/components/chat/ChatPanel";
// export default function Chat() {
//     const [isOpen, setIsOpen] = useState(true);
//     const router = useRouter();
//     const handleClose = () => {
//         setIsOpen(false);
//         setTimeout(() => router.back(), 300);
//     };
//     return (
//         <div className="flex-1 min-h-screen" style={{ background: "#f0ece3" }}>
//             <ChatPanel isOpen={isOpen} onClose={handleClose} />
//         </div>
//     );
// }

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Chat() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);
    return null;
}
