'use client'
import {SectionResponse, Lesson, Assessment, Requirement} from "@/lib/types/dashboard";
interface LessonListProps {
    sectionInfo: SectionResponse;
}

export default function LessonList({ sectionInfo }: LessonListProps){
    const lessons: Lesson[] = [...sectionInfo.Lessons].sort((a, b)=> a.order - b.order);
    const assessment: Assessment = sectionInfo.Assessment;
    return (
        <div className="flex flex-col gap-4">
            <div className="text-xl font-bold border-b pb-2">{sectionInfo.Section}</div>
            <ul className="flex flex-col gap-3">
                {lessons && lessons.map((lesson: Lesson) => (
                    <li key={lesson.order} className="border rounded p-3">
                        <div className="font-semibold mb-1">Lesson {lesson.order}: {lesson.title}</div>
                        <div className="text-sm text-gray-600">{lesson.content}</div>
                    </li>
                ))}
            </ul>
            <div className="border rounded p-4 bg-gray-50">
                <div className="font-bold text-lg mb-2">{assessment.title}</div>
                <div className="text-sm mb-3">{assessment.content}</div>
                <ol className="flex flex-col gap-1 list-decimal list-inside">
                    {assessment.requirements && assessment.requirements.map((requirement: Requirement, index: number) => (
                        <li key={index} className="text-sm">
                            {requirement.name} — <span className="font-medium">{requirement.points} pts</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}