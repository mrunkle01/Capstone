"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { submitPretestImage, resolveAllPretestScores } from "@/lib/api/pretest";
import { updateProfile } from "@/lib/api/profile";
import styles from "./pretest.module.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-playfair",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    variable: "--font-dm-sans",
});

const QUESTIONS = [
    {
        id: 1,
        title: "Gesture Drawing",
        refKey: "gesture",
        image: "/pImg/gesture-figure.jpg",
        instruction:
            "Using the reference above, draw a gesture drawing with approximate proportions.",
        assignment:
            "Gesture Drawing: Grade this gesture drawing on the following criteria and return ONLY valid JSON with no explanation outside the JSON object.\nCriteria:\n- linework: Assess C, S, and I line usage, line confidence, and varying line weight. Score 0-5.\n- proportions: Assess correct size, distance, and orientation of figure parts relative to each other. Score 0-5.\nReturn format:\n{ linework: { score: X, brief_feedback: '...' }, proportions: { score: X, brief_feedback: '...' } }",
    },
    {
        id: 2,
        title: "Life Drawing",
        refKey: "lifeDrawing",
        image: "/pImg/gesture-figure.jpg",
        instruction:
            "Now refine your gesture drawing into a detailed figure drawing with accurate anatomy and rendering. Draw on top of your gesture as your foundation and submit the completed drawing.",
        assignment:
            "Life Drawing: This drawing was built on top of the student's previous gesture drawing as a base. Grade on the following criteria and return ONLY valid JSON with no explanation outside the JSON object.\nCriteria:\n- anatomy: Assess accuracy of anatomical details over the underlying form. Score 0-3.\n- form: Assess sense of volume and depth of the figure. Score 0-5.\n- proportions: Assess correct size, distance, and orientation of figure parts. Score 0-5.\n- value: Assess rendering of the figure with light and shadow. Score 0-3.\nReturn format:\n{ anatomy: { score: X, brief_feedback: '...' }, form: { score: X, brief_feedback: '...' }, proportions: { score: X, brief_feedback: '...' }, value: { score: X, brief_feedback: '...' } }",
    },
    {
        id: 3,
        title: "Mini Still Life",
        refKey: "stillLife",
        image: "/pImg/still-life.JPG",
        instruction:
            "Draw the object above, accurately recreating its perspective, orientation, and light and shadow.",
        assignment:
            "Still Life: Grade this still life drawing on the following criteria and return ONLY valid JSON with no explanation outside the JSON object.\nCriteria:\n- perspective: Assess whether lines convey a consistent, accurate perspective. Score 0-3.\n- value: Assess rendering of the object with light and shadow. Score 0-4.\n- form: Assess sense of volume and depth of the object. Score 0-5.\nReturn format:\n{ perspective: { score: X, brief_feedback: '...' }, value: { score: X, brief_feedback: '...' }, form: { score: X, brief_feedback: '...' } }",
    },
    {
        id: 4,
        title: "Thumbnail Sketch",
        refKey: "thumbnail",
        image: "/pImg/Example-thumbnails.jpg",
        instruction:
            "Create a thumbnail sketch of the environment above, focusing on composition.",
        assignment:
            "Thumbnail: Grade this thumbnail sketch on the following criterion and return ONLY valid JSON with no explanation outside the JSON object.\nCriteria:\n- composition: Assess aesthetically pleasing placement of scene details, use of focal point, balance, and visual flow. Score 0-5.\nReturn format:\n{ composition: { score: X, brief_feedback: '...' } }",
    },
];

const GOALS = [
    "Manga / Anime",
    "Realistic Portrait",
    "Character Design (Cartoon)",
    "Concept Art",
    "Comic / Graphic Novel",
    "Environment & Landscape",
    "Impressionism / Painterly",
    "Urban Sketching",
    "Still Life & Objects",
    "General Drawing Fundamentals",
];

const TIME_OPTIONS = [
    "15 minutes",
    "30 minutes",
    "1 hour",
    "1.5 hours",
    "2+ hours",
];

type Step = 1 | 2 | 3 | 4 | "preferences" | "loading" | "results";

const SKILL_LABELS: Record<string, string> = {
    expert: "Expert",
    "advanced-expert": "Advanced",
    advanced: "Advanced",
    "intermediate-advanced": "Intermediate–Advanced",
    intermediate: "Intermediate",
    "beginner-intermediate": "Beginner–Intermediate",
    beginner: "Beginner",
};

function computeSkillLevel(pretestScores: Record<string, { score?: number }>): { key: string; label: string; avg: number } {
    const scores = [
        pretestScores.gesture?.score ?? 0,
        pretestScores.lifeDrawing?.score ?? 0,
        pretestScores.stillLife?.score ?? 0,
        pretestScores.thumbnail?.score ?? 0,
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    let key: string;
    if (avg >= 90) key = "expert";
    else if (avg >= 85) key = "advanced-expert";
    else if (avg >= 80) key = "advanced";
    else if (avg >= 70) key = "intermediate-advanced";
    else if (avg >= 50) key = "intermediate";
    else if (avg >= 30) key = "beginner-intermediate";
    else key = "beginner";

    return { key, label: SKILL_LABELS[key], avg: Math.round(avg) };
}

export default function PretestPage() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [jobIds, setJobIds] = useState<string[]>([]);
    const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);
    const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[1]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skillResult, setSkillResult] = useState<{ key: string; label: string; avg: number } | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pretestBreakdown, setPretestBreakdown] = useState<Record<string, any> | null>(null);

    // Per-question upload state
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const resetUploadState = () => {
        setFile(null);
        setPreviewUrl(null);
        setIsDragging(false);
        setIsSubmitting(false);
        setShowConfirm(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const processFile = (f: File) => {
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) processFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) processFile(f);
    };

    const handleQuestionSubmit = async () => {
        if (!file || isSubmitting || typeof currentStep !== "number") return;
        setIsSubmitting(true);

        const question = QUESTIONS[currentStep - 1];
        const formData = new FormData();
        formData.append("image", file);

        try {
            const { job_id } = await submitPretestImage(formData, question.assignment, question.refKey);
            const newJobIds = [...jobIds, job_id];
            setJobIds(newJobIds);

            // Brief confirmation then advance
            setShowConfirm(true);
            setTimeout(() => {
                resetUploadState();
                if (currentStep < 4) {
                    setCurrentStep((currentStep + 1) as Step);
                } else {
                    setCurrentStep("preferences");
                }
            }, 800);
        } catch {
            setIsSubmitting(false);
            setError("Failed to submit image. Please try again.");
        }
    };

    const handleFinalSubmit = async () => {
        setIsGenerating(true);
        setError(null);
        setCurrentStep("loading");

        try {
            const { pretestScores } = await resolveAllPretestScores(jobIds, selectedGoal, selectedTime);
            const skill = computeSkillLevel(pretestScores);
            setSkillResult(skill);
            setPretestBreakdown(pretestScores);
            updateProfile({ skill_level: skill.key, artistic_goal: selectedGoal, time_commitment: selectedTime }).catch(() => {});
            setCurrentStep("results");
        } catch {
            setIsGenerating(false);
            setError("Something went wrong while building your plan. Please try again.");
            setCurrentStep("preferences");
        }
    };

    const handleRetryFromLoading = async () => {
        setError(null);
        setIsGenerating(true);
        setCurrentStep("loading");

        try {
            const { pretestScores } = await resolveAllPretestScores(jobIds, selectedGoal, selectedTime);
            const skill = computeSkillLevel(pretestScores);
            setSkillResult(skill);
            setPretestBreakdown(pretestScores);
            updateProfile({ skill_level: skill.key, artistic_goal: selectedGoal, time_commitment: selectedTime }).catch(() => {});
            setCurrentStep("results");
        } catch {
            setIsGenerating(false);
            setError("Something went wrong while building your plan. Please try again.");
            setCurrentStep("preferences");
        }
    };

    if (currentStep === "loading") {
        return (
            <div className={styles.outer}>
                <div className={`${styles.loadingPage} ${playfair.variable} ${dmSans.variable}`}>
                    {error ? (
                        <div className={styles.errorBox}>
                            <div className={styles.errorText}>{error}</div>
                            <button className={styles.btnRetry} onClick={handleRetryFromLoading}>
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.spinner} />
                            <div className={styles.loadingTitle}>
                                Analyzing your drawings and<br />building your personalized plan...
                            </div>
                            <div className={styles.loadingSubtitle}>
                                This may take a minute or two.
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (currentStep === "results" && skillResult) {
        const DRAWING_LABELS: Record<string, string> = {
            gesture: "Gesture Drawing",
            lifeDrawing: "Life Drawing",
            stillLife: "Mini Still Life",
            thumbnail: "Thumbnail Sketch",
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function getRequirements(drawingData: Record<string, any>): { name: string; r_id: string; points: number }[] {
            return Array.isArray(drawingData.requirements) ? drawingData.requirements : [];
        }

        return (
            <div className={styles.outer}>
                <div className={`${styles.resultsPage} ${playfair.variable} ${dmSans.variable}`}>
                    <div className={styles.resultsIcon}>
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#B8A050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className={styles.resultsTitle}>Assessment Complete</div>
                    <div className={styles.resultsSubtitle}>
                        Based on your drawings, we&apos;ve determined your current skill level.
                    </div>

                    <div className={styles.skillCard}>
                        <div className={styles.skillLabel}>Your skill level</div>
                        <div className={styles.skillLevel}>{skillResult.label}</div>
                        <div className={styles.skillScore}>Overall score: {skillResult.avg}%</div>
                    </div>

                    {pretestBreakdown && (
                        <div className={styles.drawingBreakdown}>
                            {(["gesture", "lifeDrawing", "stillLife", "thumbnail"] as const).map((key) => {
                                const data = pretestBreakdown[key];
                                if (!data) return null;
                                const reqs = getRequirements(data);
                                return (
                                    <div key={key} className={styles.drawingCard}>
                                        <div className={styles.drawingCardTitle}>{DRAWING_LABELS[key]}</div>
                                        {reqs.length > 0 && (
                                            <ul className={styles.reqList}>
                                                {reqs.map((req) => (
                                                    <li key={req.r_id} className={styles.reqItem}>
                                                        <span className={styles.reqName}>{req.name}</span>
                                                        <span className={styles.reqScore}>{req.points} pts</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.resultsNote}>
                        Your personalized learning plan has been built around this level.
                        Lessons will adapt as you improve.
                    </div>

                    <button
                        className={styles.btnPrimary}
                        onClick={() => router.push("/dashboard")}
                        style={{ width: "100%" }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === "preferences") {
        return (
            <div className={styles.outer}>
                <div className={`${styles.page} ${playfair.variable} ${dmSans.variable}`}>
                    <div className={styles.stepIndicator}>&mdash; Almost done</div>
                    <div className={styles.title}>Set your goals</div>
                    <div className={styles.divider} />

                    <div className={styles.prefsIntro}>
                        Great work completing the assessment! Now tell us what you&apos;d like to focus
                        on and how much time you can commit each day.
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="pretest-goal">Learning goal</label>
                        <select
                            id="pretest-goal"
                            value={selectedGoal}
                            onChange={(e) => setSelectedGoal(e.target.value)}
                        >
                            {GOALS.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="pretest-time">Daily time commitment</label>
                        <select
                            id="pretest-time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        >
                            {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className={styles.errorBox} style={{ marginBottom: 20 }}>
                            <div className={styles.errorText}>{error}</div>
                        </div>
                    )}

                    <div className={styles.submitRow}>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleFinalSubmit}
                            disabled={isGenerating}
                            style={{ opacity: isGenerating ? 0.45 : 1 }}
                        >
                            {isGenerating ? "Generating..." : "Generate my plan"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const step = currentStep as number;
    const question = QUESTIONS[step - 1];

    return (
        <div className={styles.outer}>
            <div className={`${styles.page} ${playfair.variable} ${dmSans.variable}`}>
                <div className={styles.stepIndicator}>
                    &mdash; Question {step} of 4
                </div>
                <div className={styles.title}>{question.title}</div>
                <div className={styles.divider} />

                <div className={styles.sectionLabel}>Reference</div>
                <img
                    src={question.image}
                    alt={`${question.title} reference`}
                    className={styles.referenceImage}
                />

                <div className={styles.sectionLabel}>Instructions</div>
                <div className={styles.instructionText}>{question.instruction}</div>

                <div className={styles.sectionLabel}>Submit your work</div>
                <div
                    className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ""} ${file ? styles.dropzoneHasFile : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        key={currentStep}
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenInput}
                        onChange={handleInputChange}
                    />
                    <div className={styles.uploadIcon}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Preview" className={styles.preview} />
                            <div className={styles.uploadSub}>Click to change image</div>
                        </>
                    ) : (
                        <>
                            <div className={styles.uploadMain}>Upload your drawing</div>
                            <div className={styles.uploadSub}>Click to select or drag and drop</div>
                        </>
                    )}
                </div>

                {showConfirm && <div className={styles.confirmToast}>Submitted! On to the next one.</div>}

                {error && !showConfirm && (
                    <div className={styles.errorBox} style={{ marginTop: 12 }}>
                        <div className={styles.errorText}>{error}</div>
                    </div>
                )}

                <div className={styles.submitRow}>
                    <button
                        className={styles.btnPrimary}
                        disabled={!file || isSubmitting}
                        style={{ opacity: file && !isSubmitting ? 1 : 0.45 }}
                        onClick={handleQuestionSubmit}
                    >
                        {isSubmitting ? "Submitting..." : step < 4 ? "Submit & continue" : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
