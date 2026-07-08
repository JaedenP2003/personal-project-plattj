// Creates one account per role (Hero, Guild Officer, Administrator) for
// manual testing, matching the credentials documented in README.md.
// Run with `pnpm db:seed`. Safe to rerun: existing rows are updated in
// place (ON CONFLICT) rather than duplicated, so it always resets these
// three accounts back to a known state.

import bcrypt from 'bcrypt';
import pool, { query } from '../src/models/db.js';

const TEST_PASSWORD = 'P@$$w0rd!';

const TEST_ACCOUNTS = [
    { role: 'Administrator', first_name: 'Admin', last_name: 'Account', username: 'admin', email: 'admin@hyrulequestboard.com' },
    { role: 'Guild Officer', first_name: 'Officer', last_name: 'Account', username: 'officer', email: 'officer@hyrulequestboard.com' },
    { role: 'Hero', first_name: 'Hero', last_name: 'Account', username: 'hero', email: 'hero@hyrulequestboard.com' },
];

try {
    const password_hash = await bcrypt.hash(TEST_PASSWORD, 10);

    for (const account of TEST_ACCOUNTS) {
        const roleResult = await query('SELECT role_id FROM role WHERE name = $1', [account.role]);
        const roleId = roleResult.rows[0].role_id;

        await query(
            `INSERT INTO account (first_name, last_name, username, email, password_hash, role_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO UPDATE
             SET first_name = EXCLUDED.first_name,
                 last_name = EXCLUDED.last_name,
                 username = EXCLUDED.username,
                 password_hash = EXCLUDED.password_hash,
                 role_id = EXCLUDED.role_id`,
            [account.first_name, account.last_name, account.username, account.email, password_hash, roleId]
        );

        console.log(`Seeded ${account.role}: ${account.email}`);
    }
} catch (error) {
    console.error('Failed to seed test accounts:', error);
    process.exitCode = 1;
} finally {
    await pool.end();
}
