ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS messages_unread_master_idx ON messages (master_id, is_read) WHERE NOT is_read;

-- Master can mark messages in their conversations as read
CREATE POLICY "messages: update read" ON messages FOR UPDATE
  USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());
