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

// Administrator: high-level counts across the whole site.
async function getSiteStats() {
    const result = await query(
        `SELECT (SELECT COUNT(*) FROM account) AS total_accounts,
                (SELECT COUNT(*) FROM quest WHERE is_active) AS active_quests,
                (SELECT COUNT(*) FROM quest_assignment) AS total_assignments`
    );
    return result.rows[0];
}

export { getHeroStats, getSiteStats };
