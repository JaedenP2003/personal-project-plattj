const FLASH_TYPES = ['success', 'error', 'warning', 'info'];

function emptyFlash() {
    return { success: [], error: [], warning: [], info: [] };
}

function flash(req, res, next) {
    req.flash = function (type, message) {
        if (!req.session) {
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

        const allMessages = req.session.flash;
        req.session.flash = emptyFlash();
        return allMessages;
    };

    res.locals.flash = req.flash;
    next();
}

export default flash;
