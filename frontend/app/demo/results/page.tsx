"use client"
import { useState, useEffect } from "react";

export default function Results() {
    const [result, setResult] = useState(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        setResult(JSON.parse(localStorage.getItem("assessmentResult") ?? "{}"));
        setImageUrl(localStorage.getItem("imageUrl"));
    }, []);

    return (
        <div>
            <h2>Results</h2>
            {imageUrl && <img src={imageUrl} alt="submitted drawing" />}
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    )
}