import {SectionResponse} from "@/lib/types/dashboard";
export type UserInfo = {
    topic: string
    timeCommit: string
    skillLevel: string
}
export async function loadSections(userInfo:UserInfo){
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/generate?topic=${userInfo.topic}&timeCommit=${userInfo.timeCommit}%2FDay&skillLevel=${userInfo.skillLevel}`
    const response = await fetch(url, {
        method: "GET",
    })
    if (!response.ok) {
        throw new Error("Failed to load sections");
    }
    const data: SectionResponse = await response.json()
    return data;
}