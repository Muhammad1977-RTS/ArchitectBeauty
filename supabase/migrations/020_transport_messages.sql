CREATE TABLE transport_messages (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id   text NOT NULL REFERENCES transport_orders(id) ON DELETE CASCADE,
  carrier_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    text NOT NULL,
  read_at    timestamptz,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON transport_messages(order_id, carrier_id);
