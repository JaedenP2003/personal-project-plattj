// Admin-only screens for managing quests, categories, and accounts. Every
// handler here assumes it's already behind requireLogin + requireRole
// ('Administrator') — see src/controllers/routes.js.

import {
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
} from '../models/quest-model.js';
import { getAllAccounts, getAllRoles, updateAccountRole, deleteAccount } from '../models/account-model.js';

// Quests -------------------------------------------------------------------

const buildQuestList = async (req, res) => {
    const quests = await getAllQuests();
    res.render('admin/quests', { title: 'Manage Quests', pageStyle: 'admin', quests });
};

const buildNewQuest = async (req, res) => {
    const categories = await getAllCategories();
    res.render('admin/quest-form', { title: 'New Quest', pageStyle: 'admin', quest: null, categories });
};

const createQuestHandler = async (req, res) => {
    const { title, description, category_id, difficulty, reward } = req.body;

    try {
        await createQuest({
            title,
            description,
            category_id,
            difficulty,
            reward,
            created_by: req.session.account.account_id,
        });
        req.flash('success', 'Quest created.');
        res.redirect('/admin/quests');
    } catch (error) {
        console.error('Error creating quest:', error);
        req.flash('error', 'An error occurred while creating the quest. Please try again later.');
        res.redirect('/admin/quests/new');
    }
};

const buildEditQuest = async (req, res) => {
    const quest = await getQuestById(req.params.id);
    if (!quest) {
        req.flash('error', 'Quest not found.');
        return res.redirect('/admin/quests');
    }

    const categories = await getAllCategories();
    res.render('admin/quest-form', { title: 'Edit Quest', pageStyle: 'admin', quest, categories });
};

const updateQuestHandler = async (req, res) => {
    const { title, description, category_id, difficulty, reward } = req.body;

    try {
        await updateQuest(req.params.id, { title, description, category_id, difficulty, reward });
        req.flash('success', 'Quest updated.');
        res.redirect('/admin/quests');
    } catch (error) {
        console.error('Error updating quest:', error);
        req.flash('error', 'An error occurred while updating the quest. Please try again later.');
        res.redirect(`/admin/quests/${req.params.id}/edit`);
    }
};

const toggleQuestHandler = async (req, res) => {
    try {
        await toggleQuestActive(req.params.id);
        req.flash('success', 'Quest status updated.');
    } catch (error) {
        console.error('Error toggling quest:', error);
        req.flash('error', 'An error occurred while updating the quest.');
    }
    res.redirect('/admin/quests');
};

const deleteQuestHandler = async (req, res) => {
    try {
        await deleteQuest(req.params.id);
        req.flash('success', 'Quest deleted.');
    } catch (error) {
        console.error('Error deleting quest:', error);
        req.flash('error', 'An error occurred while deleting the quest.');
    }
    res.redirect('/admin/quests');
};

// Categories -----------------------------------------------------------------

const buildCategoryList = async (req, res) => {
    const categories = await getAllCategories();
    res.render('admin/categories', { title: 'Manage Categories', pageStyle: 'admin', categories });
};

const createCategoryHandler = async (req, res) => {
    const { name, description } = req.body;

    try {
        await createCategory({ name, description });
        req.flash('success', 'Category created.');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'A category with that name may already exist.');
    }
    res.redirect('/admin/categories');
};

const updateCategoryHandler = async (req, res) => {
    const { name, description } = req.body;

    try {
        await updateCategory(req.params.id, { name, description });
        req.flash('success', 'Category updated.');
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'A category with that name may already exist.');
    }
    res.redirect('/admin/categories');
};

const deleteCategoryHandler = async (req, res) => {
    try {
        await deleteCategory(req.params.id);
        req.flash('success', 'Category deleted.');
    } catch (error) {
        // Fails here if any quest still references this category
        // (ON DELETE RESTRICT in schema.sql).
        req.flash('error', 'That category is still used by at least one quest and cannot be deleted.');
    }
    res.redirect('/admin/categories');
};

// Accounts -------------------------------------------------------------------

const buildAccountList = async (req, res) => {
    const [accounts, roles] = await Promise.all([getAllAccounts(), getAllRoles()]);
    res.render('admin/accounts', { title: 'Manage Accounts', pageStyle: 'admin', accounts, roles });
};

const updateAccountRoleHandler = async (req, res) => {
    if (Number(req.params.id) === req.session.account.account_id) {
        req.flash('error', 'You cannot change your own role.');
        return res.redirect('/admin/accounts');
    }

    try {
        await updateAccountRole(req.params.id, req.body.role_id);
        req.flash('success', 'Account role updated.');
    } catch (error) {
        console.error('Error updating account role:', error);
        req.flash('error', 'An error occurred while updating the account role.');
    }
    res.redirect('/admin/accounts');
};

const deleteAccountHandler = async (req, res) => {
    if (Number(req.params.id) === req.session.account.account_id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/accounts');
    }

    try {
        await deleteAccount(req.params.id);
        req.flash('success', 'Account deleted.');
    } catch (error) {
        console.error('Error deleting account:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }
    res.redirect('/admin/accounts');
};

export {
    buildQuestList,
    buildNewQuest,
    createQuestHandler,
    buildEditQuest,
    updateQuestHandler,
    toggleQuestHandler,
    deleteQuestHandler,
    buildCategoryList,
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    buildAccountList,
    updateAccountRoleHandler,
    deleteAccountHandler,
};
