export interface LessonContent {
    time: number
    skill: string
    directions: string
    exercises: string[]
}

export interface Lesson {
    title: string
    content: LessonContent
    order: number
}

export interface Requirement {
    name: string
    r_id: string
    points: number
}

export interface Assessment {
    title: string
    content: string
    requirements: Requirement[]
}

export interface Resource {
    title: string
    url: string
    source: string
}

export interface SectionResponse {
    Section: string
    Lessons: Lesson[]
    Assessment: Assessment
    resources: Resource[]
}

export interface DashboardSection {
    id: number
    order: number
    contents: SectionResponse
    progress: {
        completedLessons: number
        assessmentReportId: number | null
        assessmentScore: number | null
    }
}