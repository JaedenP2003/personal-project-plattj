// Central route table: maps an HTTP verb + URL to the controller function
// that handles it. server.js mounts this whole router at '/'.

import { Router } from 'express';
import { homePage } from './index.js';
import {
    buildRegister,
    buildLogin,
    registerAccountHandler,
    loginAccountHandler,
    logoutAccountHandler,
} from './account-controller.js';
import { registrationRules, checkRegData, loginRules, checkLoginData } from '../utils/account-validation.js';
import { buildQuests, acceptQuestHandler, buildMyQuests } from './quest-controller.js';
import { buildDashboard } from './dashboard-controller.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();
router.get('/', homePage);

// GET renders the empty form; POST handles the submission. On a POST, the
// request passes through the validation rules and the check-and-flash
// middleware first — the controller only runs once the data is valid.
router.get('/register', buildRegister);
router.post('/register', registrationRules(), checkRegData, registerAccountHandler);
router.get('/login', buildLogin);
router.post('/login', loginRules(), checkLoginData, loginAccountHandler);
router.get('/logout', logoutAccountHandler);

// Quests are browsable by anyone; accepting one, tracking your own
// accepted quests, and the dashboard all require being logged in.
router.get('/quests', buildQuests);
router.post('/quests/:id/accept', requireLogin, acceptQuestHandler);
router.get('/myquests', requireLogin, buildMyQuests);
router.get('/dashboard', requireLogin, buildDashboard);

export default router;
