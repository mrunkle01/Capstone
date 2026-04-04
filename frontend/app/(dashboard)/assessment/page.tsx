"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Requirement } from "@/lib/types/dashboard";
import { useDashboardContext } from "@/lib/context/DashboardContext";
import ImageInput from "@/components/demo/ImageInput";
import styles from "./assessment.module.css";

export default function AssessmentPage() {
    const router = useRouter();
    const { assessment } = useDashboardContext();
    const [hasImage, setHasImage] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const submitRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!assessment) {
            router.replace("/dashboard");
        }
    }, [assessment, router]);

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