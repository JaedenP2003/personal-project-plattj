// Inserts a handful of sample quests so /quests and /myquests have real
// content to show. Run with `pnpm db:seed-quests`. Safe to rerun: any
// quest whose title already exists is skipped rather than duplicated.

import pool, { query } from '../src/models/db.js';

const SAMPLE_QUESTS = [
    {
        title: 'Hinox Hunt in West Necluda',
        category: 'Monster Hunt',
        difficulty: 'Hard',
        reward: '300 Rupees',
        description: 'A Hinox has been terrorizing travelers near West Necluda. Defeat the beast and restore safety to the roads.',
    },
    {
        title: 'Medicine Delivery to Kakariko',
        category: 'Delivery',
        difficulty: 'Easy',
        reward: '75 Rupees',
        description: 'A healer in Kakariko Village urgently needs medicine delivered before nightfall. Time is of the essence.',
    },
    {
        title: 'Shrine Investigation in Hebra',
        category: 'Puzzle',
        difficulty: 'Medium',
        reward: '150 Rupees',
        description: 'Strange lights have been seen near an ancient shrine in Hebra. Investigate the disturbance and report your findings.',
    },
    {
        title: 'Escort the Traveling Merchant',
        category: 'Escort',
        difficulty: 'Medium',
        reward: '120 Rupees',
        description: 'A merchant needs safe passage through bandit territory on the road to Gerudo Town.',
    },
    {
        title: 'Gather Silent Princess Flowers',
        category: 'Collection',
        difficulty: 'Easy',
        reward: '60 Rupees',
        description: 'A researcher in Hateno Village needs a bundle of rare Silent Princess flowers for a study.',
    },
];

try {
    const adminResult = await query('SELECT account_id FROM account WHERE username = $1', ['admin']);
    const createdBy = adminResult.rows[0]?.account_id ?? null;

    for (const sampleQuest of SAMPLE_QUESTS) {
        const existing = await query('SELECT quest_id FROM quest WHERE title = $1', [sampleQuest.title]);
        if (existing.rowCount > 0) {
            console.log(`Skipped (already exists): ${sampleQuest.title}`);
            continue;
        }

        const categoryResult = await query('SELECT category_id FROM quest_category WHERE name = $1', [sampleQuest.category]);
        const categoryId = categoryResult.rows[0].category_id;

        await query(
            `INSERT INTO quest (title, description, category_id, difficulty, reward, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [sampleQuest.title, sampleQuest.description, categoryId, sampleQuest.difficulty, sampleQuest.reward, createdBy]
        );
        console.log(`Seeded quest: ${sampleQuest.title}`);
    }
} catch (error) {
    console.error('Failed to seed quests:', error);
    process.exitCode = 1;
} finally {
    await pool.end();
}
