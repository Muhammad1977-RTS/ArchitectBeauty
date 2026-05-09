-- Required for Supabase Realtime column filters to work on non-PK columns
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Add messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
