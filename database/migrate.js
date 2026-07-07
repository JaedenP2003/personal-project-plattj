import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');

try {
    await pool.query(schema);
    console.log('Schema applied successfully.');
} catch (error) {
    console.error('Failed to apply schema:', error);
    process.exitCode = 1;
} finally {
    await pool.end();
}
