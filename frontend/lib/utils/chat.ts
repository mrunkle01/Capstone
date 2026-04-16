import { ChatMessage } from "@/lib/types/chat";


export const mockConversation: ChatMessage[] = [

];
export function handleSubmit(message: string){
    mockConversation.push({
        id: Date.now().toString(),
        role: "user",
        content: message,
        actionStatus: null,
        timestamp: new Date()
    });

}
