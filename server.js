// Entry point for the app. Wires together Express, the view engine, sessions,
// flash messages, routes, and error handling, then starts the HTTP server.

import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import { caCert } from './src/models/db.js';
import flash from './src/middleware/flash.js';
import routes from './src/controllers/routes.js';

// ESM doesn't have __dirname built in, so derive it from the module's own URL.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// connect-pg-simple needs the session constructor to build its store class.
const pgSession = connectPgSimple(session);

// Serve everything in /public (CSS, images, fonts) directly, no route needed.
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
        // Allow Express to receive and process POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions are stored in a Postgres table (not in memory), so a logged-in
// user stays logged in even if the server restarts or redeploys.
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            ssl: {
                ca: caCert,
                rejectUnauthorized: true,
                // The BYU-I DB host doesn't match the cert's hostname, so
                // hostname checking is skipped while still validating the
                // cert chain itself.
                checkServerIdentity: () => undefined,
            },
        },
        tableName: 'session',
        // Creates the "session" table automatically on first run.
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
}));

// Makes login state available to every view without each controller having
// to pass it in manually (used by header.ejs to swap the nav links).
app.use((req, res, next) => {
    res.locals.loggedin = Boolean(req.session.account);
    res.locals.accountData = req.session.account || null;
    next();
});

// Adds req.flash()/res.locals.flash for one-time success/error banners
// that survive a redirect (see src/middleware/flash.js).
app.use(flash);

app.use('/', routes);

// Anything that falls through every route above is a 404. This just builds
// the error and hands it to the error-handling middleware below.
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Catches both the 404 above and any error thrown/rejected in a route
// handler (Express 5 auto-forwards rejected promises here). Renders a
// themed error page instead of Express's default plain-text error.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        // Hide the real error/stack trace in production so internals
        // (file paths, query text, etc.) never leak to end users.
        error: NODE_ENV === 'production' ? 'An error occurred.' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        pageStyle: template,
    });
});

// Dev-only: a tiny WebSocket server nodemon/the dev script can ping to
// trigger a browser reload. Never runs in production.
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
