CREATE TABLE IF NOT EXIST exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15, 8) NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXIST api_sosurces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    api_key_required BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    last_success_at TIMESTAMP,
    last_failure_at TIMESTAMP,
    failure_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXIST idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXIST idx_exchange_rates_currencies ON exchange_rates(created_at);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source ON exchange_rates(source);
CREATE INDEX IF NOT EXISTS idx_api_sources_priority ON api_sources(priority);


-- Insert initial API source
INSERT INTO api_sources (name, base_url, priority, is_active) VALUES 
('fixer', 'https://data.fixer.io/api', 1, true),
('currencyapi', 'https://api.currencyapi.com/v3', 2, true)
ON CONFLICT (name) DO NOTHING;