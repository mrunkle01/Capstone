export interface ValidationRes {
    valid: boolean
    errors: string[]
}

const hasSpecial = (s: string): boolean => /[^a-zA-Z0-9]/.test(s)
const hasNumber = (s: string): boolean => /\d/.test(s)

export function validateEmail(email: string): ValidationRes {
    const res: ValidationRes = { valid: true, errors: [] }

    if (!email) {
        res.errors.push("Email cannot be empty.")
        res.valid = false
        return res
    }
    if (!email.includes('@')) {
        res.errors.push("Email must be a valid format.")
    }
    if (email.length > 50) {
        res.errors.push("Email cannot be longer than 50 characters.")
    }

    if (res.errors.length > 0) res.valid = false
    return res
}

export function validateUsername(username: string): ValidationRes {
    const res: ValidationRes = { valid: true, errors: [] }

    if (!username) {
        res.errors.push("Username cannot be empty.")
        res.valid = false
        return res
    }
    if (username.length > 25 || username.length < 4) {
        res.errors.push("Username should be between 4 and 25 characters.")
    }
    if (hasSpecial(username)) {
        res.errors.push("Username should not have special characters.")
    }

    if (res.errors.length > 0) res.valid = false
    return res
}

export function validatePassword(password: string): ValidationRes {
    const res: ValidationRes = { valid: true, errors: [] }

    if (!password) {
        res.errors.push("Password cannot be empty.")
        res.valid = false
        return res
    }
    if (password.length < 10 || password.length > 32) {
        res.errors.push("Password must be between 10 and 32 characters.")
    }
    if (!hasSpecial(password)) {
        res.errors.push("Need at least one special character.")
    }
    if (!hasNumber(password)) {
        res.errors.push("Need at least one number.")
    }

    if (res.errors.length > 0) res.valid = false
    return res
}