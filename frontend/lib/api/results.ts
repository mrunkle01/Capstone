import { getReport } from "./assessment";
import { AssessmentResult } from "@/lib/types/assessment";

export async function loadResult(reportId: number): Promise<{
    result: AssessmentResult;
    imageUrl: string | null;
}> {
    const data = await getReport(reportId);
    return {
        result: { score: data.score, feedback: data.feedback, report_id: data.id },
        imageUrl: data.image ? `data:image/png;base64,${data.image}` : null,
    };
}
