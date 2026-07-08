// Handlers for registration, login, and logout. By the time a POST handler
// here runs, express-validator has already confirmed the submitted data is
// valid (see src/utils/account-validation.js) — these functions only deal
// with what happens once the data is trustworthy.

import bcrypt from 'bcrypt';
import { registerAccount, getAccountByEmail } from '../models/account-model.js';

// Just render the empty forms — no data to prepare.
const buildRegister = (req, res) => {
    res.render('account/register', { title: 'Register', pageStyle: 'register' });
};

const buildLogin = (req, res) => {
    res.render('account/login', { title: 'Login', pageStyle: 'login' });
};

const registerAccountHandler = async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    try {
        // Never store the plain-text password — bcrypt.hash salts and
        // hashes it so even a database leak wouldn't expose real passwords.
        const password_hash = await bcrypt.hash(password, 10);
        await registerAccount({ first_name, last_name, username, email, password_hash });
        // Flash + redirect (rather than rendering here) means the message
        // survives the redirect and a page refresh won't resubmit the form.
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error occurred during registration:', error);
        req.flash('error', 'An error occurred during registration. Please try again later.');
        res.redirect('/register');
    }
};

const loginAccountHandler = async (req, res) => {
    const { email, password } = req.body;

    try {
        const account = await getAccountByEmail(email);
        // Short-circuits to false if no account was found, so
        // bcrypt.compare is never called with an undefined hash.
        const passwordMatches = account && (await bcrypt.compare(password, account.password_hash));

        if (!passwordMatches) {
            // Deliberately the same generic message whether the email
            // doesn't exist or the password is wrong — this stops an
            // attacker from using the error to discover valid emails.
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        // Storing this object in the session is what "logs the user in" —
        // every later request carries the session cookie, and
        // server.js reads req.session.account to know who's signed in.
        // The password hash is deliberately left out of this object.
        req.session.account = {
            account_id: account.account_id,
            username: account.username,
            first_name: account.first_name,
            role: account.role,
        };
        req.flash('success', `Welcome back, ${account.first_name}!`);
        res.redirect('/');
    } catch (error) {
        console.error('Error occurred during login:', error);
        req.flash('error', 'An error occurred while logging in. Please try again later.');
        res.redirect('/login');
    }
};

const logoutAccountHandler = (req, res) => {
    if (!req.session) {
        return res.redirect('/');
    }

    // Removes the session row from the database entirely (not just the
    // account field), so the session id in the user's cookie becomes
    // meaningless even if someone else got hold of it.
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

export {
    buildRegister,
    buildLogin,
    registerAccountHandler,
    loginAccountHandler,
    logoutAccountHandler,
};
