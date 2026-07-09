// Database access for quest reviews and their moderation.

import { query } from './db.js';

// Used to decide create-vs-edit on /myquests — one review per Hero per
// quest (enforced here at the app level, matching the pattern used for
// "already accepted this quest" rather than a DB constraint).
async function getReviewForAccountAndQuest(accountId, questId) {
    const result = await query('SELECT * FROM review WHERE account_id = $1 AND quest_id = $2', [accountId, questId]);
    return result.rows[0];
}

async function getReviewById(reviewId) {
    const result = await query('SELECT * FROM review WHERE review_id = $1', [reviewId]);
    return result.rows[0];
}

async function createReview(accountId, questId, rating, comment) {
    await query(
        'INSERT INTO review (quest_id, account_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [questId, accountId, rating, comment]
    );
}

async function updateReview(reviewId, rating, comment) {
    await query(
        'UPDATE review SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE review_id = $3',
        [rating, comment, reviewId]
    );
}

// Shared by the owner's own delete and a Guild Officer's moderation
// delete — src/controllers/review-controller.js decides who's allowed to
// call it.
async function deleteReview(reviewId) {
    await query('DELETE FROM review WHERE review_id = $1', [reviewId]);
}

async function flagReview(reviewId) {
    await query('UPDATE review SET is_flagged = TRUE WHERE review_id = $1', [reviewId]);
}

async function unflagReview(reviewId) {
    await query('UPDATE review SET is_flagged = FALSE WHERE review_id = $1', [reviewId]);
}

// For the Guild Officer's moderation queue.
async function getFlaggedReviews() {
    const result = await query(
        `SELECT r.review_id, r.rating, r.comment, q.title AS quest_title, a.username AS reviewer_username
         FROM review r
         JOIN quest q ON q.quest_id = r.quest_id
         JOIN account a ON a.account_id = r.account_id
         WHERE r.is_flagged = TRUE
         ORDER BY r.created_at ASC`
    );
    return result.rows;
}

// For the public quest listing — every review on a quest, newest first.
async function getReviewsForQuest(questId) {
    const result = await query(
        `SELECT r.review_id, r.rating, r.comment, r.created_at, a.username AS reviewer_username
         FROM review r
         JOIN account a ON a.account_id = r.account_id
         WHERE r.quest_id = $1
         ORDER BY r.created_at DESC`,
        [questId]
    );
    return result.rows;
}

export {
    getReviewForAccountAndQuest,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    flagReview,
    unflagReview,
    getFlaggedReviews,
    getReviewsForQuest,
};
