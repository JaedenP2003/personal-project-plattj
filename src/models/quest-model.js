// Database access for quests and quest assignments.

import { query } from './db.js';

// All active quests, with the viewing account's own assignment status
// (if any) attached via LEFT JOIN so the quests page can show "Accept" vs
// "Already Accepted" per quest. accountId is null for anonymous visitors,
// which makes the join match nothing and my_status come back null for
// every row — exactly the "not accepted" state we want.
async function getActiveQuests(accountId) {
    const result = await query(
        `SELECT q.quest_id, q.title, q.description, q.difficulty, q.reward,
                qc.name AS category, qs.name AS my_status
         FROM quest q
         JOIN quest_category qc ON qc.category_id = q.category_id
         LEFT JOIN quest_assignment qa ON qa.quest_id = q.quest_id AND qa.account_id = $1
         LEFT JOIN quest_status qs ON qs.status_id = qa.status_id
         WHERE q.is_active = TRUE
         ORDER BY q.created_at DESC`,
        [accountId]
    );
    return result.rows;
}

// Used before inserting a new assignment, to stop the same account from
// accepting the same quest twice.
async function getAssignmentForAccountAndQuest(accountId, questId) {
    const result = await query(
        'SELECT assignment_id FROM quest_assignment WHERE account_id = $1 AND quest_id = $2',
        [accountId, questId]
    );
    return result.rows[0];
}

// Creates the assignment that links a Hero to a quest they've accepted.
async function acceptQuest(accountId, questId) {
    const statusResult = await query('SELECT status_id FROM quest_status WHERE name = $1', ['Accepted']);
    const acceptedStatusId = statusResult.rows[0].status_id;

    await query(
        'INSERT INTO quest_assignment (quest_id, account_id, status_id) VALUES ($1, $2, $3)',
        [questId, accountId, acceptedStatusId]
    );
}

// An account's own assignments for the My Quests page.
async function getAssignmentsForAccount(accountId) {
    const result = await query(
        `SELECT qa.assignment_id, qa.accepted_at, qa.updated_at,
                q.title, q.description, q.difficulty, q.reward,
                qc.name AS category, qs.name AS status
         FROM quest_assignment qa
         JOIN quest q ON q.quest_id = qa.quest_id
         JOIN quest_category qc ON qc.category_id = q.category_id
         JOIN quest_status qs ON qs.status_id = qa.status_id
         WHERE qa.account_id = $1
         ORDER BY qa.accepted_at DESC`,
        [accountId]
    );
    return result.rows;
}

export { getActiveQuests, getAssignmentForAccountAndQuest, acceptQuest, getAssignmentsForAccount };
