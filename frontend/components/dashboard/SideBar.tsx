"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error(e);
        }
        router.push("/login");
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/lessons", label: "Current lesson" },
        { href: "/chat", label: "Ask AI" },
        { href: "/profile", label: "Profile" },
    ];

    return (
        <div className="d-sidebar">
            <div className="d-logo">Atelier.</div>
            {/*//need to actually fetch user name*/}
            <div className="d-user-card">
                <div className="d-avatar">M</div>
                <div>
                    <div className="d-user-name">mark_draws</div>
                    <div className="d-user-goal">Manga</div>
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

            <div className="d-sidebar-footer">
                <div>1 hr/day plan</div>
                <button onClick={handleSignOut} className="d-signout-btn">Sign out</button>
            </div>
        </div>
    );
}
