# Hyrule Quest Board

## 1. Project Description

Hyrule Quest Board is a Zelda-inspired web application that allows users to browse, accept, and complete quests throughout the kingdom of Hyrule. Users can track quest progress through multiple stages, submit completion reports, and interact with other users through reviews and comments.

The site is designed for fans of The Legend of Zelda and serves as a demonstration of backend web development concepts including authentication, database design, workflow management, role-based authorization, and dynamic content rendering.

---

## 2. Database Schema

```mermaid
erDiagram
    ROLE ||--o{ ACCOUNT : "has"
    ACCOUNT ||--o{ QUEST : "creates (optional)"
    QUEST_CATEGORY ||--o{ QUEST : "categorizes"
    ACCOUNT ||--o{ QUEST_ASSIGNMENT : "accepts"
    QUEST ||--o{ QUEST_ASSIGNMENT : "assigned via"
    QUEST_STATUS ||--o{ QUEST_ASSIGNMENT : "status"
    QUEST_ASSIGNMENT ||--o| QUEST_SUBMISSION : "reported via"
    QUEST_STATUS ||--o{ QUEST_SUBMISSION : "status"
    ACCOUNT ||--o{ QUEST_SUBMISSION : "reviews (optional)"
    QUEST ||--o{ REVIEW : "receives"
    ACCOUNT ||--o{ REVIEW : "writes"

    ROLE {
        int role_id PK
        string name
        string description
    }
    ACCOUNT {
        int account_id PK
        string first_name
        string last_name
        string username
        string email
        string password_hash
        int role_id FK
        timestamp created_at
    }
    QUEST_CATEGORY {
        int category_id PK
        string name
        string description
    }
    QUEST_STATUS {
        int status_id PK
        string name
    }
    QUEST {
        int quest_id PK
        string title
        string description
        int category_id FK
        string difficulty
        string reward
        int created_by FK
        boolean is_active
        timestamp created_at
    }
    QUEST_ASSIGNMENT {
        int assignment_id PK
        int quest_id FK
        int account_id FK
        int status_id FK
        timestamp accepted_at
        timestamp updated_at
    }
    QUEST_SUBMISSION {
        int submission_id PK
        int assignment_id FK
        string submission_text
        timestamp submitted_at
        int reviewed_by FK
        timestamp reviewed_at
        string review_notes
        int status_id FK
    }
    REVIEW {
        int review_id PK
        int quest_id FK
        int account_id FK
        int rating
        string comment
        boolean is_flagged
        timestamp created_at
    }
```

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

- Heroes cannot yet rate or review a quest after completing it (the `review` table exists, but there's no UI for it yet).
- The public Quests page has no filtering or sorting options.
- There is no password reset ("forgot password") flow.
- No automated test suite yet.

---

## Technologies Used

- Node.js
- Express
- PostgreSQL
- pgAdmin
- EJS
- Express Session (session store backed by PostgreSQL via `connect-pg-simple`)
- bcrypt (password hashing)
- express-validator (form validation)
- HTML
- CSS
- JavaScript
