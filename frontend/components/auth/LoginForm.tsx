'use client'
import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Playfair_Display, DM_Sans } from "next/font/google"
import { loginUser } from "@/lib/api/auth"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
})

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [usernameErrors, setUsernameErrors] = useState<string[]>([])
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [loginErrors, setLoginErrors] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!username) setUsernameErrors(["Username cannot be empty."])
    if (!password) setPasswordErrors(["Password cannot be empty."])
    if (!username || !password) return

    try {
      await loginUser(username, password)
      router.push("/dashboard")
    } catch (e) {
      console.log(e)
      setLoginErrors(true)
    }
  }

  return (
    <div className={`ap-page ${playfair.variable} ${dmSans.variable}`}>
      <div className="ap-left">
        <Link href="/" className="ap-logo">Atelier<span>.</span></Link>
        <div className="ap-left-body">
          <p className="ap-eyebrow">Welcome back</p>
          <h2 className="ap-headline">
            Pick up where<br />you <em>left off.</em>
          </h2>
          <p className="ap-desc">
            Your lesson plan, progress, and assessments are waiting.
            Sign in to continue your practice.
          </p>
          <div className="ap-steps">
            <div className="ap-step">
              <span className="ap-step-num">i.</span>
              <span className="ap-step-text"><strong>Your plan persists.</strong> Sessions resume exactly where you stopped.</span>
            </div>
            <div className="ap-step">
              <span className="ap-step-num">ii.</span>
              <span className="ap-step-text"><strong>Progress is tracked.</strong> Every submission and assessment is saved.</span>
            </div>
            <div className="ap-step">
              <span className="ap-step-num">iii.</span>
              <span className="ap-step-text"><strong>Nothing resets.</strong> Your foundations carry forward.</span>
            </div>
          </div>
        </div>
        <p className="ap-left-footer">
          New to Atelier? <Link href="/register">Create an account →</Link>
        </p>
      </div>

      <div className="ap-right">
        <div className="ap-form-header">
          <h2>Sign in</h2>
          <p>Don&apos;t have an account? <Link href="/register">Get started</Link></p>
        </div>

        <form className="ap-form" onSubmit={handleSubmit}>
          <div className="ap-form-group">
            <label htmlFor="login-identifier">Username</label>
            <input
              type="text"
              id="login-identifier"
              placeholder="your_username"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameErrors([])
              }}
              className={usernameErrors.length > 0 ? "ap-input-error" : ""}
            />
            {usernameErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          <div className="ap-form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              placeholder="••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setUsernameErrors([])
                setPasswordErrors([])
                setLoginErrors(false)
              }}
              className={passwordErrors.length > 0 ? "ap-input-error" : ""}
            />
            {passwordErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          {loginErrors && (
            <span className="ap-field-error">Invalid username or password.</span>
          )}

          <button type="submit" className="ap-btn-submit">Sign In</button>
        </form>
      </div>
    </div>
  )
}
