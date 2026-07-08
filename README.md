# Hyrule Quest Board

## 1. Project Description

Hyrule Quest Board is a Zelda-inspired web application that allows users to browse, accept, and complete quests throughout the kingdom of Hyrule. Users can track quest progress through multiple stages, submit completion reports, and interact with other users through reviews and comments.

The site is designed for fans of The Legend of Zelda and serves as a demonstration of backend web development concepts including authentication, database design, workflow management, role-based authorization, and dynamic content rendering.

---

## 2. Database Schema

The database schema (ERD) will be added once the database design is finalized and exported from pgAdmin.

Planned tables include:

- Users
- Roles
- Quests
- Quest Categories
- Quest Assignments
- Quest Statuses
- Quest Submissions
- Reviews

*ERD image coming soon.*

---

## 3. User Roles

### Hero (Standard User)
Heroes are regular users of the site.

Permissions:
- Register and log in
- Browse available quests
- Accept quests
- Submit quest completion reports
- View quest history
- Create, edit, and delete their own reviews

### Guild Officer (Secondary Role)
Guild Officers assist in managing quest activity.

Permissions:
- Review submitted quest reports
- Approve or reject quest completions
- Moderate user reviews
- Monitor active quests

### Administrator
Administrators have full control over the system.

Permissions:
- Manage users and roles
- Create, edit, and delete quests
- Manage quest categories
- Moderate content
- View site statistics
- Access the administrative dashboard

---

## 4. Test Account Credentials

All accounts use a test password

| Role | Username | Email |
|-------|----------|-------|
| Administrator | admin | admin@hyrulequestboard.com |
| Guild Officer | officer | officer@hyrulequestboard.com |
| Hero | hero | hero@hyrulequestboard.com |

---

## 5. Known Limitations

Current limitations and planned improvements:

- ERD has not yet been finalized.
- PostgreSQL integration is still in progress.
- Some administrative features have not been implemented.
- Quest review moderation may be expanded in future updates.
- Styling and responsiveness are still under development.
- Additional quest filtering and sorting options are planned.

---

## Technologies Used

- Node.js
- Express
- PostgreSQL
- pgAdmin
- EJS
- Express Session
- HTML
- CSS
- JavaScript
