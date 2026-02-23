"use client"

export default function Results() {
    const result = localStorage.getItem("assessmentResult");
    const imageUrl = localStorage.getItem("imageUrl");

    return (
        <div>
            <h2>Results</h2>
            <img src={imageUrl ?? ""} alt="submitted drawing" />
            <p>{result}</p>
        </div>
    )
}