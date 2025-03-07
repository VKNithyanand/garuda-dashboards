
-- Add created_by column to customers table if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing rows to have a sensible default if needed
-- This is only needed during migration of existing data
-- UPDATE customers SET created_by = (SELECT id FROM auth.users LIMIT 1) WHERE created_by IS NULL;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Public customers access" ON customers;

-- Create new RLS policies
-- Allow users to view customers they created
CREATE POLICY "Users can view their own customers" 
ON customers FOR SELECT 
USING (auth.uid() = created_by OR created_by IS NULL);

-- Allow users to insert customers with their user ID
CREATE POLICY "Users can create their own customers" 
ON customers FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Allow users to update customers they created
CREATE POLICY "Users can update their own customers" 
ON customers FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete customers they created
CREATE POLICY "Users can delete their own customers" 
ON customers FOR DELETE 
USING (auth.uid() = created_by);
