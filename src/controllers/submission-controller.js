import { getAssignmentById } from '../models/quest-model.js';
import { createSubmission, reviewSubmission } from '../models/submission-model.js';

const submitReportHandler = async (req, res) => {
    const assignmentId = req.params.id;
    const { account_id } = req.session.account;

    try {
        const assignment = await getAssignmentById(assignmentId);

        if (!assignment || assignment.account_id !== account_id) {
            req.flash('error', 'That quest assignment could not be found.');
            return res.redirect('/myquests');
        }

        if (assignment.status !== 'Accepted') {
            req.flash('error', 'This quest has already been submitted.');
            return res.redirect('/myquests');
        }

        await createSubmission(assignmentId, req.body.submission_text);
        req.flash('success', 'Completion report submitted! A Guild Officer will review it soon.');
        res.redirect('/myquests');
    } catch (error) {
        console.error('Error submitting quest report:', error);
        req.flash('error', 'An error occurred while submitting your report. Please try again later.');
        res.redirect('/myquests');
    }
};

const reviewSubmissionHandler = async (req, res) => {
    const { decision, review_notes } = req.body;
    const officerId = req.session.account.account_id;

    try {
        await reviewSubmission(req.params.id, decision, review_notes, officerId);
        req.flash('success', `Submission ${decision.toLowerCase()}.`);
    } catch (error) {
        console.error('Error reviewing submission:', error);
        req.flash('error', 'An error occurred while reviewing the submission.');
    }
    res.redirect('/dashboard');
};

export { submitReportHandler, reviewSubmissionHandler };
