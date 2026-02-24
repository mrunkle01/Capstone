'use client'
import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ValidationRes, validateEmail, validatePassword, validateUsername } from "@/lib/utils/validation"
import { registerUser } from "@/lib/api/auth"

export default function RegisterForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [emailErrors, setEmailErrors] = useState<string[]>([])
    const [usernameErrors, setUsernameErrors] = useState<string[]>([])
    const [passwordErrors, setPasswordErrors] = useState<string[]>([])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const emailRes: ValidationRes = validateEmail(email)
        const usernameRes: ValidationRes = validateUsername(username)
        const passwordRes: ValidationRes = validatePassword(password)

        setEmailErrors(emailRes.errors)
        setUsernameErrors(usernameRes.errors)
        setPasswordErrors(passwordRes.errors)

        if (!emailRes.valid || !usernameRes.valid || !passwordRes.valid) return

        // await registerUser(email, username, password)
        router.replace("/login")
    }

    return (
        <div className="auth-card">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Register</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="email">Email</label>
                    <input
                        className="auth-input"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailErrors.length > 0 && (
                        <ul className="error-message">
                            {emailErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="auth-field">
                    <label className="auth-label" htmlFor="username">Username</label>
                    <input
                        className="auth-input"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                <button className="auth-btn bg-green-600 hover:bg-green-700">
                    Register
                </button>
                <Link className="auth-link" href={"/login"}>Login instead</Link>
            </form>
        </div>
    )
}