-- Migration: 20260421060000_shop_staff.sql
-- Description: Creates a table for staff members who use PIN-based access at the POS.

-- 1. Create the staff table
CREATE TABLE IF NOT EXISTS public.shop_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pin TEXT NOT NULL, -- Stored as text for 4-digit (e.g., '0012')
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure names are unique within a single shop
    UNIQUE(shop_id, name)
);

-- 2. Add Row Level Security (RLS)
ALTER TABLE public.shop_staff ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Managers and Owners of the shop can manage (CRUD) the staff
CREATE POLICY "managers can manage shop staff" 
ON public.shop_staff 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.memberships m 
        WHERE m.shop_id = shop_staff.shop_id 
        AND m.user_id = auth.uid()
        AND (m.role = 'owner' OR m.role = 'manager')
    )
);

-- Anyone authenticated (like a terminal) can view active staff list for their shop
-- This is needed for the PIN pad lookup
CREATE POLICY "terminal can view shop staff" 
ON public.shop_staff 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.memberships m 
        WHERE m.shop_id = shop_staff.shop_id 
        AND m.user_id = auth.uid()
    )
);

-- 4. Enable updated_at trigger
CREATE TRIGGER update_shop_staff_updated_at
    BEFORE UPDATE ON public.shop_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
