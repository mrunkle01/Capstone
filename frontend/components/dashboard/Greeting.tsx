"use client";

import { useEffect, useState } from "react";
import { loadUser } from "@/lib/api/profile";
import { User } from "@/lib/types/profile";

export default function Greeting() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        loadUser().then(setUser);
    }, []);

    return (
        <div>
            <div className="d-label-row">
                <div className="d-gold-dash" />
                <span className="d-label-text">YOUR CURRICULUM</span>
            </div>
            <h1 className="d-welcome">Welcome back, {user?.username ?? "—"}.</h1>
        </div>
    );
}