
const API = process.env.NEXT_PUBLIC_API_URL;
export async function loadUser() {
    const url = `${API}/api/profile`;
    const response = await fetch (url, { credentials: "include" });
    if (!response.ok) {
        return null;
    }
    return await response.json()
}

export async function updateProfile(data: {
    skill_level: string;
    artistic_goal: string;
    time_commitment: string;
}) {
    const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
}