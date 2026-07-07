-- Hyrule Quest Board schema
-- Safe to rerun: drops tables in reverse dependency order before recreating them.

DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS quest_submission CASCADE;
DROP TABLE IF EXISTS quest_assignment CASCADE;
DROP TABLE IF EXISTS quest CASCADE;
DROP TABLE IF EXISTS quest_status CASCADE;
DROP TABLE IF EXISTS quest_category CASCADE;
DROP TABLE IF EXISTS account_role CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS role CASCADE;

CREATE TABLE role (
    role_id     SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE account (
    account_id    SERIAL PRIMARY KEY,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER NOT NULL REFERENCES role (role_id) ON DELETE RESTRICT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_role_id ON account (role_id);

CREATE TABLE quest_category (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE quest_status (
    status_id SERIAL PRIMARY KEY,
    name      VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE quest (
    quest_id    SERIAL PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES quest_category (category_id) ON DELETE RESTRICT,
    difficulty  VARCHAR(50),
    reward      VARCHAR(150),
    created_by  INTEGER REFERENCES account (account_id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_category_id ON quest (category_id);
CREATE INDEX idx_quest_created_by ON quest (created_by);

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

-- Reference / lookup data (not test accounts)

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
