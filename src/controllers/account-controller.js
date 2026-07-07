import bcrypt from 'bcrypt';
import { registerAccount, getAccountByEmail } from '../models/account-model.js';

const buildRegister = (req, res) => {
    res.render('account/register', { title: 'Register' });
};

const buildLogin = (req, res) => {
    res.render('account/login', { title: 'Login' });
};

const registerAccountHandler = async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);
        await registerAccount({ first_name, last_name, username, email, password_hash });
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
        const passwordMatches = account && (await bcrypt.compare(password, account.password_hash));

        if (!passwordMatches) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

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
