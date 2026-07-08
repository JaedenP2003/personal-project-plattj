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

export { requireLogin };
