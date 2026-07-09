// Central route table: maps an HTTP verb + URL to the controller function
// that handles it. server.js mounts this whole router at '/'.

import { Router } from 'express';
import { homePage, buildAbout, buildContact } from './index.js';
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
import {
    buildQuestList,
    buildNewQuest,
    createQuestHandler,
    buildEditQuest,
    updateQuestHandler,
    toggleQuestHandler,
    deleteQuestHandler,
    buildCategoryList,
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    buildAccountList,
    updateAccountRoleHandler,
    deleteAccountHandler,
} from './admin-controller.js';
import { questRules, checkQuestData, categoryRules, checkCategoryData } from '../utils/quest-validation.js';
import { submitReportHandler, reviewSubmissionHandler } from './submission-controller.js';
import {
    submissionRules,
    checkSubmissionData,
    reviewRules as submissionReviewRules,
    checkReviewData as checkSubmissionReviewData,
} from '../utils/submission-validation.js';
import {
    createReviewHandler,
    updateReviewHandler,
    deleteReviewHandler,
    flagReviewHandler,
    unflagReviewHandler,
} from './review-controller.js';
import { reviewRules as questReviewRules, checkReviewData as checkQuestReviewData } from '../utils/review-validation.js';
import { requireLogin, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', homePage);
router.get('/about', buildAbout);
router.get('/contact', buildContact);

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
router.post('/myquests/:id/submit', requireLogin, submissionRules(), checkSubmissionData, submitReportHandler);
router.get('/dashboard', requireLogin, buildDashboard);

// Reviewing a submission is a Guild Officer action.
router.post(
    '/submissions/:id/review',
    requireLogin,
    requireRole('Guild Officer'),
    submissionReviewRules(),
    checkSubmissionReviewData,
    reviewSubmissionHandler
);

// Quest reviews: create/edit are the reviewing Hero's own action; delete is
// shared between the owner and a Guild Officer (see review-controller.js);
// flagging is any logged-in user, dismissing a flag is Guild-Officer-only.
router.post('/myquests/:id/review', requireLogin, questReviewRules(), checkQuestReviewData, createReviewHandler);
router.post('/reviews/:id/edit', requireLogin, questReviewRules(), checkQuestReviewData, updateReviewHandler);
router.post('/reviews/:id/delete', requireLogin, deleteReviewHandler);
router.post('/reviews/:id/flag', requireLogin, flagReviewHandler);
router.post('/reviews/:id/unflag', requireLogin, requireRole('Guild Officer'), unflagReviewHandler);

// Every /admin/* route is Administrator-only.
const adminOnly = [requireLogin, requireRole('Administrator')];

router.get('/admin/quests', ...adminOnly, buildQuestList);
router.get('/admin/quests/new', ...adminOnly, buildNewQuest);
router.post('/admin/quests', ...adminOnly, questRules(), checkQuestData, createQuestHandler);
router.get('/admin/quests/:id/edit', ...adminOnly, buildEditQuest);
router.post('/admin/quests/:id/edit', ...adminOnly, questRules(), checkQuestData, updateQuestHandler);
router.post('/admin/quests/:id/toggle', ...adminOnly, toggleQuestHandler);
router.post('/admin/quests/:id/delete', ...adminOnly, deleteQuestHandler);

router.get('/admin/categories', ...adminOnly, buildCategoryList);
router.post('/admin/categories', ...adminOnly, categoryRules(), checkCategoryData, createCategoryHandler);
router.post('/admin/categories/:id/edit', ...adminOnly, categoryRules(), checkCategoryData, updateCategoryHandler);
router.post('/admin/categories/:id/delete', ...adminOnly, deleteCategoryHandler);

router.get('/admin/accounts', ...adminOnly, buildAccountList);
router.post('/admin/accounts/:id/role', ...adminOnly, updateAccountRoleHandler);
router.post('/admin/accounts/:id/delete', ...adminOnly, deleteAccountHandler);

export default router;
