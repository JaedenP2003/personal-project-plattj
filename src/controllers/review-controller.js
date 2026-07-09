import { getAssignmentById } from '../models/quest-model.js';
import {
    getReviewForAccountAndQuest,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    flagReview,
    unflagReview,
} from '../models/review-model.js';

const createReviewHandler = async (req, res) => {
    const assignmentId = req.params.id;
    const { account_id } = req.session.account;
    const { rating, comment } = req.body;

    try {
        const assignment = await getAssignmentById(assignmentId);

        if (!assignment || assignment.account_id !== account_id) {
            req.flash('error', 'That quest assignment could not be found.');
            return res.redirect('/myquests');
        }

        if (assignment.status !== 'Completed') {
            req.flash('error', 'You can only review a quest after it has been completed.');
            return res.redirect('/myquests');
        }

        const existing = await getReviewForAccountAndQuest(account_id, assignment.quest_id);
        if (existing) {
            req.flash('error', "You've already reviewed this quest.");
            return res.redirect('/myquests');
        }

        await createReview(account_id, assignment.quest_id, rating, comment);
        req.flash('success', 'Review posted. Thanks for sharing your adventure!');
        res.redirect('/myquests');
    } catch (error) {
        console.error('Error creating review:', error);
        req.flash('error', 'An error occurred while posting your review. Please try again later.');
        res.redirect('/myquests');
    }
};

const updateReviewHandler = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const review = await getReviewById(req.params.id);
        if (!review || review.account_id !== req.session.account.account_id) {
            req.flash('error', 'That review could not be found.');
            return res.redirect('/myquests');
        }

        await updateReview(req.params.id, rating, comment);
        req.flash('success', 'Review updated.');
        res.redirect('/myquests');
    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'An error occurred while updating your review. Please try again later.');
        res.redirect('/myquests');
    }
};

// Covers both "Hero deletes their own review" and "Guild Officer deletes a
// flagged one" with a single route — whichever page the request came from
// (/myquests or the dashboard) is where the user is sent back to.
const deleteReviewHandler = async (req, res) => {
    const { account_id, role } = req.session.account;
    const backTo = req.get('Referer')?.includes('/dashboard') ? '/dashboard' : '/myquests';

    try {
        const review = await getReviewById(req.params.id);
        if (!review) {
            req.flash('error', 'That review could not be found.');
            return res.redirect(backTo);
        }

        if (review.account_id !== account_id && role !== 'Guild Officer') {
            req.flash('error', 'You do not have permission to delete that review.');
            return res.redirect(backTo);
        }

        await deleteReview(req.params.id);
        req.flash('success', 'Review deleted.');
        res.redirect(backTo);
    } catch (error) {
        console.error('Error deleting review:', error);
        req.flash('error', 'An error occurred while deleting the review.');
        res.redirect(backTo);
    }
};

const flagReviewHandler = async (req, res) => {
    try {
        await flagReview(req.params.id);
        req.flash('success', 'Review reported to the Guild for moderation.');
    } catch (error) {
        console.error('Error flagging review:', error);
        req.flash('error', 'An error occurred while reporting the review.');
    }
    res.redirect('/quests');
};

const unflagReviewHandler = async (req, res) => {
    try {
        await unflagReview(req.params.id);
        req.flash('success', 'Review dismissed from the moderation queue.');
    } catch (error) {
        console.error('Error dismissing review flag:', error);
        req.flash('error', 'An error occurred while dismissing the report.');
    }
    res.redirect('/dashboard');
};

export { createReviewHandler, updateReviewHandler, deleteReviewHandler, flagReviewHandler, unflagReviewHandler };
