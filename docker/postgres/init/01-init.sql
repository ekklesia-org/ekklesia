-- Ekklesia Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database (already created by POSTGRES_DB env var)
-- CREATE DATABASE ekklesia_dev;

-- Create additional databases if needed
CREATE DATABASE ekklesia_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ekklesia_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ekklesia_test TO postgres;

-- Log the initialization
\echo 'Ekklesia databases initialized successfully!'
