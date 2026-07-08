-- Hyrule Quest Board schema
-- Safe to rerun: drops tables in reverse dependency order before recreating them.
-- Applied via `pnpm db:migrate` (see database/migrate.js), or paste directly
-- into pgAdmin's Query Tool.

-- Tables are dropped child-first (the table with the foreign key before the
-- table it points to) so Postgres doesn't complain about dependent objects.
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS quest_submission CASCADE;
DROP TABLE IF EXISTS quest_assignment CASCADE;
DROP TABLE IF EXISTS quest CASCADE;
DROP TABLE IF EXISTS quest_status CASCADE;
DROP TABLE IF EXISTS quest_category CASCADE;
DROP TABLE IF EXISTS account_role CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS role CASCADE;

-- One row per role (Hero, Guild Officer, Administrator). Accounts reference
-- this by id rather than storing the role name directly, so renaming or
-- adding a role doesn't require touching every account row.
CREATE TABLE role (
    role_id     SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- A registered user. Every account has exactly one role (role_id).
-- password_hash stores a bcrypt hash, never the plain-text password.
CREATE TABLE account (
    account_id    SERIAL PRIMARY KEY,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    -- ON DELETE RESTRICT: a role can't be deleted while accounts still use it.
    role_id       INTEGER NOT NULL REFERENCES role (role_id) ON DELETE RESTRICT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Speeds up "find all accounts with this role" and the join used at login.
CREATE INDEX idx_account_role_id ON account (role_id);

-- Lookup table for quest types (Delivery, Monster Hunt, etc.), editable by
-- admins later without touching the quest table itself.
CREATE TABLE quest_category (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Lookup table for where a quest/assignment/submission is in its lifecycle
-- (Available -> Accepted -> Submitted -> Approved/Rejected -> Completed).
CREATE TABLE quest_status (
    status_id SERIAL PRIMARY KEY,
    name      VARCHAR(50) UNIQUE NOT NULL
);

-- A single posted quest. created_by is nullable (ON DELETE SET NULL) so
-- deleting the admin who posted a quest doesn't delete the quest itself.
CREATE TABLE quest (
    quest_id    SERIAL PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    -- ON DELETE RESTRICT: can't delete a category while quests use it.
    category_id INTEGER NOT NULL REFERENCES quest_category (category_id) ON DELETE RESTRICT,
    difficulty  VARCHAR(50),
    reward      VARCHAR(150),
    created_by  INTEGER REFERENCES account (account_id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_category_id ON quest (category_id);
CREATE INDEX idx_quest_created_by ON quest (created_by);

-- Links a Hero (account) to a quest they've accepted, plus its current
-- status. ON DELETE CASCADE: deleting the quest or the account also removes
-- this assignment row, since it's meaningless without both sides.
CREATE TABLE quest_assignment (
    assignment_id SERIAL PRIMARY KEY,
    quest_id      INTEGER NOT NULL REFERENCES quest (quest_id) ON DELETE CASCADE,
    account_id    INTEGER NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
    status_id     INTEGER NOT NULL REFERENCES quest_status (status_id) ON DELETE RESTRICT,
    accepted_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_assignment_quest_id ON quest_assignment (quest_id);
CREATE INDEX idx_quest_assignment_account_id ON quest_assignment (account_id);
CREATE INDEX idx_quest_assignment_status_id ON quest_assignment (status_id);

-- A Hero's completion report for an assignment, plus the Guild Officer's
-- review of it (reviewed_by/reviewed_at/review_notes stay NULL until
-- someone reviews it).
CREATE TABLE quest_submission (
    submission_id   SERIAL PRIMARY KEY,
    assignment_id   INTEGER NOT NULL REFERENCES quest_assignment (assignment_id) ON DELETE CASCADE,
    submission_text TEXT NOT NULL,
    submitted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     INTEGER REFERENCES account (account_id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMP,
    review_notes    TEXT,
    status_id       INTEGER NOT NULL REFERENCES quest_status (status_id) ON DELETE RESTRICT
);

CREATE INDEX idx_quest_submission_assignment_id ON quest_submission (assignment_id);
CREATE INDEX idx_quest_submission_reviewed_by ON quest_submission (reviewed_by);
CREATE INDEX idx_quest_submission_status_id ON quest_submission (status_id);

-- A Hero's rating/comment on a quest they've completed. is_flagged lets a
-- Guild Officer mark a review for moderation without deleting it outright.
CREATE TABLE review (
    review_id  SERIAL PRIMARY KEY,
    quest_id   INTEGER NOT NULL REFERENCES quest (quest_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES account (account_id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_review_quest_id ON review (quest_id);
CREATE INDEX idx_review_account_id ON review (account_id);

-- Reference / lookup data (not test accounts) --------------------------
-- These rows are required for the app to function (registration assigns
-- the "Hero" role by name, quests need at least one category to belong
-- to), so they're seeded here rather than treated as sample data.

INSERT INTO role (name, description) VALUES
    ('Hero', 'Standard user: browse and accept quests, submit reports, write reviews.'),
    ('Guild Officer', 'Reviews quest submissions and moderates reviews.'),
    ('Administrator', 'Full control over users, quests, categories, and content.');

INSERT INTO quest_status (name) VALUES
    ('Available'),
    ('Accepted'),
    ('Submitted'),
    ('Approved'),
    ('Rejected'),
    ('Completed');

INSERT INTO quest_category (name, description) VALUES
    ('Delivery', 'Transport goods or messages between locations.'),
    ('Monster Hunt', 'Track down and defeat dangerous creatures.'),
    ('Escort', 'Protect an NPC on a journey.'),
    ('Collection', 'Gather materials or items.'),
    ('Puzzle', 'Solve a shrine, temple, or riddle-based challenge.');
