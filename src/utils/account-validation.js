// express-validator rule sets + the middleware that checks them, for the
// registration and login forms. Each `checkXData` middleware runs after its
// rules; if anything failed, it flashes every error message and redirects
// back to the form instead of calling the controller.

import { body, validationResult } from 'express-validator';
import { checkExistingEmail, checkExistingUsername } from '../models/account-model.js';

// Validation rules for POST /register. Each body(...) chain validates one
// field; .custom() rules can be async, which is how the uniqueness checks
// query the database mid-validation.
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
            // isStrongPassword checks length + character variety in one
            // call instead of chaining several .matches(/regex/) rules.
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

// Runs after registrationRules(). validationResult(req) collects whatever
// the rules above found; if any failed, every message gets queued as a
// flash and the user is bounced back to the form to try again. Only calls
// next() (i.e. lets registerAccountHandler run) when everything passed.
function checkRegData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/register');
    }
    next();
}

// Deliberately lighter than registrationRules(): login only needs to
// confirm the fields are well-formed, not whether they're actually
// correct — that check happens against the hashed password in the
// controller, where a wrong guess gets the same generic error either way.
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
