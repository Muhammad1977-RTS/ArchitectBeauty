-- Track whether client has seen a master's response
ALTER TABLE responses ADD COLUMN IF NOT EXISTS seen_by_client boolean NOT NULL DEFAULT false;

-- Client can mark responses as seen for their own orders
CREATE POLICY "responses: client update seen" ON responses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  );
