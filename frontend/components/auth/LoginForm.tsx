'use client'
import {FormEvent, useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import { loginUser } from "@/lib/api/auth"

export default function LoginForm() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameErrors, setUsernameErrors] = useState<string[]>([])
    const [passwordErrors, setPasswordErrors] = useState<string[]>([])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!username) setUsernameErrors(["Username cannot be empty."])
        if (!password) setPasswordErrors(["Password cannot be empty."])
        if (!username || !password) return

        // await loginUser(username, password)
        router.push("/demo")
    }

    return (
        <div className="auth-card">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="username">Username</label>
                    <input
                        className="auth-input"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameErrors([])
                        }}
                    />
                    {usernameErrors.length > 0 && (
                        <ul className="error-message">
                            {usernameErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="password">Password</label>
                    <input
                        className="auth-input"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {passwordErrors.length > 0 && (
                        <ul className="error-message">
                            {passwordErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button className="auth-btn bg-blue-600 hover:bg-blue-700">
                    Sign In
                </button>
                <Link className="auth-link" href={"/register"}>Register</Link>
            </form>
        </div>
    )
}