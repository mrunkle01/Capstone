export interface Lesson {
    title: string
    content: string
    order: number
}

export interface Requirement {
    name: string
    points: number
}

export interface Assessment {
    title: string
    content: string
    requirements: Requirement[]
}

export interface SectionResponse {
    Section: string
    Lessons: Lesson[]
    Assessment: Assessment
}

