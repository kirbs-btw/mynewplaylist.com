SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'b25'
ORDER BY table_name, ordinal_position;