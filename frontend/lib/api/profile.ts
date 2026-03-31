
const API = process.env.NEXT_PUBLIC_API_URL;
export async function loadUser() {
    const url = `${API}/api/profile`;
    const response = await fetch (url, { credentials: "include" });
    if (!response.ok) {
        return null;
    }
    return await response.json()
}