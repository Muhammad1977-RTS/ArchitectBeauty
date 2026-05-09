-- Track whether client has read messages from master
ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_read boolean NOT NULL DEFAULT false;

-- Client can mark messages as read in their own orders
CREATE POLICY "messages: client mark read" ON messages FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  );
