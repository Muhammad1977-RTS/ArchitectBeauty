-- Роль строительного магазина

-- ─────────────────────────────────────────
-- 1. Добавить 'store' в допустимые роли
-- ─────────────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'master', 'carrier', 'store'));

-- ─────────────────────────────────────────
-- 2. Профиль магазина
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_profiles (
  store_id    uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  store_name  text NOT NULL DEFAULT '',
  address     text,
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_profiles_select" ON store_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "store_profiles_insert" ON store_profiles
  FOR INSERT TO authenticated WITH CHECK (store_id = auth.uid());

CREATE POLICY "store_profiles_update" ON store_profiles
  FOR UPDATE TO authenticated USING (store_id = auth.uid());

-- ─────────────────────────────────────────
-- 3. Товары магазина
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid NOT NULL REFERENCES store_profiles(store_id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  price       numeric(10,2) NOT NULL,
  unit        text NOT NULL DEFAULT 'шт',
  category    text,
  in_stock    boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "products_insert" ON products
  FOR INSERT TO authenticated WITH CHECK (store_id = auth.uid());

CREATE POLICY "products_update" ON products
  FOR UPDATE TO authenticated USING (store_id = auth.uid());

CREATE POLICY "products_delete" ON products
  FOR DELETE TO authenticated USING (store_id = auth.uid());

CREATE INDEX IF NOT EXISTS products_store_id_idx ON products(store_id);
