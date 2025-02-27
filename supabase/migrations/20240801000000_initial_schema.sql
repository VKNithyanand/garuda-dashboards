
-- Create tables for our analytics dashboard
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  customer_id UUID
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  dashboard_layout JSONB
);

-- Enable Row Level Security
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public sales access" ON sales
  FOR SELECT USING (true);

CREATE POLICY "Public customers access" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Public insights access" ON insights
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert some sample data
INSERT INTO customers (name, email)
VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com'),
  ('Carol Williams', 'carol@example.com'),
  ('David Miller', 'david@example.com'),
  ('Eva Brown', 'eva@example.com');

-- Get customer IDs
WITH cust AS (SELECT id FROM customers LIMIT 5)
INSERT INTO sales (amount, product_name, category, transaction_date, customer_id)
SELECT
  (random() * 1000)::DECIMAL,
  CASE floor(random() * 4)
    WHEN 0 THEN 'Laptop'
    WHEN 1 THEN 'Smartphone'
    WHEN 2 THEN 'Headphones'
    ELSE 'Monitor'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Electronics'
    WHEN 1 THEN 'Accessories'
    ELSE 'Office Equipment'
  END,
  now() - (random() * 90 || ' days')::INTERVAL,
  id
FROM cust, generate_series(1, 50);

INSERT INTO insights (title, description, category, priority)
VALUES
  ('Sales Trend Detected', 'Electronics category showing 30% growth this quarter', 'Growth', 'High'),
  ('Inventory Alert', 'Smartphones inventory running low', 'Risk', 'Medium'),
  ('Customer Retention', 'Returning customer rate improved by 15%', 'Success', 'Medium'),
  ('Market Expansion', 'New market segment identified for potential growth', 'Opportunity', 'High'),
  ('Pricing Strategy', 'Current pricing strategy underperforming in Accessories category', 'Risk', 'High');
