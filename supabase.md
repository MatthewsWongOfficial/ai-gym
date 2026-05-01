# Supabase SQL Queries and Schemas

This file contains all SQL queries, schema definitions, migrations, and policies for the AIGymBro application. Copy and paste these into your Supabase SQL Editor.

---

## Table Creation

### 1. Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 2. Workouts Table

```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own workouts
CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX workouts_user_id_idx ON workouts(user_id);
```

---

### 3. Meals Table

```sql
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own meals
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meals
CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meals
CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own meals
CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX meals_user_id_idx ON meals(user_id);
```

---

### 4. Progress Logs Table

```sql
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress logs
CREATE POLICY "Users can view own progress_logs"
  ON progress_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress logs
CREATE POLICY "Users can insert own progress_logs"
  ON progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress logs
CREATE POLICY "Users can update own progress_logs"
  ON progress_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own progress logs
CREATE POLICY "Users can delete own progress_logs"
  ON progress_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX progress_logs_user_id_idx ON progress_logs(user_id);
CREATE INDEX progress_logs_date_idx ON progress_logs(date);
```

---

## Example Queries

### Get all workouts for current user
```sql
SELECT * FROM workouts
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get total calories for today
```sql
SELECT COALESCE(SUM(calories), 0) as total_calories
FROM meals
WHERE user_id = auth.uid()
AND DATE(created_at) = CURRENT_DATE;
```

### Get weight trend (last 30 days)
```sql
SELECT date, weight
FROM progress_logs
WHERE user_id = auth.uid()
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date ASC;
```

### Get average weight for the month
```sql
SELECT AVG(weight) as avg_weight
FROM progress_logs
WHERE user_id = auth.uid()
AND date >= DATE_TRUNC('month', CURRENT_DATE);
```

---

## Seed Data (Optional)

```sql
-- Note: Replace 'YOUR_USER_ID' with an actual user UUID after signup

-- Sample workouts
INSERT INTO workouts (user_id, name, description) VALUES
('YOUR_USER_ID', 'Upper Body Day', 'Chest, shoulders, and triceps workout'),
('YOUR_USER_ID', 'Lower Body Day', 'Legs and glutes focused workout'),
('YOUR_USER_ID', 'Full Body HIIT', 'High intensity interval training');

-- Sample meals
INSERT INTO meals (user_id, title, calories) VALUES
('YOUR_USER_ID', 'Grilled Chicken Salad', 450),
('YOUR_USER_ID', 'Protein Smoothie', 320),
('YOUR_USER_ID', 'Oatmeal with Berries', 380);

-- Sample progress logs
INSERT INTO progress_logs (user_id, date, weight, notes) VALUES
('YOUR_USER_ID', CURRENT_DATE - 7, 75.5, 'Starting weight'),
('YOUR_USER_ID', CURRENT_DATE - 3, 75.2, 'Feeling good'),
('YOUR_USER_ID', CURRENT_DATE, 74.8, 'Progress!');
```

---

### 5. Saved Plans Table (AI Generated Plans)

```sql
CREATE TABLE saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'meal')),
  plan_data JSONB NOT NULL,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own saved_plans"
  ON saved_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved_plans"
  ON saved_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved_plans"
  ON saved_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX saved_plans_user_id_idx ON saved_plans(user_id);
CREATE INDEX saved_plans_type_idx ON saved_plans(plan_type);
CREATE INDEX saved_plans_date_idx ON saved_plans(plan_date);
```

---

### 6. Plan Items Table (Individual items from plans)

```sql
CREATE TABLE plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES saved_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'exercise', 'meal', 'snack'
  item_name TEXT NOT NULL,
  item_data JSONB,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT, -- e.g., '07:00', '12:00'
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plan_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own plan_items"
  ON plan_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan_items"
  ON plan_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan_items"
  ON plan_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plan_items"
  ON plan_items FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX plan_items_user_id_idx ON plan_items(user_id);
CREATE INDEX plan_items_plan_id_idx ON plan_items(plan_id);
CREATE INDEX plan_items_date_idx ON plan_items(scheduled_date);
```

---

### 7. Plan Feedback Table (User feedback on missed items)

```sql
CREATE TABLE plan_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_item_id UUID REFERENCES plan_items(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES saved_plans(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('skipped', 'modified', 'suggestion')),
  reason TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plan_feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own plan_feedback"
  ON plan_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan_feedback"
  ON plan_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX plan_feedback_user_id_idx ON plan_feedback(user_id);
CREATE INDEX plan_feedback_item_id_idx ON plan_feedback(plan_item_id);
```

---

## Example Queries for Plans

### Get user's active workout plan
```sql
SELECT * FROM saved_plans
WHERE user_id = auth.uid()
AND plan_type = 'workout'
ORDER BY created_at DESC
LIMIT 1;
```

### Get today's plan items
```sql
SELECT * FROM plan_items
WHERE user_id = auth.uid()
AND scheduled_date = CURRENT_DATE
ORDER BY scheduled_time ASC;
```

### Get completion rate for current week
```sql
SELECT 
  COUNT(*) FILTER (WHERE is_completed = true) as completed,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE is_completed = true) * 100.0 / NULLIF(COUNT(*), 0), 1) as completion_rate
FROM plan_items
WHERE user_id = auth.uid()
AND scheduled_date >= DATE_TRUNC('week', CURRENT_DATE)
AND scheduled_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days';
```

---

## Notes

- Always enable Row Level Security (RLS) on tables containing user data
- Every record must contain a `user_id` that references `auth.users(id)`
- Use `auth.uid()` in policies to get the current authenticated user's ID
- Run these queries in the Supabase SQL Editor

---

## Google OAuth Setup

To enable Google Sign-In:

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### 2. Supabase Dashboard Setup

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and enable it
4. Paste your **Client ID** and **Client Secret**
5. Save changes

### 3. Site URL Configuration

1. In Supabase, go to "Authentication" > "URL Configuration"
2. Set **Site URL** to your production URL (e.g., `https://aigymbro.web.id`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://aigymbro.web.id/auth/callback` (for production)

### 4. Test the Integration

After setup, users can click "Continue with Google" on the login/signup pages to authenticate via Google OAuth.

---

## Forum Tables

### 1. Forum Categories Table

```sql
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT 'teal',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view categories (public)
CREATE POLICY "Categories are viewable by everyone"
  ON forum_categories FOR SELECT
  USING (true);

-- Insert default categories
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
  ('General Discussion', 'general', 'Chat about anything fitness related', 'MessageCircle', 'teal', 1),
  ('Workout Tips', 'workout-tips', 'Share and ask for workout advice', 'Dumbbell', 'emerald', 2),
  ('Nutrition & Diet', 'nutrition', 'Discuss meal plans, recipes, and nutrition', 'Utensils', 'amber', 3),
  ('Progress & Motivation', 'progress', 'Share your fitness journey and motivate others', 'TrendingUp', 'rose', 4),
  ('Questions & Help', 'questions', 'Ask questions and get help from the community', 'HelpCircle', 'blue', 5);
```

### 2. Forum Threads Table

```sql
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view threads (public for SEO)
CREATE POLICY "Threads are viewable by everyone"
  ON forum_threads FOR SELECT
  USING (true);

-- Policy: Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own threads
CREATE POLICY "Users can update own threads"
  ON forum_threads FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own threads
CREATE POLICY "Users can delete own threads"
  ON forum_threads FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX idx_forum_threads_created ON forum_threads(created_at DESC);
```

### 3. Forum Replies Table

```sql
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view replies (public)
CREATE POLICY "Replies are viewable by everyone"
  ON forum_replies FOR SELECT
  USING (true);

-- Policy: Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own replies
CREATE POLICY "Users can update own replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own replies
CREATE POLICY "Users can delete own replies"
  ON forum_replies FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at);
```

### 4. Forum User Profiles (Extended)

```sql
-- Add username and avatar to profiles for forum display
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Function to generate username from email
CREATE OR REPLACE FUNCTION generate_username(email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(SPLIT_PART(email, '@', 1)) || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 4);
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles without username
UPDATE profiles SET username = generate_username(email) WHERE username IS NULL;
```

### 5. View for Thread List with Author Info

```sql
CREATE OR REPLACE VIEW forum_threads_with_author AS
SELECT 
  t.*,
  COALESCE(p.username, 'Deleted User') as author_username,
  p.avatar_url as author_avatar,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color,
  (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.id) as reply_count,
  (SELECT MAX(created_at) FROM forum_replies r WHERE r.thread_id = t.id) as last_reply_at
FROM forum_threads t
LEFT JOIN profiles p ON t.user_id = p.id
LEFT JOIN forum_categories c ON t.category_id = c.id;
```

### 6. View for Replies with Author Info

```sql
CREATE OR REPLACE VIEW forum_replies_with_author AS
SELECT 
  r.*,
  COALESCE(p.username, 'Deleted User') as author_username,
  p.avatar_url as author_avatar
FROM forum_replies r
LEFT JOIN profiles p ON r.user_id = p.id;
```

### 7. Function to Increment Thread Views

```sql
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads SET views = views + 1 WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Admin System

### 1. Super Admin Table

```sql
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can view admin list
CREATE POLICY "Super admins can view admin list"
  ON super_admins FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM super_admins WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Add Your First Super Admin

```sql
-- Replace 'YOUR_USER_ID' with the actual UUID of the admin user
-- You can find this in auth.users table or from Supabase Auth dashboard
INSERT INTO super_admins (user_id) VALUES ('YOUR_USER_ID');
```

### 3. Announcements Category (Admin Only)

```sql
-- Insert the announcements category
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Official Announcements', 'announcements', 'Official updates and news from AI GymBro team', 'Megaphone', 'violet', 0);

-- Add is_admin_only column to categories
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS is_admin_only BOOLEAN DEFAULT false;

-- Mark announcements as admin only
UPDATE forum_categories SET is_admin_only = true WHERE slug = 'announcements';
```

### 4. Admin Data Access Policies

```sql
-- Policy: Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy: Super admins can update all profiles (e.g., set usernames)
CREATE POLICY "Super admins can update all profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy: Super admins can view all saved_plans
CREATE POLICY "Super admins can view all saved_plans"
  ON saved_plans FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM super_admins));
```

### 5. Admin Thread Policies

```sql
-- Policy: Super admins can delete any thread
CREATE POLICY "Super admins can delete any thread"
  ON forum_threads FOR DELETE
  USING (is_super_admin(auth.uid()));

-- Policy: Super admins can update any thread (pin, lock, etc.)
CREATE POLICY "Super admins can update any thread"
  ON forum_threads FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Policy: Super admins can delete any reply
CREATE POLICY "Super admins can delete any reply"
  ON forum_replies FOR DELETE
  USING (is_super_admin(auth.uid()));
```

---

## Performance Indexes

Add these indexes to improve query performance:

```sql
-- Index for faster saved_plans queries (dashboard loading)
CREATE INDEX IF NOT EXISTS idx_saved_plans_user_type 
  ON saved_plans(user_id, plan_type, created_at DESC);

-- Index for forum threads listing
CREATE INDEX IF NOT EXISTS idx_forum_threads_category 
  ON forum_threads(category_id, is_pinned DESC, created_at DESC);

-- Index for forum replies
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread 
  ON forum_replies(thread_id, created_at ASC);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
  ON profiles(username) WHERE username IS NOT NULL;
```

---

## Leaderboard System

### 1. Meal Plan Completions Table

```sql
CREATE TABLE meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES saved_plans(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approved completions or their own
CREATE POLICY "Completions are viewable by everyone"
  ON meal_completions FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- Policy: Super admins can view ALL completions (for approval)
CREATE POLICY "Super admins can view all completions"
  ON meal_completions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy: Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON meal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own completions
CREATE POLICY "Users can delete own completions"
  ON meal_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for leaderboard queries
CREATE INDEX idx_meal_completions_user ON meal_completions(user_id);
CREATE INDEX idx_meal_completions_date ON meal_completions(completed_at DESC);

-- Policy for admins to update completions (approve)
CREATE POLICY "Super admins can update completions"
  ON meal_completions FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy for admins to delete any completion
CREATE POLICY "Super admins can delete any completion"
  ON meal_completions FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM super_admins));
```

### 2. Leaderboard View (counts both meals and transformations)

```sql
CREATE OR REPLACE VIEW leaderboard AS
WITH all_completions AS (
  -- Meal completions
  SELECT user_id, completed_at as completion_date
  FROM meal_completions
  WHERE is_approved = true
  
  UNION ALL
  
  -- Workout transformations
  SELECT user_id, created_at as completion_date
  FROM workout_transformations
  WHERE is_approved = true
)
SELECT 
  p.id as user_id,
  COALESCE(p.username, SPLIT_PART(p.email, '@', 1)) as username,
  p.avatar_url,
  COUNT(ac.completion_date) as completion_count,
  MAX(ac.completion_date) as last_completion
FROM profiles p
INNER JOIN all_completions ac ON p.id = ac.user_id
GROUP BY p.id, p.username, p.email, p.avatar_url
ORDER BY completion_count DESC, last_completion DESC;
```

### 3. View for Completions with Author Info

```sql
CREATE OR REPLACE VIEW meal_completions_with_author AS
SELECT 
  mc.*,
  COALESCE(p.username, SPLIT_PART(p.email, '@', 1), 'User') as author_username,
  p.avatar_url as author_avatar
FROM meal_completions mc
LEFT JOIN profiles p ON mc.user_id = p.id;
```

### 4. Workout Transformations Table

```sql
CREATE TABLE workout_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_photo_url TEXT NOT NULL,
  after_photo_url TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workout_transformations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved transformations or their own
CREATE POLICY "Approved transformations are viewable by everyone"
  ON workout_transformations FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- Policy: Super admins can view ALL transformations (for approval)
CREATE POLICY "Super admins can view all transformations"
  ON workout_transformations FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy: Users can insert their own transformations
CREATE POLICY "Users can insert own transformations"
  ON workout_transformations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own transformations
CREATE POLICY "Users can delete own transformations"
  ON workout_transformations FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Super admins can update transformations (approve)
CREATE POLICY "Super admins can update transformations"
  ON workout_transformations FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Policy: Super admins can delete any transformation
CREATE POLICY "Super admins can delete any transformation"
  ON workout_transformations FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Index
CREATE INDEX idx_workout_transformations_user ON workout_transformations(user_id);
CREATE INDEX idx_workout_transformations_approved ON workout_transformations(is_approved, created_at DESC);
```

### 5. View for Transformations with Author Info

```sql
CREATE OR REPLACE VIEW workout_transformations_with_author AS
SELECT 
  wt.*,
  COALESCE(p.username, SPLIT_PART(p.email, '@', 1), 'User') as author_username,
  p.avatar_url as author_avatar
FROM workout_transformations wt
LEFT JOIN profiles p ON wt.user_id = p.id;
```

### 6. Storage Bucket for Meal Photos

In Supabase Dashboard:
1. Go to Storage
2. Create a new bucket called `meal-photos`
3. Set it to Public (so photos can be displayed)
4. Add these policies:

```sql
-- Allow authenticated users to upload to meal-photos bucket
CREATE POLICY "Users can upload meal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meal-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to meal photos
CREATE POLICY "Public read access for meal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own meal photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meal-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 7. Storage Bucket for Transformation Photos

In Supabase Dashboard:
1. Go to Storage
2. Create a new bucket called `transformation-photos`
3. Set it to Public (so photos can be displayed)
4. Add these policies:

```sql
-- Allow authenticated users to upload to transformation-photos bucket
CREATE POLICY "Users can upload transformation photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transformation-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to transformation photos
CREATE POLICY "Public read access for transformation photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'transformation-photos');

-- Allow users to delete their own transformation photos
CREATE POLICY "Users can delete own transformation photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'transformation-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### 8. Blogs Table

```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'fitness',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  author TEXT DEFAULT 'Matthews Wong',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add author column:
-- ALTER TABLE blogs ADD COLUMN author TEXT DEFAULT 'Matthews Wong';

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published blogs
CREATE POLICY "Public can view published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

-- Policy: Service role can insert blogs (for edge function)
CREATE POLICY "Service role can insert blogs"
  ON blogs FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can update blogs
CREATE POLICY "Service role can update blogs"
  ON blogs FOR UPDATE
  USING (true);

-- Index for faster queries
CREATE INDEX blogs_slug_idx ON blogs(slug);
CREATE INDEX blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX blogs_category_idx ON blogs(category);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || TO_CHAR(NOW(), 'YYYYMMDD');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_slug_trigger
  BEFORE INSERT ON blogs
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_blog_slug();
```

---

### 9. Supabase Edge Function for Daily Blog Generation

Create a new Edge Function in your Supabase project:

**File: supabase/functions/generate-daily-blog/index.ts**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FITNESS_TOPICS = [
  "Best compound exercises for building muscle mass",
  "How to break through a weight loss plateau",
  "The science behind protein timing for muscle growth",
  "HIIT vs steady-state cardio: Which is better for fat loss",
  "Top 10 mobility exercises for better workout performance",
  "How to properly warm up before lifting weights",
  "The benefits of progressive overload in strength training",
  "Nutrition tips for muscle recovery after intense workouts",
  "How to build a home gym on a budget",
  "The importance of sleep for muscle growth and recovery",
  "Best exercises for building a stronger core",
  "How to track macros for optimal body composition",
  "The role of creatine in athletic performance",
  "Effective stretching routines for flexibility",
  "How to prevent common gym injuries",
  "Building mental toughness for fitness success",
  "The benefits of resistance training for weight loss",
  "How to stay motivated on your fitness journey",
  "Understanding muscle soreness and recovery",
  "Best pre-workout nutrition strategies",
  "Post-workout meal ideas for muscle growth",
  "How to balance cardio and strength training",
  "The science of fat loss explained simply",
  "Bodyweight exercises for a full-body workout",
  "How to improve your squat form",
  "The benefits of morning workouts",
  "Hydration tips for optimal performance",
  "How to build bigger arms naturally",
  "The importance of rest days in training",
  "Meal prep tips for busy fitness enthusiasts"
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Pick a random topic
    const topic = FITNESS_TOPICS[Math.floor(Math.random() * FITNESS_TOPICS.length)]

    // Generate blog content using Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness blogger. Write engaging, informative blog posts about fitness, nutrition, and health. Use a friendly, motivational tone. Include practical tips and scientific backing where appropriate.'
          },
          {
            role: 'user',
            content: `Write a comprehensive blog post about: "${topic}"

Return your response as a JSON object with this exact structure:
{
  "title": "Catchy blog title",
  "excerpt": "A compelling 1-2 sentence summary (max 200 characters)",
  "content": "Full blog content in markdown format with headings (##), bullet points, and paragraphs. Make it 800-1200 words.",
  "category": "one of: fitness, nutrition, recovery, mindset, workout",
  "tags": ["tag1", "tag2", "tag3"],
  "read_time": estimated minutes to read (number)
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      }),
    })

    const groqData = await groqResponse.json()
    const blogData = JSON.parse(groqData.choices[0].message.content)

    // Insert blog into database
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        category: blogData.category || 'fitness',
        tags: blogData.tags || [],
        read_time: blogData.read_time || 5,
        is_published: true,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, blog: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Deploy the Edge Function:**
```bash
supabase functions deploy generate-daily-blog --no-verify-jwt
```

**Set up secrets:**
```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key
```

**Set up daily cron job in Supabase Dashboard:**
1. Go to Database > Extensions > Enable `pg_cron`
2. Go to SQL Editor and run:

```sql
-- Schedule daily blog generation at 8 AM UTC
SELECT cron.schedule(
  'daily-blog-generation',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/generate-daily-blog',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## API Cache Table

This table is used to cache AI-generated responses to reduce API costs and improve response times.

```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  response JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

-- Enable RLS (optional - can be disabled for server-only access)
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations from service role (server-side only)
CREATE POLICY "Service role full access"
  ON api_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup expired cache entries (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule cleanup with pg_cron
-- SELECT cron.schedule('cleanup-cache', '0 0 * * *', 'SELECT cleanup_expired_cache()');
```

---

## User Usage Tracking Tables

These tables track plan generation usage for both authenticated and anonymous users.

```sql
-- Authenticated user usage tracking
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_count INTEGER DEFAULT 0,
  meal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- Index for faster lookups
CREATE INDEX idx_user_usage_user_date ON user_usage(user_id, usage_date);

-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Anonymous user usage tracking (by IP)
CREATE TABLE anonymous_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_anonymous_usage_identifier ON anonymous_usage(identifier);

-- Allow all operations (server-side only via service role)
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on anonymous_usage"
  ON anonymous_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup old anonymous usage (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM anonymous_usage WHERE created_at < NOW() - INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup with pg_cron
-- SELECT cron.schedule('cleanup-anonymous-usage', '0 1 * * *', 'SELECT cleanup_old_anonymous_usage()');
```

---

## Blog Cleanup: Remove Duplicate Posts

### Find Duplicates (Preview before deleting)

```sql
-- Shows duplicate groups with count and date range
SELECT 
  REGEXP_REPLACE(slug, '-[0-9]{8}$', '') as base_slug,
  COUNT(*) as duplicate_count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest,
  ARRAY_AGG(slug ORDER BY created_at DESC) as all_slugs
FROM blogs
WHERE is_published = true
GROUP BY base_slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
```

### Delete Duplicates (Keep newest per topic)

```sql
-- Step 1: Preview what will be deleted
WITH ranked AS (
  SELECT 
    id,
    slug,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY REGEXP_REPLACE(slug, '-[0-9]{8}$', '') 
      ORDER BY created_at DESC
    ) as rn
  FROM blogs
  WHERE is_published = true
)
SELECT slug, title, created_at
FROM ranked
WHERE rn > 1
ORDER BY created_at DESC;

-- Step 2: Delete (uncomment to run)
-- WITH ranked AS (
--   SELECT 
--     id,
--     ROW_NUMBER() OVER (
--       PARTITION BY REGEXP_REPLACE(slug, '-[0-9]{8}$', '') 
--       ORDER BY created_at DESC
--     ) as rn
--   FROM blogs
--   WHERE is_published = true
-- )
-- UPDATE blogs SET is_published = false
-- WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
```

### Fix read_time Based on Actual Word Count

```sql
-- Update read_time to match actual content length (avg 200 words/min)
UPDATE blogs 
SET read_time = GREATEST(1, CEIL(LENGTH(content) - LENGTH(REPLACE(content, ' ', ''))) / 200)
WHERE is_published = true
AND ABS(read_time - CEIL(LENGTH(content) - LENGTH(REPLACE(content, ' ', ''))) / 200) > 2;
```

---

## Forum Seed Data: 15 Threads with Replies

Run this in Supabase SQL Editor to populate the forum with realistic content.

```sql
-- Step 1: Create 15 test users in auth.users
-- NOTE: Run this with service role (SQL Editor uses service role by default)

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'ironmike@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"ironmike"}', NOW() - INTERVAL '60 days', NOW()),
('a1000000-0000-0000-0000-000000000002', 'sarahfitlife@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"sarahfitlife"}', NOW() - INTERVAL '55 days', NOW()),
('a1000000-0000-0000-0000-000000000003', 'gainzbro@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"gainzbro"}', NOW() - INTERVAL '50 days', NOW()),
('a1000000-0000-0000-0000-000000000004', 'nutritionqueen@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"nutritionqueen"}', NOW() - INTERVAL '48 days', NOW()),
('a1000000-0000-0000-0000-000000000005', 'deadliftking@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"deadliftking"}', NOW() - INTERVAL '45 days', NOW()),
('a1000000-0000-0000-0000-000000000006', 'yogaflow@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"yogaflow"}', NOW() - INTERVAL '42 days', NOW()),
('a1000000-0000-0000-0000-000000000007', 'cardioqueen@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"cardioqueen"}', NOW() - INTERVAL '40 days', NOW()),
('a1000000-0000-0000-0000-000000000008', 'swolepatrol@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"swolepatrol"}', NOW() - INTERVAL '38 days', NOW()),
('a1000000-0000-0000-0000-000000000009', 'flexzone@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"flexzone"}', NOW() - INTERVAL '35 days', NOW()),
('a1000000-0000-0000-0000-000000000010', 'legdaylarry@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"legdaylarry"}', NOW() - INTERVAL '33 days', NOW()),
('a1000000-0000-0000-0000-000000000011', 'proteinpower@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"proteinpower"}', NOW() - INTERVAL '30 days', NOW()),
('a1000000-0000-0000-0000-000000000012', 'hiitmaster@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"hiitmaster"}', NOW() - INTERVAL '28 days', NOW()),
('a1000000-0000-0000-0000-000000000013', 'plankpro@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"plankpro"}', NOW() - INTERVAL '25 days', NOW()),
('a1000000-0000-0000-0000-000000000014', 'restday@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"restday"}', NOW() - INTERVAL '22 days', NOW()),
('a1000000-0000-0000-0000-000000000015', 'benchbro@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"benchbro"}', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profiles for test users
INSERT INTO public.profiles (id, email, username, bio, created_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'ironmike@gmail.com', 'ironmike', 'Been lifting for 10 years. Powerlifting focused.', NOW() - INTERVAL '60 days'),
('a1000000-0000-0000-0000-000000000002', 'sarahfitlife@gmail.com', 'sarahfitlife', 'Certified personal trainer and nutrition coach.', NOW() - INTERVAL '55 days'),
('a1000000-0000-0000-0000-000000000003', 'gainzbro@gmail.com', 'gainzbro', 'Just here for the gains. Bodybuilding enthusiast.', NOW() - INTERVAL '50 days'),
('a1000000-0000-0000-0000-000000000004', 'nutritionqueen@gmail.com', 'nutritionqueen', 'Registered dietitian. Ask me about macros!', NOW() - INTERVAL '48 days'),
('a1000000-0000-0000-0000-000000000005', 'deadliftking@gmail.com', 'deadliftking', 'Conventional pull 500lbs. Chasing 600.', NOW() - INTERVAL '45 days'),
('a1000000-0000-0000-0000-000000000006', 'yogaflow@gmail.com', 'yogaflow', 'Yoga teacher and weightlifter. Balance is key.', NOW() - INTERVAL '42 days'),
('a1000000-0000-0000-0000-000000000007', 'cardioqueen@gmail.com', 'cardioqueen', 'Marathon runner turned gym rat. Cardio + weights.', NOW() - INTERVAL '40 days'),
('a1000000-0000-0000-0000-000000000008', 'swolepatrol@gmail.com', 'swolepatrol', 'Gym bro since day one. PPL is life.', NOW() - INTERVAL '38 days'),
('a1000000-0000-0000-0000-000000000009', 'flexzone@gmail.com', 'flexzone', 'Calisthenics and street workout athlete.', NOW() - INTERVAL '35 days'),
('a1000000-0000-0000-0000-000000000010', 'legdaylarry@gmail.com', 'legdaylarry', 'Never skip leg day. Squat is king.', NOW() - INTERVAL '33 days'),
('a1000000-0000-0000-0000-000000000011', 'proteinpower@gmail.com', 'proteinpower', 'Meal prep guru. High protein everything.', NOW() - INTERVAL '30 days'),
('a1000000-0000-0000-0000-000000000012', 'hiitmaster@gmail.com', 'hiitmaster', 'HIIT coach. Short intense workouts are the way.', NOW() - INTERVAL '28 days'),
('a1000000-0000-0000-0000-000000000013', 'plankpro@gmail.com', 'plankpro', 'Core strength fanatic. 5 min plank club.', NOW() - INTERVAL '25 days'),
('a1000000-0000-0000-0000-000000000014', 'restday@gmail.com', 'restday', 'Recovery is underrated. Rest day advocate.', NOW() - INTERVAL '22 days'),
('a1000000-0000-0000-0000-000000000015', 'benchbro@gmail.com', 'benchbro', 'Bench press specialist. Chest day every day.', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create 15 forum threads
-- Get category IDs first, then insert threads

WITH categories AS (
  SELECT id, slug FROM forum_categories
),
thread_data AS (
  SELECT * FROM (VALUES
    ('general', 'what-gym-etiquette-rules-do-you-wish-everyone-followed', 'What gym etiquette rules do you wish everyone followed?', 'I have been going to the gym for years and the lack of basic etiquette still surprises me. From re-racking weights to wiping down benches, what rules do you think everyone should follow? Share your biggest gym etiquette pet peeves!', 'a1000000-0000-0000-0000-000000000001'),
    ('workout-tips', 'best-compound-exercises-for-beginners', 'Best compound exercises for beginners?', 'I am just starting out and want to focus on compound movements. I have been doing squats, bench press, and deadlifts. Are there any other must-do compounds I should add to my routine? Looking for a solid foundation.', 'a1000000-0000-0000-0000-000000000002'),
    ('nutrition', 'how-much-protein-do-you-really-need-per-day', 'How much protein do you really need per day?', 'There is so much conflicting info about protein intake. Some say 1g per pound, others say 0.7g is enough. What has worked best for you? I am trying to build muscle and currently eating around 150g at 180lbs bodyweight.', 'a1000000-0000-0000-0000-000000000003'),
    ('progress', 'my-6-month-transformation-journey', 'My 6 month transformation journey', 'Started at 220lbs with no gym experience. Now at 185lbs and hitting PRs every month. Here is what worked for me: consistent PPL split, tracking calories, and sleeping 8 hours. Happy to answer any questions!', 'a1000000-0000-0000-0000-000000000004'),
    ('questions', 'why-do-my-knees-hurt-during-squats', 'Why do my knees hurt during squats?', 'I have been squatting for about 3 months and started getting knee pain on the inside of my knee. Form check videos look okay. Is this a mobility issue? Should I see a physio? Anyone else dealt with this?', 'a1000000-0000-0000-0000-000000000005'),
    ('general', 'morning-workout-vs-evening-workout-which-is-better', 'Morning workout vs evening workout - which is better?', 'I have been trying to switch to morning workouts but I feel so weak compared to my evening sessions. Is there a real performance difference or is it just about getting used to it? What works best for you?', 'a1000000-0000-0000-0000-000000000006'),
    ('workout-tips', 'push-pull-legs-vs-upper-lower-split', 'Push Pull Legs vs Upper Lower split?', 'Currently doing PPL 6 days a week but I am thinking about switching to Upper Lower 4 days to have more recovery time. Has anyone made this switch? Did you notice any difference in gains?', 'a1000000-0000-0000-0000-000000000007'),
    ('nutrition', 'best-pre-workout-meal-ideas', 'Best pre-workout meal ideas?', 'I usually train after work around 6pm. Looking for good pre-workout meal ideas that give energy without feeling heavy. Currently eating rice and chicken about 90 min before. Any better options?', 'a1000000-0000-0000-0000-000000000008'),
    ('progress', 'finally-hit-a-3-plate-deadlift', 'Finally hit a 3 plate deadlift!', 'After 8 months of consistent training I finally pulled 315lbs! It was my goal since I started. Next target: 405lbs. For anyone struggling with deadlift, the biggest game changer for me was learning to brace properly.', 'a1000000-0000-0000-0000-000000000009'),
    ('questions', 'is-creatine-safe-for-long-term-use', 'Is creatine safe for long term use?', 'I have been taking creatine for about a month and seeing good results. But my mom keeps sending me articles about kidney damage. Should I be worried? What does the science actually say about long term creatine use?', 'a1000000-0000-0000-0000-000000000010'),
    ('general', 'what-is-your-unpopular-gym-opinion', 'What is your unpopular gym opinion?', 'Let me start: I think training to failure every set is counterproductive for most people. You accumulate too much fatigue and your form breaks down. What is your unpopular gym opinion? Keep it respectful!', 'a1000000-0000-0000-0000-000000000011'),
    ('workout-tips', 'how-to-improve-pull-up-strength', 'How to improve pull-up strength?', 'I can barely do 3 pull-ups and I want to get to 15. I have been doing negatives and band-assisted pull-ups but progress is slow. Any tips or programs that worked for you? How long did it take?', 'a1000000-0000-0000-0000-000000000012'),
    ('nutrition', 'meal-prep-tips-for-busy-people', 'Meal prep tips for busy people?', 'I work 10 hour days and the last thing I want to do is cook every night. How do you guys manage meal prep? Looking for simple recipes that last 4-5 days in the fridge and actually taste good reheated.', 'a1000000-0000-0000-0000-000000000013'),
    ('progress', 'overcoming-plateau-after-1-year-of-training', 'Overcoming plateau after 1 year of training', 'My lifts have been stuck for about 2 months. Bench 185, squat 225, deadlift 315. I have tried deload weeks and changing rep ranges. What helped you break through your first major plateau?', 'a1000000-0000-0000-0000-000000000014'),
    ('questions', 'how-important-is-sleep-for-muscle-growth', 'How important is sleep for muscle growth?', 'I average about 5-6 hours of sleep per night due to work. I train hard and eat well but gains are slow. Is sleep really that important? Anyone here build muscle successfully on less than 7 hours?', 'a1000000-0000-0000-0000-000000000015')
  ) AS t(category_slug, slug, title, content, user_id)
)
INSERT INTO forum_threads (id, category_id, user_id, title, slug, content, views, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  td.user_id::uuid,
  td.title,
  td.slug,
  td.content,
  (random() * 500 + 50)::int,
  NOW() - (random() * INTERVAL '30 days')
FROM thread_data td
JOIN categories c ON c.slug = td.category_slug;

-- Step 4: Create 10 replies per thread (150 total)

WITH threads AS (
  SELECT id, title FROM forum_threads
),
users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM auth.users WHERE id::text LIKE 'a1000000%'
),
reply_templates AS (
  SELECT * FROM (VALUES
    (1, 'Great question! I have been wondering about this too. From my experience, consistency is the most important thing. Just keep showing up and the results will come.'),
    (2, 'This is solid advice. I would also add that tracking your progress makes a huge difference. I use a simple spreadsheet to log every workout.'),
    (3, 'I had the same issue when I started. What helped me was reducing the weight and focusing on form for a few weeks. Quality over quantity.'),
    (4, 'Totally agree with this. I made the mistake of going too heavy too fast and ended up with a shoulder injury. Take it slow and build a solid foundation.'),
    (5, 'Have you tried adding accessory work? Sometimes the main lift stalls because a supporting muscle is weak. For bench, try adding tricep work.'),
    (6, 'I switched to this approach about 3 months ago and my numbers went up significantly. Highly recommend giving it a try for at least 6 weeks.'),
    (7, 'Protein timing does not matter as much as total daily intake. Just make sure you are hitting your numbers throughout the day and you will be fine.'),
    (8, 'Sleep is absolutely crucial. I noticed a huge difference when I went from 6 hours to 8 hours. Recovery improved and I could lift heavier the next session.'),
    (9, 'For meal prep, I usually cook in bulk on Sunday. Chicken thighs, rice, and roasted veggies. Lasts me until Thursday. Simple but effective.'),
    (10, 'Creatine is one of the most studied supplements out there. As long as you stay hydrated, it is perfectly safe. The kidney concerns are mostly myth for healthy individuals.')
  ) AS t(reply_num, content)
)
INSERT INTO forum_replies (id, thread_id, user_id, content, created_at)
SELECT
  gen_random_uuid(),
  t.id,
  u.id,
  rt.content,
  t.created_at + (generate_series * INTERVAL '2 hours') + (random() * INTERVAL '30 minutes')
FROM threads t
CROSS JOIN generate_series(1, 10) AS generate_series
JOIN reply_templates rt ON rt.reply_num = ((generate_series - 1) % 10 + 1)
JOIN users u ON u.rn = ((generate_series - 1) % 15 + 1)
WHERE t.id IN (SELECT id FROM threads);

-- Step 5: Update thread view counts to look realistic
UPDATE forum_threads SET views = (random() * 800 + 100)::int;

-- Done! Check the results
SELECT 
  t.title,
  t.views,
  p.username as author,
  c.name as category,
  (SELECT COUNT(*) FROM forum_replies r WHERE r.thread_id = t.id) as replies
FROM forum_threads t
JOIN profiles p ON t.user_id = p.id
JOIN forum_categories c ON t.category_id = c.id
ORDER BY t.created_at DESC;
```


