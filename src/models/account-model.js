import { query } from './db.js';

async function checkExistingEmail(email) {
    const result = await query('SELECT account_id FROM account WHERE email = $1', [email]);
    return result.rowCount > 0;
}

async function checkExistingUsername(username) {
    const result = await query('SELECT account_id FROM account WHERE username = $1', [username]);
    return result.rowCount > 0;
}

async function registerAccount({ first_name, last_name, username, email, password_hash }) {
    const roleResult = await query('SELECT role_id FROM role WHERE name = $1', ['Hero']);
    const heroRoleId = roleResult.rows[0].role_id;

    const result = await query(
        `INSERT INTO account (first_name, last_name, username, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING account_id, first_name, last_name, username, email`,
        [first_name, last_name, username, email, password_hash, heroRoleId]
    );
    return result.rows[0];
}

async function getAccountByEmail(email) {
    const result = await query(
        `SELECT a.account_id, a.first_name, a.last_name, a.username, a.email, a.password_hash,
                r.name AS role
         FROM account a
         JOIN role r ON r.role_id = a.role_id
         WHERE a.email = $1`,
        [email]
    );
    return result.rows[0];
}

export { checkExistingEmail, checkExistingUsername, registerAccount, getAccountByEmail };
