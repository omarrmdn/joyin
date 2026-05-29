-- SQL script to set up payment verification logic securely in the backend

-- 1. Add fee_paid column to events if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='events' AND column_name='fee_paid') THEN
        ALTER TABLE public.events ADD COLUMN fee_paid BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Add banned column to users if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='users' AND column_name='banned') THEN
        ALTER TABLE public.users ADD COLUMN banned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Create payments table for verification
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    screenshot_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create a backend function to check if a user is allowed to create/join events
CREATE OR REPLACE FUNCTION public.can_user_transact(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
    unpaid_count INT;
BEGIN
    -- 1. Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = user_id::uuid;
    
    -- 2. Owner exemption
    IF user_email = 'omarrmdn2024@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- 3. Check if user is explicitly banned
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND banned = TRUE) THEN
        RETURN FALSE;
    END IF;

    -- 4. Check for unpaid events (events where price > 0, fee_paid = false)
    -- If there are ANY unpaid events, block them.
    SELECT count(*) INTO unpaid_count 
    FROM public.events 
    WHERE organizer_id = user_id AND price > 0 AND (fee_paid IS NULL OR fee_paid = FALSE);

    IF unpaid_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Secure the tables with RLS (Row Level Security)
-- Note: Assuming RLS is already enabled. If not, you may need:
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow inserting events if the user has no unpaid fees
DROP POLICY IF EXISTS "Users can insert events if no unpaid fees" ON public.events;
CREATE POLICY "Users can insert events if no unpaid fees" 
ON public.events 
FOR INSERT 
WITH CHECK (
    auth.uid()::text = organizer_id 
    AND public.can_user_transact(auth.uid()::text)
);

-- Policy: Only allow joining events if the user has no unpaid fees
DROP POLICY IF EXISTS "Users can join events if no unpaid fees" ON public.attendees;
CREATE POLICY "Users can join events if no unpaid fees" 
ON public.attendees 
FOR INSERT 
WITH CHECK (
    auth.uid()::text = user_id 
    AND public.can_user_transact(auth.uid()::text)
);
