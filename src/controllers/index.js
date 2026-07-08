// Controller for the home page.

const homePage = (req, res) => {
    // pageStyle tells header.ejs to also load /css/home.css alongside
    // the shared main.css (see src/views/partials/header.ejs).
    res.render('home', { title: 'Home', pageStyle: 'home' });
};

export { homePage };
