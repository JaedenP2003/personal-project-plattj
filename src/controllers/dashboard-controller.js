import { getHeroStats, getSiteStats } from '../models/dashboard-model.js';
import { getPendingSubmissions } from '../models/submission-model.js';

// Renders one dashboard.ejs, but with different data depending on the
// logged-in account's role — see dashboard.ejs for the matching
// role-branched markup.
const buildDashboard = async (req, res) => {
    const { role } = req.session.account;

    let heroStats = null;
    let pendingSubmissions = null;
    let siteStats = null;

    if (role === 'Hero') {
        heroStats = await getHeroStats(req.session.account.account_id);
    } else if (role === 'Guild Officer') {
        pendingSubmissions = await getPendingSubmissions();
    } else {
        siteStats = await getSiteStats();
    }

    res.render('dashboard', {
        title: 'Dashboard',
        pageStyle: 'dashboard',
        role,
        heroStats,
        pendingSubmissions,
        siteStats,
    });
};

export { buildDashboard };
