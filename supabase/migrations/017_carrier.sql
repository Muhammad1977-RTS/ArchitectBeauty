-- Роль перевозчика: новые таблицы и расширение роли профиля

-- ─────────────────────────────────────────
-- 1. Добавить 'carrier' в допустимые роли
-- ─────────────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'master', 'carrier'));

-- ─────────────────────────────────────────
-- 2. Профиль перевозчика (необязательные ставки)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrier_profiles (
  carrier_id    uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type  text NOT NULL DEFAULT 'gazelle'
                  CHECK (vehicle_type IN ('car', 'minivan', 'gazelle', 'truck')),
  price_per_km  numeric(10,2),
  min_price     numeric(10,2),
  max_weight_kg numeric(10,2),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE carrier_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carrier_profiles: read by authenticated" ON carrier_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "carrier_profiles: manage own" ON carrier_profiles
  FOR ALL TO authenticated
  USING (carrier_id = auth.uid())
  WITH CHECK (carrier_id = auth.uid());

-- ─────────────────────────────────────────
-- 3. Транспортные заявки клиентов
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transport_orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_address        text NOT NULL,
  to_address          text NOT NULL,
  cargo_description   text NOT NULL,
  cargo_weight_kg     numeric(10,2),
  cargo_volume_m3     numeric(10,2),
  transport_date      date,
  budget              numeric(10,2),
  status              text NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'carrier_selected', 'completed', 'cancelled')),
  selected_carrier_id uuid REFERENCES profiles(id),
  rating              integer CHECK (rating BETWEEN 1 AND 5),
  review_text         text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transport_orders_client_id ON transport_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_transport_orders_status    ON transport_orders(status);

CREATE OR REPLACE FUNCTION update_transport_orders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transport_orders_updated_at ON transport_orders;
CREATE TRIGGER transport_orders_updated_at
  BEFORE UPDATE ON transport_orders
  FOR EACH ROW EXECUTE FUNCTION update_transport_orders_updated_at();

ALTER TABLE transport_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transport_orders: read by authenticated" ON transport_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "transport_orders: client insert" ON transport_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "transport_orders: client update own" ON transport_orders
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid());

-- ─────────────────────────────────────────
-- 4. Отклики перевозчиков
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transport_responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES transport_orders(id) ON DELETE CASCADE,
  carrier_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_price numeric(10,2) NOT NULL CHECK (proposed_price > 0),
  comment        text,
  vehicle_type   text CHECK (vehicle_type IN ('car', 'minivan', 'gazelle', 'truck')),
  status         text NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'selected', 'rejected')),
  created_at     timestamptz DEFAULT now(),
  UNIQUE(order_id, carrier_id)
);

CREATE INDEX IF NOT EXISTS idx_transport_responses_order_id   ON transport_responses(order_id);
CREATE INDEX IF NOT EXISTS idx_transport_responses_carrier_id ON transport_responses(carrier_id);

ALTER TABLE transport_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transport_responses: read by order owner or carrier" ON transport_responses
  FOR SELECT TO authenticated
  USING (
    carrier_id = auth.uid() OR
    EXISTS (SELECT 1 FROM transport_orders WHERE id = order_id AND client_id = auth.uid())
  );

CREATE POLICY "transport_responses: carrier insert" ON transport_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    carrier_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'carrier') AND
    EXISTS (SELECT 1 FROM transport_orders WHERE id = order_id AND status = 'new')
  );

CREATE POLICY "transport_responses: carrier update own" ON transport_responses
  FOR UPDATE TO authenticated
  USING (carrier_id = auth.uid());
