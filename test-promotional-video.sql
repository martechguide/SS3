-- Insert sample brand promotion with video ad
INSERT INTO brand_promotions (
  brand_name,
  brand_logo,
  contact_email,
  contact_phone,
  product_name,
  product_description,
  target_audience,
  campaign_budget,
  campaign_duration_days,
  video_url,
  website_url,
  call_to_action,
  is_active,
  is_approved,
  priority,
  impressions,
  clicks
) VALUES (
  'TechEdu Academy',
  'https://picsum.photos/200/200?random=1',
  'contact@techedu.com',
  '+91-9876543210',
  'Advanced Programming Course',
  'Master full-stack development with our comprehensive course. Learn React, Node.js, databases, and deployment. Get job-ready in 6 months with hands-on projects.',
  'Students',
  50000,
  30,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://techedu.com',
  'Enroll Now',
  true,
  true,
  5,
  0,
  0
);

-- Insert another brand promotion for testing
INSERT INTO brand_promotions (
  brand_name,
  brand_logo,
  contact_email,
  product_name,
  product_description,
  target_audience,
  campaign_budget,
  video_url,
  website_url,
  call_to_action,
  is_active,
  is_approved,
  priority
) VALUES (
  'CodeMaster Institute',
  'https://picsum.photos/200/200?random=2',
  'info@codemaster.com',
  'Data Science Bootcamp',
  'Transform your career with our intensive Data Science bootcamp. Learn Python, Machine Learning, AI, and Big Data analytics.',
  'Professionals',
  75000,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://codemaster.com',
  'Apply Today',
  true,
  true,
  4
);