import { ChatMessage as ChatMessageType } from "@/lib/types/chat";

interface ChatMessageProps {
    message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user";

    const bubbleStyle = isUser
        ? { background: "#2d2d2a", color: "#f7f4ef" }
        : { background: "#ede8df", color: "#2d2d2a", border: "0.5px solid #d8d0c0" };

    const bubbleClasses = isUser
        ? "rounded-2xl rounded-br-sm"
        : "rounded-2xl rounded-bl-sm";

    const wrapperClasses = isUser ? "justify-end" : "justify-start";

    return (
        <div className={`flex ${wrapperClasses} mb-3`}>
            <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${bubbleClasses}`} style={bubbleStyle}>
                {message.actionStatus === "accepted" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 mr-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold align-middle">
                        ✓
                    </span>
                )}
                {message.actionStatus === "rejected" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 mr-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold align-middle">
                        !
                    </span>
                )}
                <span className="align-middle">{message.content}</span>
            </div>
        </div>
    );
}
