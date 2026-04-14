import { ChatMessage as ChatMessageType } from "@/lib/types/chat";

interface ChatMessageProps {
    message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user";

    const bubbleClasses = isUser
        ? "bg-neutral-800 text-white rounded-2xl rounded-br-sm"
        : "bg-neutral-100 text-neutral-900 rounded-2xl rounded-bl-sm";

    const wrapperClasses = isUser ? "justify-end" : "justify-start";

    return (
        <div className={`flex ${wrapperClasses} mb-3`}>
            <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${bubbleClasses}`}>
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
