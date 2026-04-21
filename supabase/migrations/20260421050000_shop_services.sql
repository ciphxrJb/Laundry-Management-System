-- Migration: 20260421050000_shop_services.sql
-- Description: Creates a table for branch-specific laundry services and pricing.

-- 1. Create the services table
CREATE TABLE IF NOT EXISTS public.laundry_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    price_per_kg NUMERIC(12,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add Row Level Security (RLS)
ALTER TABLE public.laundry_services ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone in the shop can view the services
CREATE POLICY "members can view shop services" 
ON public.laundry_services 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.memberships m 
        WHERE m.shop_id = laundry_services.shop_id 
        AND m.user_id = auth.uid()
    )
);

-- Only owners and managers can update services
CREATE POLICY "managers can manage services" 
ON public.laundry_services 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.memberships m 
        WHERE m.shop_id = laundry_services.shop_id 
        AND m.user_id = auth.uid()
        AND (m.role = 'owner' OR m.role = 'manager')
    )
);

-- 4. Automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_laundry_services_updated_at
    BEFORE UPDATE ON public.laundry_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
