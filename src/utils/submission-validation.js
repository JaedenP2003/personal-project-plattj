// express-validator rule sets + check-and-flash middleware for submitting
// and reviewing quest completion reports. Same pattern as the other
// */validation.js files.

import { body, validationResult } from 'express-validator';

function submissionRules() {
    return [
        body('submission_text')
            .trim()
            .isLength({ min: 10 })
            .withMessage('Your completion report must be at least 10 characters.'),
    ];
}

function checkSubmissionData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/myquests');
    }
    next();
}

function reviewRules() {
    return [
        body('decision').isIn(['Approved', 'Rejected']).withMessage('Invalid review decision.'),
        body('review_notes').trim().optional({ values: 'falsy' }),
    ];
}

function checkReviewData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/dashboard');
    }
    next();
}

export { submissionRules, checkSubmissionData, reviewRules, checkReviewData };
