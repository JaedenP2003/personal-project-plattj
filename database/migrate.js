// Applies database/schema.sql to the database pointed at by DB_URL.
// Run with `pnpm db:migrate`. Safe to run repeatedly: schema.sql drops and
// recreates every table each time, so this always leaves the database in a
// known, matching state (any existing rows are wiped).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');

try {
    // pg allows multiple ;-separated statements in a single query() call,
    // so the whole schema file can be sent as one request.
    await pool.query(schema);
    console.log('Schema applied successfully.');
} catch (error) {
    console.error('Failed to apply schema:', error);
    process.exitCode = 1;
} finally {
    // Close the pool so the script actually exits instead of hanging on
    // an open connection.
    await pool.end();
}
