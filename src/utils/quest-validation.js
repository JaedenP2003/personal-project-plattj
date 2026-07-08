// express-validator rule sets + check-and-flash middleware for the admin
// quest and category forms. Same pattern as src/utils/account-validation.js.

import { body, validationResult } from 'express-validator';

function questRules() {
    return [
        body('title').trim().isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters.'),
        body('description').trim().notEmpty().withMessage('Description is required.'),
        body('category_id').isInt().withMessage('A category must be selected.'),
        body('difficulty').trim().notEmpty().withMessage('Difficulty is required.'),
        body('reward').trim().notEmpty().withMessage('Reward is required.'),
    ];
}

// On failure, redirects back to the form it came from rather than always
// to the same URL — the "new" and "edit" forms live at different paths.
function checkQuestData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        const backTo = req.params.id ? `/admin/quests/${req.params.id}/edit` : '/admin/quests/new';
        return res.redirect(backTo);
    }
    next();
}

function categoryRules() {
    return [
        body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
        body('description').trim().optional({ values: 'falsy' }),
    ];
}

function checkCategoryData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/admin/categories');
    }
    next();
}

export { questRules, checkQuestData, categoryRules, checkCategoryData };
