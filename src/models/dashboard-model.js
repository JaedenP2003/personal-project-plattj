// Database access for the role-specific dashboard content.

import { query } from './db.js';

// Hero: how many of their assignments are in each status, so the
// dashboard can show e.g. "2 Accepted, 1 Completed".
async function getHeroStats(accountId) {
    const result = await query(
        `SELECT qs.name AS status, COUNT(*) AS count
         FROM quest_assignment qa
         JOIN quest_status qs ON qs.status_id = qa.status_id
         WHERE qa.account_id = $1
         GROUP BY qs.name`,
        [accountId]
    );
    return result.rows;
}

// Guild Officer: submissions still waiting on a review. Returns an empty
// list today since there's no way to submit a quest yet — the query is
// still correct and will start returning rows once that feature exists.
async function getPendingSubmissions() {
    const result = await query(
        `SELECT qsub.submission_id, qsub.submitted_at, q.title, a.username AS hero_username
         FROM quest_submission qsub
         JOIN quest_assignment qa ON qa.assignment_id = qsub.assignment_id
         JOIN quest q ON q.quest_id = qa.quest_id
         JOIN account a ON a.account_id = qa.account_id
         JOIN quest_status qs ON qs.status_id = qsub.status_id
         WHERE qs.name = 'Submitted'
         ORDER BY qsub.submitted_at ASC`
    );
    return result.rows;
}

// Administrator: high-level counts across the whole site.
async function getSiteStats() {
    const result = await query(
        `SELECT (SELECT COUNT(*) FROM account) AS total_accounts,
                (SELECT COUNT(*) FROM quest WHERE is_active) AS active_quests,
                (SELECT COUNT(*) FROM quest_assignment) AS total_assignments`
    );
    return result.rows[0];
}

export { getHeroStats, getPendingSubmissions, getSiteStats };
