CREATE TABLE IF NOT EXISTS "deck_collaborators" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deck_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL DEFAULT 'editor',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "deck_collaborators_deck_user_unique" UNIQUE("deck_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deck_collaborators_deck_id_decks_id_fk') THEN
    ALTER TABLE "deck_collaborators" ADD CONSTRAINT "deck_collaborators_deck_id_decks_id_fk"
      FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deck_collaborators_user_id_users_id_fk') THEN
    ALTER TABLE "deck_collaborators" ADD CONSTRAINT "deck_collaborators_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
  END IF;
END $$;
