"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Assessment } from "@/lib/types/dashboard";

interface DashboardContextType {
    assessment: Assessment | null;
    setAssessment: (a: Assessment | null) => void;
}

const DashboardContext = createContext<DashboardContextType>({
    assessment: null,
    setAssessment: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [assessment, setAssessment] = useState<Assessment | null>(null);

    return (
        <DashboardContext.Provider value={{ assessment, setAssessment }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext() {
    return useContext(DashboardContext);
}