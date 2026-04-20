export type Feedback = {
    intro: string;
    strengths: string;
    weaknesses: string;
    critique: string;
    conclusion: string;
};

export type AssessmentResult = {
    score: number;
    feedback: Feedback;
    report_id: number;
};