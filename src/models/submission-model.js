// Database access for quest completion reports and their review.

import { query } from './db.js';

// Creates the Hero's completion report and moves the assignment to
// Submitted so it shows up correctly on both /myquests and the Guild
// Officer's pending-review list.
async function createSubmission(assignmentId, submissionText) {
    const statusResult = await query('SELECT status_id FROM quest_status WHERE name = $1', ['Submitted']);
    const submittedStatusId = statusResult.rows[0].status_id;

    await query(
        'INSERT INTO quest_submission (assignment_id, submission_text, status_id) VALUES ($1, $2, $3)',
        [assignmentId, submissionText, submittedStatusId]
    );
    await query(
        'UPDATE quest_assignment SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE assignment_id = $2',
        [submittedStatusId, assignmentId]
    );
}

// Submissions still in "Submitted" status, for the Guild Officer dashboard.
async function getPendingSubmissions() {
    const result = await query(
        `SELECT qsub.submission_id, qsub.submitted_at, qsub.submission_text,
                q.title, a.username AS hero_username
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

// Records the Guild Officer's decision on a submission, then advances the
// linked assignment: Approved -> Completed, Rejected -> Rejected (terminal
// either way — no resubmission).
async function reviewSubmission(submissionId, decision, reviewNotes, officerId) {
    const statusResult = await query('SELECT status_id FROM quest_status WHERE name = $1', [decision]);
    const decisionStatusId = statusResult.rows[0].status_id;

    const submissionResult = await query(
        `UPDATE quest_submission
         SET status_id = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, review_notes = $3
         WHERE submission_id = $4
         RETURNING assignment_id`,
        [decisionStatusId, officerId, reviewNotes, submissionId]
    );
    const { assignment_id } = submissionResult.rows[0];

    const assignmentStatusName = decision === 'Approved' ? 'Completed' : 'Rejected';
    const assignmentStatusResult = await query('SELECT status_id FROM quest_status WHERE name = $1', [assignmentStatusName]);

    await query(
        'UPDATE quest_assignment SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE assignment_id = $2',
        [assignmentStatusResult.rows[0].status_id, assignment_id]
    );
}

export { createSubmission, getPendingSubmissions, reviewSubmission };
