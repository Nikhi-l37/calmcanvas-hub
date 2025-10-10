-- Fix app_id column type to handle larger ID values
ALTER TABLE app_sessions ALTER COLUMN app_id TYPE bigint;