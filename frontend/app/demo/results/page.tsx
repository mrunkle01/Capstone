"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// @ts-ignore
import { AssessmentResult } from "@/lib/types/assessment"

export default function Results() {
    const router = useRouter();
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("assessmentResult");
        if (stored) setResult(JSON.parse(stored));
        setImageUrl(localStorage.getItem("imageUrl"));
    }, []);

    let scoreColor: string;
    if (!result) {
        scoreColor = "text-gray-400";
    } else if (result.score >= 70) {
        scoreColor = "text-green-600";
    } else if (result.score >= 55) {
        scoreColor = "text-yellow-500";
    } else {
        scoreColor = "text-red-500";
    }

    return (
        <div className="results-page">
            <h1 className="results-header">Assessment Results</h1>
            <div className="results-stack">
                <div className="results-card text-center">
                    <p className="results-card-label mb-1">Score</p>
                    <p className={`results-score ${scoreColor}`}>
                        {result ? result.score : "—"}
                    </p>
                </div>

                <div className="results-card">
                    <p className="results-card-label mb-2">Feedback</p>
                    <p className="results-feedback">
                        {result ? result.feedback : "No feedback available."}
                    </p>
                </div>

                {imageUrl && (
                    <div className="results-card">
                        <p className="results-card-label mb-3">Your Drawing</p>
                        <Image
                            src={imageUrl}
                            alt="submitted drawing"
                            width={600}
                            height={400}
                            className="results-image"
                            style={{ width: "100%", height: "auto" }}
                        />
                    </div>
                )}

                <button
                    onClick={() => router.push("/demo")}
                    className="btn-primary bg-blue-500 hover:bg-blue-600 w-full text-center"
                >
                    Submit Another Drawing
                </button>
            </div>
        </div>
    );
}