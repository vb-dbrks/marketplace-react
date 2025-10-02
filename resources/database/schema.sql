-- =====================================================
-- Data Products Table Schema Migration Script
-- =====================================================
-- This script contains all the SQL commands needed to update
-- the data_products table schema with the latest changes.

-- 1. Rename business_function column to sub_domain
-- =====================================================
DO $$
BEGIN
    -- Check if business_function column exists and sub_domain doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'data_products' 
        AND column_name = 'business_function'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'data_products' 
        AND column_name = 'sub_domain'
    ) THEN
        -- Rename the column
        ALTER TABLE public.data_products 
        RENAME COLUMN business_function TO sub_domain;
        
        RAISE NOTICE 'Successfully renamed business_function to sub_domain';
    ELSE
        RAISE NOTICE 'Column business_function does not exist or sub_domain already exists';
    END IF;
END $$;

-- 2. Add qlik_url column if it doesn't exist
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'data_products' 
        AND column_name = 'qlik_url'
    ) THEN
        ALTER TABLE public.data_products 
        ADD COLUMN qlik_url TEXT DEFAULT '';
        
        RAISE NOTICE 'Added qlik_url column';
    ELSE
        RAISE NOTICE 'qlik_url column already exists';
    END IF;
END $$;

-- 3. Add data_contract_url column if it doesn't exist
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'data_products' 
        AND column_name = 'data_contract_url'
    ) THEN
        ALTER TABLE public.data_products 
        ADD COLUMN data_contract_url TEXT DEFAULT '';
        
        RAISE NOTICE 'Added data_contract_url column';
    ELSE
        RAISE NOTICE 'data_contract_url column already exists';
    END IF;
END $$;

-- 4. Update existing IDs to new format (DP0001, DP0002, etc.)
-- =====================================================
-- WARNING: This will change existing IDs! Only run if you want to standardize ID format.
-- Uncomment the following block if you want to update existing IDs:

/*
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    -- Update existing IDs to new format
    FOR rec IN 
        SELECT id FROM public.data_products 
        WHERE id NOT LIKE 'DP____' OR LENGTH(id) != 6
        ORDER BY created_at ASC
    LOOP
        UPDATE public.data_products 
        SET id = 'DP' || LPAD(counter::text, 4, '0')
        WHERE id = rec.id;
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % product IDs to new format', counter - 1;
END $$;
*/

-- 5. Verify schema changes
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'data_products'
ORDER BY ordinal_position;

-- 6. Show current data sample
-- =====================================================
SELECT 
    id,
    name,
    sub_domain,
    qlik_url,
    data_contract_url,
    created_at
FROM public.data_products 
ORDER BY created_at DESC 
LIMIT 5;
