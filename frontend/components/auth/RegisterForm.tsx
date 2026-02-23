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

        await registerUser(email, username, password)
        router.replace("/login")
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Register</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                    <input
                        className="border text-black border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailErrors.length > 0 && (
                        <ul className="text-red-500">
                            {emailErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="username">Username</label>
                    <input
                        className="border text-black border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {usernameErrors.length > 0 && (
                        <ul className="text-red-500">
                            {usernameErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                    <input
                        className="border text-black border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {passwordErrors.length > 0 && (
                        <ul className="text-red-500">
                            {passwordErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-medium">
                    Register
                </button>
                <Link className="text-gray-400 py-1 font-light text-sm " href={"/login"}>Login instead</Link>

            </form>
        </div>
    )
}