-- Чат между клиентом и мастером в рамках конкретной заявки
-- Разговор идентифицируется по (order_id, master_id)

CREATE TABLE IF NOT EXISTS messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  master_id   uuid        NOT NULL REFERENCES auth.users(id), -- сторона мастера в разговоре
  sender_id   uuid        NOT NULL REFERENCES auth.users(id), -- кто отправил
  content     text        NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_order_master_idx ON messages (order_id, master_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Читать может клиент заявки или мастер этого разговора
CREATE POLICY "messages: read" ON messages FOR SELECT
  USING (
    master_id = auth.uid() OR
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  );

-- Писать может только участник разговора
CREATE POLICY "messages: insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      master_id = auth.uid() OR
      EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
    )
  );
