-- Track whether client has seen a carrier's transport response
ALTER TABLE transport_responses ADD COLUMN IF NOT EXISTS seen boolean NOT NULL DEFAULT false;
