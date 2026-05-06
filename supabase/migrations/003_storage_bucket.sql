-- Создать публичный бакет для фотографий заявок
-- Запусти в Supabase → SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Публичное чтение
CREATE POLICY "order-photos: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-photos');

-- Загрузка — только авторизованные пользователи
CREATE POLICY "order-photos: authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-photos');

-- Удаление — только владелец (первая часть пути = user id)
CREATE POLICY "order-photos: owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'order-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
