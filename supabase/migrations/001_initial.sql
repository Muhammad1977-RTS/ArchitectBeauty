-- ArchitectBeauty — начальная миграция
-- Запусти этот файл в Supabase → SQL Editor

-- ─────────────────────────────────────────
-- 1. Справочник видов работ
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_types (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

INSERT INTO work_types (name, slug) VALUES
  ('Укладка плитки',              'tile'),
  ('Покраска стен и потолка',     'painting'),
  ('Штукатурка',                  'plastering'),
  ('Шпаклёвка',                   'putty'),
  ('Сантехника',                  'plumbing'),
  ('Электрика',                   'electrical'),
  ('Напольные покрытия',          'flooring'),
  ('Потолки (натяжные/ГКЛ)',      'ceiling'),
  ('Кладка кирпича',              'brickwork'),
  ('Стяжка',                      'screed'),
  ('Сварочные работы',            'welding'),
  ('Общестроительные работы',     'general')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- 2. Профили (расширяет auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('client', 'master')),
  name          text NOT NULL DEFAULT '',
  phone         text,
  city_district text,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- 3. Ставки мастера (₽/м² по типу работ)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_rates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_type_id uuid NOT NULL REFERENCES work_types(id) ON DELETE CASCADE,
  rate_per_sqm numeric(10,2) NOT NULL CHECK (rate_per_sqm > 0),
  UNIQUE (master_id, work_type_id)
);

-- ─────────────────────────────────────────
-- 4. Заявки клиентов
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_type_id       uuid NOT NULL REFERENCES work_types(id),
  area_sqm           numeric(8,2) NOT NULL CHECK (area_sqm > 0),
  address            text NOT NULL,
  description        text,
  photo_urls         text[] DEFAULT '{}',
  status             text NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new', 'master_selected', 'completed')),
  selected_master_id uuid REFERENCES profiles(id),
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id    ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_work_type_id ON orders(work_type_id);

-- автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- 5. Отклики мастеров
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  master_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_price numeric(10,2) NOT NULL CHECK (proposed_price > 0),
  comment        text,
  estimated_days integer CHECK (estimated_days > 0),
  created_at     timestamptz DEFAULT now(),
  UNIQUE (order_id, master_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_order_id  ON responses(order_id);
CREATE INDEX IF NOT EXISTS idx_responses_master_id ON responses(master_id);

-- ─────────────────────────────────────────
-- 6. Row Level Security
-- ─────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses   ENABLE ROW LEVEL SECURITY;

-- work_types — публичный справочник, только чтение
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_types: public read" ON work_types
  FOR SELECT USING (true);

-- profiles
CREATE POLICY "profiles: read by authenticated" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles: insert own" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- master_rates
CREATE POLICY "master_rates: read by authenticated" ON master_rates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "master_rates: manage own" ON master_rates
  FOR ALL TO authenticated
  USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());

-- orders
CREATE POLICY "orders: read by authenticated" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "orders: client insert" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "orders: client update own" ON orders
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid());

-- responses
CREATE POLICY "responses: read by order owner or master" ON responses
  FOR SELECT TO authenticated
  USING (
    master_id = auth.uid() OR
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND client_id = auth.uid())
  );

CREATE POLICY "responses: master insert" ON responses
  FOR INSERT TO authenticated
  WITH CHECK (
    master_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master') AND
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND status = 'new')
  );
