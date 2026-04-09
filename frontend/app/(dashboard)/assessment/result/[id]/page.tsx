"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { loadResult } from "@/lib/api/results";
import { loadDashboard, loadLatestSection, loadProgress, saveProgress, generateSections } from "@/lib/api/dashboard";
import { loadUser } from "@/lib/api/profile";
import { buildNextSectionParams } from "@/lib/utils/nextSection";
import { AssessmentResult } from "@/lib/types/assessment";
import styles from "./result.module.css";

function getScoreTier(score: number) {
    if (score >= 70) return { label: "Strong", color: "#4a8c5c", bg: "rgba(74,140,92,0.10)" };
    if (score >= 40) return { label: "Developing", color: "#b5995a", bg: "rgba(181,153,90,0.10)" };
    return { label: "Needs work", color: "#e8734a", bg: "rgba(232,115,74,0.10)" };
}

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params.id as string;

    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!reportId) return;
        loadResult(Number(reportId))
            .then(({ result: r, imageUrl: img }) => {
                setResult(r);
                setImageUrl(img);
                loadDashboard().then((sections) => {
                    if (!sections || sections.length === 0) return;
                    const latest = sections[sections.length - 1];
                    saveProgress(latest.id, {
                        ...latest.progress,
                        assessmentReportId: r.report_id,
                        assessmentScore: r.score,
                    });
                });
            })
            .catch(() => {
                router.replace("/dashboard");
            })
            .finally(() => setLoading(false));
    }, [reportId, router]);

    async function handleContinueToNext() {
        if (!result || generating) return;
        setGenerating(true);
        try {
            // Load the current section and user profile to build context
            const [sectionData, profile] = await Promise.all([
                loadLatestSection(),
                loadUser(),
            ]);

            if (!sectionData || !profile) {
                router.push("/dashboard");
                return;
            }

            const { topic, amount } = buildNextSectionParams(
                result.score,
                result.feedback,
                sectionData,
            );

            await generateSections(
                {
                    topic,
                    timeCommit: profile.time_commitment || "1 hr",
                    skillLevel: profile.skill_level || "beginner",
                },
                amount,
            );

            router.push("/dashboard");
        } catch (e) {
            console.error("Failed to generate next section:", e);
            setGenerating(false);
        }
    }

    if (loading || !result) return null;

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
                <button
                    className={styles.btnContinue}
                    onClick={handleContinueToNext}
                    disabled={generating}
                    style={{ opacity: generating ? 0.6 : 1 }}
                >
                    {generating ? "Generating next section..." : "Continue to next section"}
                </button>
                <button
                    className={styles.btnBack}
                    onClick={() => router.push("/dashboard")}
                    disabled={generating}
                    style={{ opacity: generating ? 0.45 : 1 }}
                >
                    &larr; Back to dashboard
                </button>
            </div>
        </div>
    );
}