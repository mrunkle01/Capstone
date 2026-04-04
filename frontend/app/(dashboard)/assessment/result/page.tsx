"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentResult } from "@/lib/types/assessment";
import styles from "./result.module.css";

// Isolated data-fetching — swap to API call by report_id when ready
function loadResult(): { result: AssessmentResult | null; imageUrl: string | null } {
    const stored = localStorage.getItem("assessmentResult");
    const imageUrl = localStorage.getItem("imageUrl");
    return {
        result: stored ? JSON.parse(stored) : null,
        imageUrl,
    };
}

function getScoreTier(score: number) {
    if (score >= 70) return { label: "Strong", color: "#4a8c5c", bg: "rgba(74,140,92,0.10)" };
    if (score >= 40) return { label: "Developing", color: "#b5995a", bg: "rgba(181,153,90,0.10)" };
    return { label: "Needs work", color: "#e8734a", bg: "rgba(232,115,74,0.10)" };
}

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const { result: r, imageUrl: img } = loadResult();
        if (!r) {
            router.replace("/dashboard");
            return;
        }
        setResult(r);
        setImageUrl(img);
    }, [router]);

    if (!result) return null;

    const tier = getScoreTier(result.score);
    const feedbackParagraphs = result.feedback.split("\n\n").filter(Boolean);

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>&mdash; Section Assessment</div>
            <h1 className={styles.heading}>Your results.</h1>

            <div className={styles.cardRow}>
                <div className={styles.scoreCard}>
                    <span className={styles.scoreLabel}>Score</span>
                    <span className={styles.scoreValue} style={{ color: tier.color }}>
                        {result.score}
                    </span>
                    <span className={styles.scoreOf}>/ 100</span>
                </div>

                <div className={styles.verdictCard}>
                    <span
                        className={styles.verdictTag}
                        style={{ color: tier.color, background: tier.bg }}
                    >
                        {tier.label}
                    </span>
                    <span className={styles.verdictHeading}>
                        {result.score >= 70
                            ? "Great work"
                            : result.score >= 40
                                ? "Getting there"
                                : "Keep practicing"}
                    </span>
                    <span className={styles.verdictDesc}>
                        {result.score >= 70
                            ? "You demonstrated strong command of the skills in this section."
                            : result.score >= 40
                                ? "You're building a solid foundation. Review the feedback below to level up."
                                : "Focus on the feedback below and revisit the lesson exercises before retrying."}
                    </span>
                </div>
            </div>

            <div className={styles.detailGrid}>
                <div className={styles.feedbackPanel}>
                    <span className={styles.panelLabel}>Feedback</span>
                    <div className={styles.feedbackBody}>
                        {feedbackParagraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </div>

                {imageUrl && (
                    <div className={styles.imagePanel}>
                        <span className={styles.panelLabel}>Your submission</span>
                        <img
                            src={imageUrl}
                            alt="Submitted drawing"
                            className={styles.submittedImage}
                        />
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.btnContinue}>
                    Continue to next section
                </button>
                <button
                    className={styles.btnBack}
                    onClick={() => router.push("/dashboard")}
                >
                    &larr; Back to dashboard
                </button>
            </div>
        </div>
    );
}