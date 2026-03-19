"use client";

import { useState } from "react";
import { SectionResponse, Lesson, Assessment, Requirement } from "@/lib/types/dashboard";

interface LessonListProps {
    sectionInfo: SectionResponse;
}

export default function LessonList({ sectionInfo }: LessonListProps) {
    const lessons: Lesson[] = [...sectionInfo.Lessons].sort((a, b) => a.order - b.order);
    const assessment: Assessment = sectionInfo.Assessment;

    const [completedCount, setCompletedCount] = useState(0);
    const [expandedCard, setExpandedCard] = useState<number>(-1);
    const [sectionOpen, setSectionOpen] = useState(false);

    function getStatus(index: number): "completed" | "current" | "locked" {
        if (index < completedCount) return "completed";
        if (index === completedCount) return "current";
        return "locked";
    }

    function handleCardClick(index: number) {
        const status = getStatus(index);
        if (status === "locked") return;
        setExpandedCard(expandedCard === index ? -1 : index);
    }

    function handleContinue(e: React.MouseEvent, index: number) {
        e.stopPropagation();
        setCompletedCount(index + 1);
        setExpandedCard(-1);
    }

    return (
        <div>
            <div className="d-section-bar" onClick={() => setSectionOpen(!sectionOpen)}>
                <div className="d-section-bar-left">
                    {/*//this will need to be grabbed when we have section numbers*/}
                    <span className="d-section-num">01</span>
                    <span className="d-current-title">{sectionInfo.Section}</span>
                    <span className="d-status-pill">
                        {completedCount >= lessons.length ? "Completed" : "In progress"}
                    </span>
                </div>
                <span className={`d-chevron ${sectionOpen ? "open" : ""}`}>&#9656;</span>
            </div>

            <div className={`d-section-body ${sectionOpen ? "open" : ""}`}>
                <div className="d-cards-stack">
                    {lessons.map((lesson, index) => {
                        const status = getStatus(index);
                        const isExpanded = expandedCard === index;

                        return (
                            <div
                                key={lesson.order}
                                className={`d-card-row ${
                                    status === "completed"
                                        ? "d-card-completed"
                                        : status === "current"
                                          ? "d-card-current"
                                          : "d-card-locked"
                                }`}
                                onClick={() => handleCardClick(index)}
                            >
                                <div className="d-card-header">
                                    <div className="d-card-left">
                                        <span className="d-card-order">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="d-card-title">{lesson.title}</span>
                                    </div>
                                    <div className="d-card-right">
                                        {status === "completed" && (
                                            <span className="d-pill-complete">Completed</span>
                                        )}
                                        {status === "current" && (
                                            <span className="d-pill-current">Current</span>
                                        )}
                                        {status === "locked" && (
                                            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                                                <rect x="1" y="6" width="10" height="7" rx="2" stroke="#9B9889" strokeWidth="1.2" />
                                                <path d="M3.5 6V4a2.5 2.5 0 015 0v2" stroke="#9B9889" strokeWidth="1.2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {status !== "locked" && (
                                            <span className={`d-chevron ${isExpanded ? "open" : ""}`}>
                                                &#9656;
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={`d-card-expand ${isExpanded ? "open" : ""}`}>
                                    <div className="d-expand-body">{lesson.content}</div>
                                    {status === "current" && (
                                        <button
                                            className="d-expand-btn d-btn-continue"
                                            onClick={(e) => handleContinue(e, index)}
                                        >
                                            Continue
                                        </button>
                                    )}
                                    {status === "completed" && (
                                        <button className="d-expand-btn d-btn-review">
                                            Review lesson
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {completedCount >= lessons.length && (
                <div className="d-assessment d-assessment-unlocked">
                    <div className="d-assessment-header">
                        <span className="d-section-num">Assessment</span>
                        <span className="d-current-title">{assessment.title}</span>
                        <span className="d-status-pill">Ready</span>
                    </div>
                    <div className="d-assessment-body">
                        <p className="d-assessment-desc">{assessment.content}</p>
                        <div className="d-assessment-reqs">
                            {assessment.requirements.map((req: Requirement, i: number) => (
                                <div key={i} className="d-req-tag">
                                    {req.name} — <span className="d-req-pts">{req.points} pts</span>
                                </div>
                            ))}
                        </div>
                        <button className="d-btn-assessment">Begin Assessment</button>
                    </div>
                </div>
            )}
        </div>
    );
}
