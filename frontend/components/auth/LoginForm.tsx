'use client'
import {FormEvent, useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
// import { loginUser } from "@/lib/api/auth"

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

        await loginUser(username, password)
        router.push("/dashboard")
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="username">Username</label>
                    <input
                        className=" text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameErrors([])
                        }}
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
                <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium">
                    Sign In
                </button>
                <Link className="text-gray-400 py-1 font-light text-sm " href={"/register"}>Register</Link>
            </form>
        </div>
    )
}