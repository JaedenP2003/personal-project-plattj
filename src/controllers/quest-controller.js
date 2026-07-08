import {
    getActiveQuests,
    getAssignmentForAccountAndQuest,
    acceptQuest,
    getAssignmentsForAccount,
} from '../models/quest-model.js';

const buildQuests = async (req, res) => {
    const accountId = req.session.account?.account_id || null;
    const quests = await getActiveQuests(accountId);
    res.render('quests', { title: 'Quests', pageStyle: 'quests', quests });
};

const acceptQuestHandler = async (req, res) => {
    const { account_id, role } = req.session.account;
    const questId = req.params.id;

    if (role !== 'Hero') {
        req.flash('error', 'Only Heroes can accept quests.');
        return res.redirect('/quests');
    }

    try {
        const existing = await getAssignmentForAccountAndQuest(account_id, questId);
        if (existing) {
            req.flash('error', "You've already accepted this quest.");
            return res.redirect('/quests');
        }

        await acceptQuest(account_id, questId);
        req.flash('success', 'Quest accepted! Track it from My Quests.');
        res.redirect('/quests');
    } catch (error) {
        console.error('Error accepting quest:', error);
        req.flash('error', 'An error occurred while accepting the quest. Please try again later.');
        res.redirect('/quests');
    }
};

const buildMyQuests = async (req, res) => {
    const { account_id } = req.session.account;
    const assignments = await getAssignmentsForAccount(account_id);
    res.render('myquests', { title: 'My Quests', pageStyle: 'myquests', assignments });
};

export { buildQuests, acceptQuestHandler, buildMyQuests };
