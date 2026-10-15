-- Ekonos database schema. Safe to run more than once (it only creates what is missing).

CREATE TABLE IF NOT EXISTS users (
  public_id     TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  budget_pence  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL REFERENCES users(public_id) ON DELETE CASCADE,
  kind          TEXT NOT NULL DEFAULT 'expense' CHECK (kind IN ('expense', 'income')),
  brand         TEXT NOT NULL,
  amount_pence  INTEGER NOT NULL CHECK (amount_pence >= 0),
  category      TEXT NOT NULL,
  ethical_score INTEGER CHECK (ethical_score BETWEEN 0 AND 100),
  occurred_on   TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions (user_id, occurred_on);

CREATE TABLE IF NOT EXISTS category_budgets (
  user_id      TEXT NOT NULL REFERENCES users(public_id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  amount_pence INTEGER NOT NULL CHECK (amount_pence > 0),
  PRIMARY KEY (user_id, category)
);
