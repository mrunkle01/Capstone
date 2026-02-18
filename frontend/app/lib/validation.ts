export interface ValidationRes {
    valid: boolean
    message: string
}
const hasSpecial = (password: string): boolean => {
    for (const char of password) {
        const code = char.charCodeAt(0);
        if (
            !(code >= 48 && code <= 57) && //Numbs
            !(code >= 65 && code <= 90) && //Upper Letters
            !(code >= 97 && code <= 122)   //Lower LEtters
        ) {
            return true;
        }
    }
    return false;
};const hasNumber = (password: string): boolean => {
    for (const char of password) {
        const code = char.charCodeAt(0);

        if (code >= 48 && code <= 57) {
            return true;
        }
    }
    return false;
};
export function validateEmail(email: string): ValidationRes {
    let res: ValidationRes = {
        valid: true,
        message: "",
    }

    if (!email) {
        res.message += ` Email cannot be empty.`
        res.valid = false
    }
    if (email.length > 50) {
        res.message += ` Email cannot be longer than 50 characters.`
        res.valid = false
    }

    return res

}
export function validatePassword(password: string): ValidationRes {
    let res: ValidationRes = {
        valid: true,
        message: "",
    }

    if (!password) {
        res.message += ` Password cannot be empty.`
        res.valid = false
    }
    if (password && (password.length > 32 || password.length < 10)) {
        res.message += ` Password must be between 10 and 32 characters.`
        res.valid = false
    }
    if (password && !hasSpecial(password)) {
        res.message += ` Need at least one special character.`
        res.valid = false
    }
     if (password && !hasNumber(password)) {
            res.message += ` Need at least one number.`
            res.valid = false
        }

    return res
}