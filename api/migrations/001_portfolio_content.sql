-- Portfolio content storage migration
--
-- IMPORTANT:
-- - This migration creates ONLY the new portfolio_content table.
-- - portfolio_messages is intentionally untouched.
-- - Existing contact, messages, and live-chat APIs are not part of this migration.
--
-- The singleton row (id = 1) stores the current portfolio data in JSONB so the
-- existing data.js object structure can be preserved without introducing
-- unnecessary per-section tables.

CREATE TABLE IF NOT EXISTS portfolio_content (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
