CREATE TABLE IF NOT EXISTS slide_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  slide_id uuid REFERENCES slides(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  at timestamp with time zone NOT NULL DEFAULT now(),
  kind text NOT NULL,
  before jsonb,
  after jsonb,
  coalesce_key text,
  summary text NOT NULL
);

CREATE INDEX IF NOT EXISTS slide_edits_deck_at_idx ON slide_edits (deck_id, at);
