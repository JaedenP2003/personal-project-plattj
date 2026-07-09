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

// An account's own assignments for the My Quests page. LEFT JOINed to
// quest_submission (at most one per assignment, per the "no resubmission"
// rule) so the page can show the Hero their own report text and any
// officer feedback once one exists.
async function getAssignmentsForAccount(accountId) {
    const result = await query(
        `SELECT qa.assignment_id, qa.accepted_at, qa.updated_at,
                q.title, q.description, q.difficulty, q.reward,
                qc.name AS category, qs.name AS status,
                qsub.submission_text, qsub.review_notes
         FROM quest_assignment qa
         JOIN quest q ON q.quest_id = qa.quest_id
         JOIN quest_category qc ON qc.category_id = q.category_id
         JOIN quest_status qs ON qs.status_id = qa.status_id
         LEFT JOIN quest_submission qsub ON qsub.assignment_id = qa.assignment_id
         WHERE qa.account_id = $1
         ORDER BY qa.accepted_at DESC`,
        [accountId]
    );
    return result.rows;
}

// Used to verify ownership + current status before allowing a submission
// (see src/controllers/submission-controller.js).
async function getAssignmentById(assignmentId) {
    const result = await query(
        `SELECT qa.assignment_id, qa.account_id, qa.quest_id, qs.name AS status
         FROM quest_assignment qa
         JOIN quest_status qs ON qs.status_id = qa.status_id
         WHERE qa.assignment_id = $1`,
        [assignmentId]
    );
    return result.rows[0];
}

// Admin-facing quest management ------------------------------------------

// Every quest regardless of is_active, for the admin list (the public
// getActiveQuests above only shows active ones).
async function getAllQuests() {
    const result = await query(
        `SELECT q.quest_id, q.title, q.difficulty, q.reward, q.is_active, qc.name AS category
         FROM quest q
         JOIN quest_category qc ON qc.category_id = q.category_id
         ORDER BY q.created_at DESC`
    );
    return result.rows;
}

async function getQuestById(questId) {
    const result = await query('SELECT * FROM quest WHERE quest_id = $1', [questId]);
    return result.rows[0];
}

async function createQuest({ title, description, category_id, difficulty, reward, created_by }) {
    await query(
        `INSERT INTO quest (title, description, category_id, difficulty, reward, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [title, description, category_id, difficulty, reward, created_by]
    );
}

async function updateQuest(questId, { title, description, category_id, difficulty, reward }) {
    await query(
        `UPDATE quest
         SET title = $1, description = $2, category_id = $3, difficulty = $4, reward = $5
         WHERE quest_id = $6`,
        [title, description, category_id, difficulty, reward, questId]
    );
}

async function toggleQuestActive(questId) {
    await query('UPDATE quest SET is_active = NOT is_active WHERE quest_id = $1', [questId]);
}

// Cascades to that quest's assignments/submissions (see schema.sql) —
// unlike toggleQuestActive, this removes the quest's history entirely.
async function deleteQuest(questId) {
    await query('DELETE FROM quest WHERE quest_id = $1', [questId]);
}

// Admin-facing category management ----------------------------------------

async function getAllCategories() {
    const result = await query('SELECT * FROM quest_category ORDER BY name');
    return result.rows;
}

async function createCategory({ name, description }) {
    await query('INSERT INTO quest_category (name, description) VALUES ($1, $2)', [name, description]);
}

async function updateCategory(categoryId, { name, description }) {
    await query('UPDATE quest_category SET name = $1, description = $2 WHERE category_id = $3', [name, description, categoryId]);
}

// Blocked by quest.category_id's ON DELETE RESTRICT if any quest still
// uses this category — the controller surfaces that as a flash error.
async function deleteCategory(categoryId) {
    await query('DELETE FROM quest_category WHERE category_id = $1', [categoryId]);
}

export {
    getActiveQuests,
    getAssignmentForAccountAndQuest,
    acceptQuest,
    getAssignmentsForAccount,
    getAssignmentById,
    getAllQuests,
    getQuestById,
    createQuest,
    updateQuest,
    toggleQuestActive,
    deleteQuest,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
