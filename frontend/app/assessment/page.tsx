"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Assessment, Requirement } from "@/lib/types/dashboard";
import ImageInput from "@/components/demo/ImageInput";
import styles from "./assessment.module.css";

export default function AssessmentPage() {
    const router = useRouter();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [hasImage, setHasImage] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const submitRef = useRef<(() => void) | null>(null);

    // TODO: remove mock data — only here so the page renders without backend
    const MOCK_ASSESSMENT: Assessment = {
        title: "Textured Still Life Synthesis",
        content: "Create a 45-minute drawing of three objects with distinct materials (e.g., a glass bottle, a folded linen cloth, and a terracotta pot) arranged in natural light. No reference photos — observe real objects. Focus on integrating all skills from Lessons 1–3.",
        requirements: [
            { name: "Value accuracy — correct light source across all objects", r_id: "r1", points: 15 },
            { name: "Edge control — at least 2 hard and 2 soft edges used intentionally", r_id: "r2", points: 10 },
            { name: "Material differentiation — clear visual distinction between materials", r_id: "r3", points: 15 },
            { name: "Composition — objects overlap naturally, negative space supports focal point", r_id: "r4", points: 5 },
            { name: "Time management — completed within 45 minutes", r_id: "r5", points: 5 },
        ],
    };

    useEffect(() => {
        const state = window.history.state;
        if (state?.assessment) {
            setAssessment(state.assessment as Assessment);
        } else {
            // Fallback to mock data for development
            setAssessment(MOCK_ASSESSMENT);
        }
    }, [router]);

    if (!assessment) return null;

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => router.back()}>
                <span>&larr;</span> Back to dashboard
            </button>

            <div className={styles.eyebrow}>&mdash; Section 01 &middot; Assessment</div>
            <div className={styles.title}>{assessment.title}</div>
            <div className={styles.divider} />

            <div className={styles.sectionLabel}>Prompt</div>
            <div className={styles.promptText}>{assessment.content}</div>

            <div className={styles.sectionLabel}>Scoring requirements</div>
            <div className={styles.reqGrid}>
                {assessment.requirements.map((req: Requirement, i: number) => (
                    <div key={req.r_id ?? i} className={styles.reqTag}>
                        <div className={styles.reqName}>{req.name}</div>
                        <div className={styles.reqPts}>{req.points} pts</div>
                    </div>
                ))}
            </div>

            <div className={styles.sectionLabel}>Submit your work</div>
            <ImageInput setImageUrl={(url) => setImageUrl(url)} onFileSelected={setHasImage} submitRef={submitRef} />

            <div className={styles.submitRow}>
                <button
                    className={styles.btnPrimary}
                    disabled={!hasImage}
                    style={{ opacity: hasImage ? 1 : 0.45 }}
                    onClick={() => submitRef.current?.()}
                >
                    Submit for grading
                </button>
            </div>
        </div>
    );
}