"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/lessons", label: "Current lesson" },
        { href: "/chat", label: "Ask AI" },
        { href: "/profile", label: "Profile" },
    ];

    return (
        <div className="d-sidebar">
            <div className="d-logo">Atelier.</div>

            <div className="d-user-card">
                <div className="d-avatar">M</div>
                <div>
                    <div className="d-user-name">mark_draws</div>
                    <div className="d-user-goal">Character Design</div>
                </div>
            </div>

            <nav className="d-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`d-nav-item ${pathname === item.href ? "active" : ""}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="d-sidebar-footer">1 hr/day plan</div>
        </div>
    );
}
