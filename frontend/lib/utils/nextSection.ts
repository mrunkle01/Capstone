import { SectionResponse } from "@/lib/types/dashboard";

export interface NextSectionParams {
    topic: string;
    amount: number;
}

export function buildNextSectionParams(
    score: number,
    feedback: string,
    previousSection: SectionResponse,
): NextSectionParams {
    const prevTitle = previousSection.Section;
    const lessonTitles = previousSection.Lessons
        .sort((a, b) => a.order - b.order)
        .map((l) => l.title)
        .join(", ");

    let amount: number;
    let directive: string;

    if (score >= 70) {
        amount = 3;
        directive =
            "The student performed well. Generate 3 new lessons that build on their strengths and advance to the next skill level.";
    } else if (score >= 40) {
        amount = 4;
        directive =
            "The student showed partial understanding. Generate 3 new lessons advancing the topic, plus 1 remediation lesson reinforcing the weak areas identified in the feedback.";
    } else {
        amount = 3;
        directive =
            "The student struggled significantly. Generate 3 lessons that revisit similar concepts with more guided practice and remediation before advancing.";
    }

    const topic = [
        `Previous section: "${prevTitle}".`,
        `Lessons completed: ${lessonTitles}.`,
        `Assessment score: ${score}/100.`,
        `Assessment feedback: ${feedback}`,
        directive,
    ].join(" ");

    return { topic, amount };
}
