-- ArchitectBeauty — триггеры уведомлений через pg_net → Edge Function
--
-- Перед запуском этой миграции выполни в SQL Editor:
--   ALTER DATABASE postgres SET app.notify_url  = 'https://<ref>.supabase.co/functions/v1/notify';
--   ALTER DATABASE postgres SET app.notify_auth = 'Bearer <anon-key>';
--
-- Secrets в Supabase Dashboard → Settings → Edge Functions:
--   RESEND_API_KEY        — ключ из resend.com
--   APP_URL               — https://architectbeauty.ru (или твой домен)
--   (SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY добавляются автоматически)

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── Вспомогательная функция-диспетчер ────────────────────────────────────────
CREATE OR REPLACE FUNCTION _notify_edge(payload jsonb)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  _url  text := current_setting('app.notify_url',  true);
  _auth text := current_setting('app.notify_auth', true);
BEGIN
  IF _url IS NULL OR _url = '' THEN RETURN; END IF;
  PERFORM net.http_post(
    url     := _url,
    body    := payload::text,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', coalesce(_auth, '')
    )
  );
END;
$$;

-- ── Триггер: INSERT на orders (новая заявка) ─────────────────────────────────
CREATE OR REPLACE FUNCTION _trg_orders_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM _notify_edge(jsonb_build_object(
    'type',   'INSERT',
    'table',  'orders',
    'record', row_to_json(NEW)::jsonb
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify_insert ON orders;
CREATE TRIGGER orders_notify_insert
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION _trg_orders_insert();

-- ── Триггер: UPDATE на orders (смена статуса) ────────────────────────────────
CREATE OR REPLACE FUNCTION _trg_orders_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM _notify_edge(jsonb_build_object(
      'type',       'UPDATE',
      'table',      'orders',
      'record',     row_to_json(NEW)::jsonb,
      'old_record', row_to_json(OLD)::jsonb
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify_update ON orders;
CREATE TRIGGER orders_notify_update
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION _trg_orders_update();

-- ── Триггер: INSERT на responses (новый отклик) ──────────────────────────────
CREATE OR REPLACE FUNCTION _trg_responses_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM _notify_edge(jsonb_build_object(
    'type',   'INSERT',
    'table',  'responses',
    'record', row_to_json(NEW)::jsonb
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS responses_notify_insert ON responses;
CREATE TRIGGER responses_notify_insert
  AFTER INSERT ON responses
  FOR EACH ROW EXECUTE FUNCTION _trg_responses_insert();
