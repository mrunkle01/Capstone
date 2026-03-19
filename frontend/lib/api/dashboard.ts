import {SectionResponse} from "@/lib/types/dashboard";

export async function loadSections(){
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sectionDemo`
    //need to add body for the form vars
    const response = await fetch(url, {
        method: "GET",
        body: JSON.stringify({
            topic: "Manga",
            timeCommit: "1Hr/Day",
            skillLevel: "Beginner"
        })
    })
    if (!response.ok) {
        throw new Error("Failed to load sections");
    }
    const data: SectionResponse = await response.json()
    return data;
}