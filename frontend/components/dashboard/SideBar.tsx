"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";
import {loadUser} from "@/lib/api/profile";
import {useEffect, useState} from "react";
import {User} from "@/lib/types/profile"
export default function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter();
    useEffect(() => {
        loadUser().then(setUser);
    }, [pathname]);
    const handleSignOut = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error(e);
        }
        router.push("/login");
    };
    const topic = searchParams.get("topic") ?? user?.artistic_goal;
    const timeCommit = (searchParams.get("timeCommit") ?? user?.time_commitment)?.split("/")[0].trim() || undefined;
    const skillLevel = searchParams.get("skillLevel") ?? user?.skill_level;

    const dashboardHref = topic && timeCommit && skillLevel
        ? `/dashboard?topic=${encodeURIComponent(topic)}&timeCommit=${encodeURIComponent(timeCommit)}&skillLevel=${encodeURIComponent(skillLevel)}`
        : "/dashboard";

    const expandLesson = searchParams.get("expandLesson");
    const onDashboard = pathname === "/dashboard";

    const navItems = [
        { href: dashboardHref, label: "Dashboard", isActive: onDashboard && expandLesson !== "current" },
        { href: `${dashboardHref}${dashboardHref.includes("?") ? "&" : "?"}expandLesson=current`, label: "Current lesson", isActive: onDashboard && expandLesson === "current" },
        { href: "/chat", label: "Ask AI", isActive: pathname === "/chat" },
        { href: "/profile", label: "Profile", isActive: pathname === "/profile" },
    ];

    return (
        <div className="d-sidebar">
            <div className="d-logo">Atelier.</div>
            <div className="d-user-card">
                <div className="d-avatar">{user?.username?.[0]?.toUpperCase() ?? "?"}</div>
                <div>
                    <div className="d-user-name">{user?.username ?? "—"}</div>
                    <div className="d-user-goal">{topic ?? "—"}</div>
                </div>
            </div>

            <nav className="d-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`d-nav-item ${item.isActive ? "active" : ""}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="d-sidebar-footer">
                <div>{timeCommit ? `${timeCommit}/day` : "—"}</div>
                <button onClick={handleSignOut} className="d-signout-btn">Sign out</button>
            </div>
        </div>
    );
}
