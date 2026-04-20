import { getReport } from "./assessment";
import { AssessmentResult, Feedback } from "@/lib/types/assessment";

export async function loadResult(reportId: number): Promise<{
    result: AssessmentResult;
    imageUrl: string | null;
}> {
    const data = await getReport(reportId);

    // Handle both old string feedback and new structured object
    const feedback: Feedback = typeof data.feedback === "string"
        ? { intro: data.feedback, strengths: "", weaknesses: "", critique: "", conclusion: "" }
        : data.feedback;

    return {
        result: { score: data.score, feedback, report_id: data.id },
        imageUrl: data.image ? `data:image/png;base64,${data.image}` : null,
    };
}
