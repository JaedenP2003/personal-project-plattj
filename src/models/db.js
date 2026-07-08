// Shared Postgres connection used everywhere the app talks to the database
// (models, and the session store in server.js). Every other file imports
// from here instead of creating its own connection.

import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, '../../bin/byuicse-psql-cert.pem');

// The BYU-I hosted Postgres server requires TLS, verified against its own
// certificate authority rather than a public one.
const caCert = fs.readFileSync(certPath, 'utf8');

// A connection pool reuses a small set of open connections across requests
// instead of opening/closing one per query, which is much faster.
const pool = new pg.Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        ca: caCert,
        rejectUnauthorized: true,
        // The DB is reached by IP, which doesn't match the cert's hostname,
        // so hostname checking is skipped while still validating the cert
        // chain itself (still confirms it's talking to the real server).
        checkServerIdentity: () => undefined,
    },
});

// Thin wrapper around pool.query() that optionally logs every SQL
// statement + its parameters when ENABLE_SQL_LOGGING=true, which is handy
// for seeing exactly what's being sent to Postgres during development.
async function query(text, params) {
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('executed query', { text, params });
    }
    return pool.query(text, params);
}

export default pool;
export { query, caCert };
