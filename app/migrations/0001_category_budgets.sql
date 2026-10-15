-- One monthly limit per user per category. No row means "no limit set".
CREATE TABLE IF NOT EXISTS category_budgets (
  user_id      TEXT    NOT NULL,
  category     TEXT    NOT NULL,
  amount_pence INTEGER NOT NULL CHECK (amount_pence > 0),
  PRIMARY KEY (user_id, category)
);
