-- Рейтинг мастера: колонки на таблице orders + вью master_stats

ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating     smallint CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_text text;

-- Публичная статистика мастеров (средняя оценка, кол-во отзывов)
CREATE OR REPLACE VIEW master_stats AS
SELECT
  selected_master_id            AS master_id,
  COUNT(*)::int                 AS reviews_count,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating
FROM orders
WHERE status = 'completed'
  AND selected_master_id IS NOT NULL
  AND rating IS NOT NULL
GROUP BY selected_master_id;

GRANT SELECT ON master_stats TO anon, authenticated;
