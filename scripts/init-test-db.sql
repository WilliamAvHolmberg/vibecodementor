-- Initialize test database for integration tests
CREATE DATABASE api_test;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE api_test TO postgres; 