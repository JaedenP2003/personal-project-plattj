// Controllers for the simple static-ish pages: home, about, contact.

import { getActiveQuests } from '../models/quest-model.js';

const homePage = async (req, res) => {
    // Reuses the same query /quests uses (null accountId = no viewer-specific
    // assignment status needed here) and just takes the first 3 for the
    // homepage teaser.
    const allQuests = await getActiveQuests(null);
    const quests = allQuests.slice(0, 3);

    // pageStyle tells header.ejs to also load /css/home.css alongside
    // the shared main.css (see src/views/partials/header.ejs).
    res.render('home', { title: 'Home', pageStyle: 'home', quests });
};

const buildAbout = (req, res) => {
    res.render('about', { title: 'About', pageStyle: 'about' });
};

const buildContact = (req, res) => {
    res.render('contact', { title: 'Contact', pageStyle: 'contact' });
};

export { homePage, buildAbout, buildContact };
