export type LessonStatus = "completed" | "active" | "locked"
export interface Lesson {
    id: string
    title: string
    status: string //this may change to lesson status type
    content: string
}
export interface Section {
    id: number
    title: string
    lessons: Lesson []
}
export interface User {
    username : string
    goal: string
    timeCommitment: string
}
export interface Assessment {//TODO this will be different i believe later
    id: string
    prompt: string
}
export const mockDashboardData = {
    user: {
        username: "mark_draws",
        goal: "Character Design",
        timeCommitment: "1hr/day",
    },
    sections: [
        {
            id: "1",
            title: "Basic Form & Shape",
            lessons: [
                { id: "1", title: "Introduction to Form", status: "completed", content: "This is about form"},
                { id: "2", title: "Drawing Cylinders", status: "active", content: "This is about cylinders" },
                { id: "3", title: "Combining Forms", status: "locked", content: "This is about combining forms" },
            ],
            assessment: {
                id: "1",
                prompt: "Submit a drawing demonstrating your understanding of basic forms including cubes, cylinders, and spheres."
            }
        }
    ]
}