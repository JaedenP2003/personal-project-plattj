import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, '../../bin/byuicse-psql-cert.pem');

const caCert = fs.readFileSync(certPath, 'utf8');

const pool = new pg.Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        ca: caCert,
        rejectUnauthorized: true,
        checkServerIdentity: () => undefined,
    },
});

async function query(text, params) {
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('executed query', { text, params });
    }
    return pool.query(text, params);
}

export default pool;
export { query, caCert };
