-- Test data for multi-platform videos
-- Insert test multi-platform videos for the existing subject

INSERT INTO multi_platform_videos (
  id,
  subject_id,
  title,
  description,
  platform,
  video_id,
  video_url,
  duration,
  order_index,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '98afe449-2b8d-483e-bdce-a08c29294a45', -- Existing subject ID
  'Vimeo Introduction to Programming',
  'Learn programming basics through this comprehensive Vimeo tutorial',
  'vimeo',
  '123456789',
  'https://vimeo.com/123456789',
  3600, -- 1 hour
  0,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '98afe449-2b8d-483e-bdce-a08c29294a45', -- Existing subject ID
  'Facebook Live: Advanced JavaScript',
  'Live session covering advanced JavaScript concepts',
  'facebook',
  NULL,
  'https://www.facebook.com/watch/?v=987654321',
  2700, -- 45 minutes
  1,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '98afe449-2b8d-483e-bdce-a08c29294a45', -- Existing subject ID
  'Dailymotion Web Development Tutorial',
  'Complete web development course on Dailymotion',
  'dailymotion',
  'x7abc123',
  'https://www.dailymotion.com/video/x7abc123',
  4200, -- 1 hour 10 minutes
  2,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '98afe449-2b8d-483e-bdce-a08c29294a45', -- Existing subject ID
  'Twitch Programming Stream',
  'Live coding session on Twitch platform',
  'twitch',
  NULL,
  'https://www.twitch.tv/videos/555666777',
  5400, -- 1.5 hours
  3,
  true,
  NOW(),
  NOW()
);