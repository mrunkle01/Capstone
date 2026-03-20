"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "../../(auth)/auth.css";

// import QuestionList from "@/components/onboarding/QuestionList";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    variable: "--font-dm-sans",
});

export default function Pretest() {
    const router = useRouter();
    const [topic, setTopic] = useState("");
    const [timeCommit, setTimeCommit] = useState("30 minutes");
    const [skillLevel, setSkillLevel] = useState("Beginner");
    const [topicError, setTopicError] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setTopicError("Please enter a topic.");
            return;
        }
        const params = new URLSearchParams({ topic: topic.trim(), timeCommit, skillLevel });
        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className={`ap-page ${playfair.variable} ${dmSans.variable}`}>
            <div className="ap-left">
                <Link href="/" className="ap-logo">Atelier<span>.</span></Link>
                <div className="ap-left-body">
                    <p className="ap-eyebrow">Getting started</p>
                    <h2 className="ap-headline">
                        Let&apos;s build your<br /><em>lesson plan.</em>
                    </h2>
                    <p className="ap-desc">
                        Tell us what you want to learn and we&apos;ll generate a personalized curriculum just for you.
                    </p>
                </div>
                <p className="ap-left-footer" />
            </div>

            <div className="ap-right">
                <div className="ap-form-header">
                    <h2>Your preferences</h2>
                </div>

                <form className="ap-form" onSubmit={handleSubmit}>
                    <div className="ap-form-group">
                        <label htmlFor="setup-topic">What do you want to learn?</label>
                        <input
                            type="text"
                            id="setup-topic"
                            placeholder="e.g. manga, realism, portraits…"
                            value={topic}
                            onChange={(e) => { setTopic(e.target.value); setTopicError(""); }}
                            className={topicError ? "ap-input-error" : ""}
                        />
                        {topicError && <span className="ap-field-error">{topicError}</span>}
                    </div>

                    <div className="ap-form-group">
                        <label htmlFor="setup-time">Daily time commitment</label>
                        <select
                            id="setup-time"
                            value={timeCommit}
                            onChange={(e) => setTimeCommit(e.target.value)}
                        >
                            <option>15 minutes</option>
                            <option>30 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                        </select>
                    </div>

                    <div className="ap-form-group">
                        <label htmlFor="setup-skill">Skill level</label>
                        <select
                            id="setup-skill"
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(e.target.value)}
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>

                    <button type="submit" className="ap-btn-submit">Generate My Plan</button>
                </form>
            </div>
        </div>
    );
}