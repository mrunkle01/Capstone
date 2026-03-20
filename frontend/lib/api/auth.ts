export async function loginUser(username: string, password: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password })
    })
    if (!response.ok) {
        throw new Error("Login failed")
    }
    return response.json()
}

export async function logoutUser() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
    })
    if (!response.ok) {
        throw new Error("Logout failed")
    }
    return response.json()
}

export async function registerUser(email: string, username: string, password: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    })
    if (!response.ok) {
        throw new Error("Registration failed: Try again")
    }
    return response.json()
}