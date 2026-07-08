// One-time flash messages: a message set with req.flash() survives exactly
// one redirect (stored in the session), then is cleared the moment it's
// read. This is what lets "Registration successful!" show up on the page
// you're redirected to, without staying there on every future visit.

const FLASH_TYPES = ['success', 'error', 'warning', 'info'];

function emptyFlash() {
    return { success: [], error: [], warning: [], info: [] };
}

function flash(req, res, next) {
    // req.flash(type, message) -> store a message
    // req.flash(type)          -> read + clear messages of that type
    // req.flash()              -> read + clear every type at once
    req.flash = function (type, message) {
        if (!req.session) {
            // No session (e.g. right after logout destroyed it) means
            // there's nowhere to store a message — fail quietly instead
            // of throwing.
            return type && message ? undefined : emptyFlash();
        }

        if (!req.session.flash) {
            req.session.flash = emptyFlash();
        }

        if (type && message) {
            if (!FLASH_TYPES.includes(type)) {
                throw new Error(`Unknown flash type: ${type}`);
            }
            req.session.flash[type].push(message);
            return undefined;
        }

        if (type) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }

        // No type given: hand back everything and reset the store, which
        // is what header.ejs calls on every page load to display and then
        // clear whatever's queued up.
        const allMessages = req.session.flash;
        req.session.flash = emptyFlash();
        return allMessages;
    };

    // Lets EJS templates call flash() directly (see header.ejs) without
    // needing access to the req object.
    res.locals.flash = req.flash;
    next();
}

export default flash;
