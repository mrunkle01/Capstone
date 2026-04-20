'use client'

import { useEffect, useState } from "react";
import { loadUser } from "@/lib/api/profile";
import { User } from "@/lib/types/profile";

const SKILL_DISPLAY: Record<string, string> = {
    beginner: "Beginner",
    "beginner-intermediate": "Beginner–Intermediate",
    intermediate: "Intermediate",
    "intermediate-advanced": "Intermediate–Advanced",
    advanced: "Advanced",
    "advanced-expert": "Advanced",
    expert: "Expert",
};

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser().then((data) => {
            setUser(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="d-main d-skeleton">
                <div className="d-skel-label-row">
                    <div className="d-skel-gold-dash" />
                    <div className="d-skel-label" />
                </div>
                <div className="d-skel-welcome" />
                <div className="d-profile-card d-skel-section-bar" style={{ marginBottom: 12 }} />
                <div className="d-profile-card d-skel-section-bar" />
            </div>
        );
    }

    return (
        <div className="d-main">
            <div className="d-label-row">
                <div className="d-gold-dash" />
                <span className="d-label-text">ACCOUNT</span>
            </div>
            <div className="d-welcome">Your profile.</div>

            <div className="d-profile-card">
                <div className="d-profile-card-header">ACCOUNT INFO</div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Username</span>
                    <span className="d-profile-value">{user?.username ?? "—"}</span>
                </div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Email</span>
                    <span className="d-profile-value">{user?.email ?? "—"}</span>
                </div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Member since</span>
                    <span className="d-profile-value">{user?.member_since ?? "—"}</span>
                </div>
            </div>

            <div className="d-profile-card">
                <div className="d-profile-card-header">
                    LEARNING PREFERENCES
                </div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Artistic goal</span>
                    <span className="d-profile-value">{user?.artistic_goal ?? "—"}</span>
                </div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Skill level</span>
                    <span className="d-profile-value">{user?.skill_level ? (SKILL_DISPLAY[user.skill_level] ?? user.skill_level) : "—"}</span>
                </div>
                <div className="d-profile-row">
                    <span className="d-profile-field">Daily time</span>
                    <span className="d-profile-value">{user?.time_commitment ? `${user.time_commitment.split("/")[0].trim()}/day` : "—"}</span>
                </div>
            </div>
        </div>
    );
}