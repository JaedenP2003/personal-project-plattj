import { body, validationResult } from 'express-validator';
import { checkExistingEmail, checkExistingUsername } from '../models/account-model.js';

function registrationRules() {
    return [
        body('first_name').trim().notEmpty().withMessage('First name is required.'),
        body('last_name').trim().notEmpty().withMessage('Last name is required.'),
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be between 3 and 50 characters.')
            .custom(async (username) => {
                if (await checkExistingUsername(username)) {
                    throw new Error('That username is already taken.');
                }
                return true;
            }),
        body('email')
            .trim()
            .isEmail()
            .withMessage('A valid email is required.')
            .normalizeEmail()
            .custom(async (email) => {
                if (await checkExistingEmail(email)) {
                    throw new Error('An account with that email already exists.');
                }
                return true;
            }),
        body('password')
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.'),
        body('confirm_password').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    ];
}

function checkRegData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/register');
    }
    next();
}

function loginRules() {
    return [
        body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required.'),
    ];
}

function checkLoginData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/login');
    }
    next();
}

export { registrationRules, checkRegData, loginRules, checkLoginData };
