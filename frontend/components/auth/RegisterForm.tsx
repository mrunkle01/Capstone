'use client'
import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Playfair_Display, DM_Sans } from "next/font/google"
import { ValidationRes, validateEmail, validatePassword, validateUsername } from "@/lib/utils/validation"
import { registerUser } from "@/lib/api/auth"

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

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registerErrors, setRegisterErrors] = useState(false)
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [usernameErrors, setUsernameErrors] = useState<string[]>([])
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [confirmErrors, setConfirmErrors] = useState<string[]>([])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const emailRes: ValidationRes = validateEmail(email)
    const usernameRes: ValidationRes = validateUsername(username)
    const passwordRes: ValidationRes = validatePassword(password)

    const confirmErrs: string[] = confirmPassword !== password ? ["Passwords do not match."] : []

    setEmailErrors(emailRes.errors)
    setUsernameErrors(usernameRes.errors)
    setPasswordErrors(passwordRes.errors)
    setConfirmErrors(confirmErrs)

    if (!emailRes.valid || !usernameRes.valid || !passwordRes.valid || confirmErrs.length > 0) return

    try {
      await registerUser(email, username, password)
      router.replace("/login")
    } catch (e) {
      console.log(e)
      setRegisterErrors(true)
    }
  }

  return (
    <div className={`ap-page ${playfair.variable} ${dmSans.variable}`}>
      <div className="ap-left">
        <Link href="/" className="ap-logo">Atelier<span>.</span></Link>
        <div className="ap-left-body">
          <p className="ap-eyebrow">Get started</p>
          <h2 className="ap-headline">
            Your curriculum<br />starts <em>here.</em>
          </h2>
          <p className="ap-desc">
            Create your account, then complete a short assessment.
            Atelier builds your personalized lesson plan from your results.
          </p>
          <div className="ap-steps">
            <div className="ap-step">
              <span className="ap-step-num">i.</span>
              <span className="ap-step-text"><strong>Create your account.</strong> Takes less than a minute.</span>
            </div>
            <div className="ap-step">
              <span className="ap-step-num">ii.</span>
              <span className="ap-step-text"><strong>Complete the assessment.</strong> Tell us your goals and show us your current work.</span>
            </div>
            <div className="ap-step">
              <span className="ap-step-num">iii.</span>
              <span className="ap-step-text"><strong>Get your plan.</strong> A curriculum built around your skill level and goals.</span>
            </div>
          </div>
        </div>
        <p className="ap-left-footer">
          Already have an account? <Link href="/login">Sign in →</Link>
        </p>
      </div>

      <div className="ap-right">
        <div className="ap-form-header">
          <h2>Create account</h2>
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
        </div>

        <form className="ap-form" onSubmit={handleSubmit}>
          <div className="ap-form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              type="email"
              id="reg-email"
              placeholder="email@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailErrors.length > 0 ? "ap-input-error" : ""}
            />
            {emailErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          <div className="ap-form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              type="text"
              id="reg-username"
              placeholder="your_username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={usernameErrors.length > 0 ? "ap-input-error" : ""}
            />
            {usernameErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          <div className="ap-form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              type="password"
              id="reg-password"
              placeholder="••••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordErrors.length > 0 ? "ap-input-error" : ""}
            />
            <span className="ap-password-hint">10–32 characters, at least one number and one special character</span>
            {passwordErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          <div className="ap-form-group">
            <label htmlFor="reg-confirm-password">Confirm password</label>
            <input
              type="password"
              id="reg-confirm-password"
              placeholder="••••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={confirmErrors.length > 0 ? "ap-input-error" : ""}
            />
            {confirmErrors.map((err) => (
              <span key={err} className="ap-field-error">{err}</span>
            ))}
          </div>

          {registerErrors && (
            <span className="ap-field-error">Something went wrong. Please try again.</span>
          )}

          <button type="submit" className="ap-btn-submit">Create Account</button>
        </form>
      </div>
    </div>
  )
}
