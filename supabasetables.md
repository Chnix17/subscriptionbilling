-- =========================
-- CREATE ENUM
-- =========================

CREATE TYPE subscription_type_enum AS ENUM (
    'MONTHLY',
    'ANNUALLY',
    'WEEKLY'
);

-- =========================
-- TABLE: tblrole
-- =========================

CREATE TABLE tblrole (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- TABLE: tbluser
-- =========================

CREATE TABLE tbluser (
    user_id BIGSERIAL PRIMARY KEY,
    user_fullname VARCHAR(255) NOT NULL,
    user_username VARCHAR(100) NOT NULL UNIQUE,
    user_password TEXT NOT NULL,
    user_role_id BIGINT REFERENCES tblrole(role_id),
    user_is_active BOOLEAN DEFAULT TRUE,
    user_theme VARCHAR(10) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLE: tblsubscriptionname
-- =========================

CREATE TABLE tblsubscriptionname (
    subscription_id BIGSERIAL PRIMARY KEY,
    subscription_name VARCHAR(255) NOT NULL,

    subscription_added_by BIGINT REFERENCES tbluser(user_id),

    subscription_type subscription_type_enum NOT NULL,

    subscription_bill NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLE: tblsubscriptionrenew
-- =========================

CREATE TABLE tblsubscriptionrenew (
    subscription_renew_id BIGSERIAL PRIMARY KEY,

    subscription_id BIGINT REFERENCES tblsubscriptionname(subscription_id),

    subscription_renewed_at TIMESTAMP NOT NULL,

    subscription_expired_at TIMESTAMP NOT NULL,

    subscription_renewed_by BIGINT REFERENCES tbluser(user_id),

    subscription_is_cancelled BOOLEAN DEFAULT FALSE,

    months_paid_advance INTEGER DEFAULT 1,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLE: tblsubscriptionlog
-- =========================

CREATE TABLE tblsubscriptionlog (
    subscription_log_id BIGSERIAL PRIMARY KEY,

    subscription_renew_id BIGINT REFERENCES tblsubscriptionrenew(subscription_renew_id),

    subscription_total_bill NUMERIC(10,2) NOT NULL,

    subscription_action_by BIGINT REFERENCES tbluser(user_id),

    note TEXT,

    subscription_created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLE: tblsessions
-- =========================

CREATE TABLE tblsessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT REFERENCES tbluser(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLE: tblnotifications
-- =========================

CREATE TABLE tblnotifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES tbluser(user_id) ON DELETE CASCADE,
    notification_title VARCHAR(255) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'renewal', 'expiry', 'payment_due'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_subscription_added_by
ON tblsubscriptionname(subscription_added_by);

CREATE INDEX idx_subscription_renewed_by
ON tblsubscriptionrenew(subscription_renewed_by);

CREATE INDEX idx_subscription_action_by
ON tblsubscriptionlog(subscription_action_by);

CREATE INDEX idx_sessions_user_id
ON tblsessions(user_id);

CREATE INDEX idx_sessions_expires_at
ON tblsessions(expires_at);

CREATE INDEX idx_notifications_user_id
ON tblnotifications(user_id);

CREATE INDEX idx_notifications_is_read
ON tblnotifications(is_read);

-- =========================
-- SAMPLE DATA
-- =========================

INSERT INTO tblrole (role_name)
VALUES
('Admin'),
('User');