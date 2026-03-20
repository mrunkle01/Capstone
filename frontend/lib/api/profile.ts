
const API = process.env.NEXT_PUBLIC_API_URL;
export async function loadProfileInfo() {
    const url = `${API}/api/profile`;
    const response = await fetch (url, { credentials: "include" });
    if (!response.ok) {
        return new Error(response.statusText);
    }
    const user = await response.json()
    console.log("user: ", user)
    return user
}