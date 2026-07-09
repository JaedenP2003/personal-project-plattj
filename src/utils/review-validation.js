// express-validator rule set + check-and-flash middleware for creating and
// editing quest reviews. Same pattern as the other *-validation.js files.

import { body, validationResult } from 'express-validator';

function reviewRules() {
    return [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
        body('comment').trim().optional({ values: 'falsy' }).isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters.'),
    ];
}

function checkReviewData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/myquests');
    }
    next();
}

export { reviewRules, checkReviewData };
