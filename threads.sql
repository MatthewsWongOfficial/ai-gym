-- Forum Seed Data: 15 Threads with 150 Replies
-- Run in Supabase SQL Editor

-- Step 1: Create 15 test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'weijie@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"WeiJie_lifts"}', NOW() - INTERVAL '60 days', NOW()),
('a1000000-0000-0000-0000-000000000002', 'sarahtan@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"SarahTan_fit"}', NOW() - INTERVAL '55 days', NOW()),
('a1000000-0000-0000-0000-000000000003', 'darrenc@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"DarrenC"}', NOW() - INTERVAL '50 days', NOW()),
('a1000000-0000-0000-0000-000000000004', 'meiling@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"MeiLing_gym"}', NOW() - INTERVAL '48 days', NOW()),
('a1000000-0000-0000-0000-000000000005', 'ravi@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"RaviStrength"}', NOW() - INTERVAL '45 days', NOW()),
('a1000000-0000-0000-0000-000000000006', 'jiayi@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"JiaYi_fit"}', NOW() - INTERVAL '42 days', NOW()),
('a1000000-0000-0000-0000-000000000007', 'hafiz@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"HafizGains"}', NOW() - INTERVAL '40 days', NOW()),
('a1000000-0000-0000-0000-000000000008', 'xuanwen@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"XuanWen"}', NOW() - INTERVAL '38 days', NOW()),
('a1000000-0000-0000-0000-000000000009', 'priya@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"PriyaFit"}', NOW() - INTERVAL '35 days', NOW()),
('a1000000-0000-0000-0000-000000000010', 'keithloh@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"KeithLoh"}', NOW() - INTERVAL '33 days', NOW()),
('a1000000-0000-0000-0000-000000000011', 'sitinur@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"SitiNur"}', NOW() - INTERVAL '30 days', NOW()),
('a1000000-0000-0000-0000-000000000012', 'bryanchua@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"BryanChua"}', NOW() - INTERVAL '28 days', NOW()),
('a1000000-0000-0000-0000-000000000013', 'aisha@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"Aisha_lifts"}', NOW() - INTERVAL '25 days', NOW()),
('a1000000-0000-0000-0000-000000000014', 'zhiwei@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"ZhiWei"}', NOW() - INTERVAL '22 days', NOW()),
('a1000000-0000-0000-0000-000000000015', 'nicoleng@gmail.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"username":"NicoleNg"}', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create profiles
INSERT INTO public.profiles (id, email, username, bio, created_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'weijie@gmail.com', 'WeiJie_lifts', 'Lifting since NS. Powerlifting focused.', NOW() - INTERVAL '60 days'),
('a1000000-0000-0000-0000-000000000002', 'sarahtan@gmail.com', 'SarahTan_fit', 'PT and nutrition coach based in SG.', NOW() - INTERVAL '55 days'),
('a1000000-0000-0000-0000-000000000003', 'darrenc@gmail.com', 'DarrenC', 'Casual lifter. Just trying to stay healthy.', NOW() - INTERVAL '50 days'),
('a1000000-0000-0000-0000-000000000004', 'meiling@gmail.com', 'MeiLing_gym', 'Yoga and strength training combo.', NOW() - INTERVAL '48 days'),
('a1000000-0000-0000-0000-000000000005', 'ravi@gmail.com', 'RaviStrength', 'Bodybuilder. Chasing that aesthetic life.', NOW() - INTERVAL '45 days'),
('a1000000-0000-0000-0000-000000000006', 'jiayi@gmail.com', 'JiaYi_fit', 'Runner and gym enthusiast. Half marathon finisher.', NOW() - INTERVAL '42 days'),
('a1000000-0000-0000-0000-000000000007', 'hafiz@gmail.com', 'HafizGains', 'Calisthenics and weights. Always learning.', NOW() - INTERVAL '40 days'),
('a1000000-0000-0000-0000-000000000008', 'xuanwen@gmail.com', 'XuanWen', 'Software engineer who lifts. Desk job gains.', NOW() - INTERVAL '38 days'),
('a1000000-0000-0000-0000-000000000009', 'priya@gmail.com', 'PriyaFit', 'Vegetarian lifter. Protein is possible without meat!', NOW() - INTERVAL '35 days'),
('a1000000-0000-0000-0000-000000000010', 'keithloh@gmail.com', 'KeithLoh', 'Old school gym bro. No shortcuts.', NOW() - INTERVAL '33 days'),
('a1000000-0000-0000-0000-000000000011', 'sitinur@gmail.com', 'SitiNur', 'Fitness mama. Working out with 2 kids.', NOW() - INTERVAL '30 days'),
('a1000000-0000-0000-0000-000000000012', 'bryanchua@gmail.com', 'BryanChua', 'CrossFit convert. Functional fitness all the way.', NOW() - INTERVAL '28 days'),
('a1000000-0000-0000-0000-000000000013', 'aisha@gmail.com', 'Aisha_lifts', 'New to lifting. Learning as I go.', NOW() - INTERVAL '25 days'),
('a1000000-0000-0000-0000-000000000014', 'zhiwei@gmail.com', 'ZhiWei', 'Uni student. Gym is my stress relief.', NOW() - INTERVAL '22 days'),
('a1000000-0000-0000-0000-000000000015', 'nicoleng@gmail.com', 'NicoleNg', 'Marathon runner turned lifter. Best decision ever.', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create 15 forum threads
WITH categories AS (
  SELECT id, slug FROM forum_categories
),
thread_data AS (
  SELECT * FROM (VALUES
    ('general', 'what-gym-etiquette-rules-do-you-wish-everyone-followed', 'What gym etiquette rules do you wish everyone followed?', 'Been going to the gym for years and the lack of basic etiquette still surprises me. From re-racking weights to wiping down benches, what rules do you think everyone should follow? Share your biggest gym etiquette pet peeves!', 'a1000000-0000-0000-0000-000000000001'),
    ('workout-tips', 'best-compound-exercises-for-beginners', 'Best compound exercises for beginners?', 'Just starting out and want to focus on compound movements. Been doing squats, bench press, and deadlifts. Any other must-do compounds I should add? Looking for a solid foundation.', 'a1000000-0000-0000-0000-000000000002'),
    ('nutrition', 'how-much-protein-do-you-really-need-per-day', 'How much protein do you really need per day?', 'So much conflicting info about protein intake. Some say 1g per pound, others say 0.7g is enough. What has worked best for you? Trying to build muscle, currently eating around 150g at 180lbs.', 'a1000000-0000-0000-0000-000000000003'),
    ('progress', 'my-6-month-transformation-journey', 'My 6 month transformation journey', 'Started at 100kg with no gym experience. Now at 84kg and hitting PRs every month. What worked: consistent PPL split, tracking calories, sleeping 8 hours. Happy to answer questions!', 'a1000000-0000-0000-0000-000000000004'),
    ('questions', 'why-do-my-knees-hurt-during-squats', 'Why do my knees hurt during squats?', 'Been squatting for 3 months and started getting knee pain on the inside. Form check videos look okay. Is this a mobility issue? Should I see a physio? Anyone dealt with this?', 'a1000000-0000-0000-0000-000000000005'),
    ('general', 'morning-workout-vs-evening-workout', 'Morning workout vs evening workout - which is better?', 'Trying to switch to morning workouts but I feel so weak compared to evening sessions. Is there a real performance difference or just about getting used to it? What works for you?', 'a1000000-0000-0000-0000-000000000006'),
    ('workout-tips', 'push-pull-legs-vs-upper-lower-split', 'Push Pull Legs vs Upper Lower split?', 'Currently doing PPL 6 days a week but thinking about switching to Upper Lower 4 days for more recovery. Anyone made this switch? Notice any difference in gains?', 'a1000000-0000-0000-0000-000000000007'),
    ('nutrition', 'best-pre-workout-meal-ideas', 'Best pre-workout meal ideas?', 'Usually train after work around 6pm. Looking for good pre-workout meals that give energy without feeling heavy. Currently eating rice and chicken about 90 min before. Any better options?', 'a1000000-0000-0000-0000-000000000008'),
    ('progress', 'finally-hit-a-3-plate-deadlift', 'Finally hit a 3 plate deadlift!', 'After 8 months of consistent training I finally pulled 140kg! Was my goal since I started. Next target: 180kg. For anyone struggling, biggest game changer was learning to brace properly.', 'a1000000-0000-0000-0000-000000000009'),
    ('questions', 'is-creatine-safe-for-long-term-use', 'Is creatine safe for long term use?', 'Been taking creatine for a month and seeing good results. But my parents keep sending articles about kidney damage. Should I be worried? What does the science actually say?', 'a1000000-0000-0000-0000-000000000010'),
    ('general', 'what-is-your-unpopular-gym-opinion', 'What is your unpopular gym opinion?', 'Let me start: training to failure every set is counterproductive for most people. You accumulate too much fatigue and form breaks down. What is yours? Keep it respectful!', 'a1000000-0000-0000-0000-000000000011'),
    ('workout-tips', 'how-to-improve-pull-up-strength', 'How to improve pull-up strength?', 'Can barely do 3 pull-ups and want to get to 15. Been doing negatives and band-assisted but progress is slow. Any tips or programs that worked? How long did it take?', 'a1000000-0000-0000-0000-000000000012'),
    ('nutrition', 'meal-prep-tips-for-busy-people', 'Meal prep tips for busy people?', 'Work 10 hour days and last thing I want is to cook every night. How do you guys manage meal prep? Looking for simple recipes that last 4-5 days and taste good reheated.', 'a1000000-0000-0000-0000-000000000013'),
    ('progress', 'overcoming-plateau-after-1-year', 'Overcoming plateau after 1 year of training', 'Lifts stuck for 2 months. Bench 80kg, squat 100kg, deadlift 140kg. Tried deload weeks and changing rep ranges. What helped you break through your first major plateau?', 'a1000000-0000-0000-0000-000000000014'),
    ('questions', 'how-important-is-sleep-for-muscle-growth', 'How important is sleep for muscle growth?', 'Average 5-6 hours per night due to work. Train hard and eat well but gains are slow. Is sleep really that important? Anyone build muscle successfully on less than 7 hours?', 'a1000000-0000-0000-0000-000000000015')
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

-- Step 4: Create 10 replies per thread
WITH threads AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM forum_threads
),
users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM auth.users WHERE id::text LIKE 'a1000000%'
),
reply_templates AS (
  SELECT * FROM (VALUES
    (1, 'Good question! From my experience, consistency is the most important thing. Just keep showing up and results will come.'),
    (2, 'Solid advice. I would add that tracking progress makes a huge difference. I use a simple app to log every workout.'),
    (3, 'Had the same issue when I started. What helped was reducing weight and focusing on form for a few weeks. Quality over quantity.'),
    (4, 'Totally agree. Made the mistake of going too heavy too fast and hurt my shoulder. Take it slow and build a solid foundation.'),
    (5, 'Have you tried adding accessory work? Sometimes the main lift stalls because a supporting muscle is weak. For bench, try tricep work.'),
    (6, 'Switched to this about 3 months ago and numbers went up significantly. Highly recommend giving it at least 6 weeks.'),
    (7, 'Protein timing matters less than total daily intake. Just make sure you hit your numbers throughout the day.'),
    (8, 'Sleep is absolutely crucial. Noticed a huge difference going from 6 to 8 hours. Recovery improved and lifts went up.'),
    (9, 'For meal prep, I cook in bulk on Sunday. Chicken thighs, rice, roasted veggies. Lasts until Thursday. Simple but effective.'),
    (10, 'Creatine is one of the most studied supplements. As long as you stay hydrated, perfectly safe. Kidney concerns are mostly myth for healthy people.')
  ) AS t(reply_num, content)
)
INSERT INTO forum_replies (id, thread_id, user_id, content, created_at)
SELECT
  gen_random_uuid(),
  t.id,
  u.id,
  rt.content,
  (SELECT created_at FROM forum_threads WHERE id = t.id) + (generate_series * INTERVAL '2 hours') + (random() * INTERVAL '30 minutes')
FROM threads t
CROSS JOIN generate_series(1, 10) AS generate_series
JOIN reply_templates rt ON rt.reply_num = ((generate_series - 1) % 10 + 1)
JOIN users u ON u.rn = ((generate_series - 1) % 15 + 1);

-- Step 5: Randomize view counts
UPDATE forum_threads SET views = (random() * 800 + 100)::int;

-- Verify
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
