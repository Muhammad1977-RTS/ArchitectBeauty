INSERT INTO work_types (name, slug) VALUES ('Собрать мебель', 'furniture_assembly') ON CONFLICT (slug) DO NOTHING;
