// Route guard for pages that require an active login (e.g. /dashboard,
// /myquests). Apply as middleware before the controller: any request
// without a logged-in account never reaches it.

function requireLogin(req, res, next) {
    if (req.session && req.session.account) {
        return next();
    }

    req.flash('error', 'You must be logged in to view that page.');
    res.redirect('/login');
}

// Route guard for role-restricted pages (e.g. /admin/*). Use after
// requireLogin, since it assumes req.session.account already exists.
function requireRole(roleName) {
    return (req, res, next) => {
        if (!req.session || !req.session.account) {
            req.flash('error', 'You must be logged in to view that page.');
            return res.redirect('/login');
        }

        if (req.session.account.role !== roleName) {
            req.flash('error', 'You do not have permission to view that page.');
            return res.redirect('/');
        }

        next();
    };
}

export { requireLogin, requireRole };
