INSERT INTO work_types (name, slug) VALUES ('Другое', 'other') ON CONFLICT (slug) DO NOTHING;
