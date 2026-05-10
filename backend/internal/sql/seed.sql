-- Seed data for Global Trotter application
-- This script populates the database with sample data for testing and development

-- Insert test users
INSERT INTO users (id, email, password_hash, full_name, profile_photo_url, language_preference) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', '$2a$10$dummyhash1', 'Alice Johnson', 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e', 'en'),
('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', '$2a$10$dummyhash2', 'Bob Smith', 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e', 'en'),
('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', '$2a$10$dummyhash3', 'Carol White', 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e', 'en'),
('550e8400-e29b-41d4-a716-446655440004', 'david@example.com', '$2a$10$dummyhash4', 'David Brown', 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e', 'en')
ON CONFLICT DO NOTHING;

-- Insert cities
INSERT INTO cities (id, name, country, region, cost_index, popularity_score, latitude, longitude, description, image_url) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Paris', 'France', 'Île-de-France', 75.50, 95, 48.85661389, 2.35222222, 'The City of Light, known for its art, culture, and iconic monuments.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440002', 'Tokyo', 'Japan', 'Tokyo', 85.30, 92, 35.6762, 139.6503, 'A vibrant metropolis blending ancient traditions with modern technology.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440003', 'Barcelona', 'Spain', 'Catalonia', 60.20, 88, 41.3851, 2.1734, 'The capital of Catalonia, famous for Gaudí architecture and beaches.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440004', 'Bangkok', 'Thailand', 'Bangkok', 35.00, 85, 13.7563, 100.5018, 'A bustling city known for temples, street food, and vibrant nightlife.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440005', 'New York', 'United States', 'New York', 95.75, 93, 40.7128, -74.0060, 'The city that never sleeps, offering world-class museums and entertainment.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440006', 'Rome', 'Italy', 'Lazio', 55.00, 94, 41.9028, 12.4964, 'The Eternal City, home to ancient ruins and Renaissance art.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440007', 'Sydney', 'Australia', 'New South Wales', 70.50, 87, -33.8688, 151.2093, 'A harbor city famous for its Opera House and beautiful beaches.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8'),
('650e8400-e29b-41d4-a716-446655440008', 'Dubai', 'United Arab Emirates', 'Dubai', 80.00, 82, 25.2048, 55.2708, 'A modern oasis known for luxury shopping, architecture, and desert adventures.', 'https://plus.unsplash.com/premium_photo-1672116452571-896980a801c8')
ON CONFLICT DO NOTHING;

-- Insert activities for Paris
INSERT INTO activities (id, city_id, name, description, category, estimated_cost, duration_minutes, image_url) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Eiffel Tower Visit', 'Climb or take the elevator to the top of the iconic Eiffel Tower', 'sightseeing', 25.00, 90, 'https://plus.unsplash.com/premium_photo-1661963064037-cfcf2e10db2d'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Louvre Museum', 'Explore the world''s largest art museum', 'culture', 17.00, 240, 'https://plus.unsplash.com/premium_photo-1661963064037-cfcf2e10db2d'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Seine River Cruise', 'Enjoy a scenic boat tour along the Seine', 'sightseeing', 15.00, 60, 'https://plus.unsplash.com/premium_photo-1661963064037-cfcf2e10db2d'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'French Cooking Class', 'Learn to cook traditional French dishes', 'food', 95.00, 180, 'https://plus.unsplash.com/premium_photo-1661963064037-cfcf2e10db2d');

-- Insert activities for Tokyo
INSERT INTO activities (id, city_id, name, description, category, estimated_cost, duration_minutes, image_url) VALUES
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'Senso-ji Temple', 'Visit Tokyo''s oldest temple in Asakusa', 'culture', 0.00, 60, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'Shibuya Crossing Experience', 'Experience the world''s busiest pedestrian crossing', 'sightseeing', 0.00, 30, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 'Sushi Making Class', 'Learn to make authentic Japanese sushi', 'food', 120.00, 120, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', 'Teamlab Borderless', 'Explore an immersive digital art museum', 'culture', 30.00, 120, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf');

-- Insert activities for Barcelona
INSERT INTO activities (id, city_id, name, description, category, estimated_cost, duration_minutes, image_url) VALUES
('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'Sagrada Familia', 'Visit Gaudí''s masterpiece basilica', 'culture', 26.00, 90, 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg'),
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', 'Park Güell Tour', 'Explore Gaudí''s whimsical park', 'sightseeing', 16.00, 120, 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg'),
('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003', 'Beach Time at Barceloneta', 'Relax on Barcelona''s main beach', 'relaxation', 0.00, 180, 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg'),
('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'Tapas Tasting Tour', 'Sample traditional Spanish tapas', 'food', 50.00, 120, 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg');

-- Insert activities for Bangkok
INSERT INTO activities (id, city_id, name, description, category, estimated_cost, duration_minutes, image_url) VALUES
('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', 'Grand Palace Tour', 'Visit the official residence of Thai kings', 'culture', 15.00, 120, 'https://images.pexels.com/photos/1004366/pexels-photo-1004366.jpeg'),
('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440004', 'Floating Market Visit', 'Experience Bangkok''s famous floating markets', 'sightseeing', 25.00, 180, 'https://images.pexels.com/photos/1004366/pexels-photo-1004366.jpeg'),
('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', 'Thai Massage Experience', 'Get a traditional Thai massage', 'relaxation', 12.00, 90, 'https://images.pexels.com/photos/1004366/pexels-photo-1004366.jpeg'),
('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004', 'Street Food Tour', 'Explore Bangkok''s street food scene', 'food', 35.00, 150, 'https://images.pexels.com/photos/1004366/pexels-photo-1004366.jpeg');

-- Insert a sample trip for Alice
INSERT INTO trips (id, user_id, name, description, start_date, end_date, cover_photo_url, is_public, public_slug) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'European Summer Adventure', 'A magical summer trip across Europe visiting iconic cities and experiencing culture.', '2026-06-15', '2026-07-15', 'https://api.example.com/trips/europe.jpg', true, 'alice-europe-summer-2026')
ON CONFLICT DO NOTHING;

-- Insert trip stops for Alice's trip
INSERT INTO trip_stops (id, trip_id, city_id, arrival_date, departure_date, stop_order, notes) VALUES
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2026-06-15', '2026-06-20', 1, 'Starting in Paris, exploring art and culture'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440006', '2026-06-21', '2026-06-26', 2, 'Ancient Rome and Renaissance art'),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '2026-06-27', '2026-07-05', 3, 'Barcelona beaches and Gaudí architecture'),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '2026-07-06', '2026-07-15', 4, 'Tokyo adventure, final stop')
ON CONFLICT DO NOTHING;

-- Insert trip activities for Paris stop
INSERT INTO trip_activities (id, trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '2026-06-16', '09:00:00', 25.00, 'Booked skip-the-line tickets', 1),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '2026-06-17', '10:00:00', 17.00, 'Plan to spend 3 hours here', 1),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', '2026-06-18', '14:00:00', 15.00, 'Evening cruise, sunset views', 1),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440004', '2026-06-19', '11:00:00', 95.00, 'Half-day cooking class', 1);

-- Insert trip activities for Rome stop
INSERT INTO trip_activities (id, trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order) VALUES
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440009', '2026-06-22', '08:00:00', 26.00, 'Early morning visit to avoid crowds', 1),
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440010', '2026-06-24', '09:00:00', 16.00, 'Guided tour included', 1);

-- Insert trip activities for Barcelona stop
INSERT INTO trip_activities (id, trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order) VALUES
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440011', '2026-06-28', '10:00:00', 0.00, 'Beach day', 1),
('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440012', '2026-06-29', '18:00:00', 50.00, 'Evening tapas tasting tour', 1),
('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440009', '2026-07-01', '10:00:00', 26.00, 'Sagrada Familia visit', 1);

-- Insert trip activities for Tokyo stop
INSERT INTO trip_activities (id, trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order) VALUES
('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440005', '2026-07-07', '09:00:00', 0.00, 'Visit the oldest temple', 1),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440006', '2026-07-08', '15:00:00', 0.00, 'Catch the busy crossing', 2),
('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440007', '2026-07-10', '11:00:00', 120.00, 'Sushi making class', 1),
('a50e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440008', '2026-07-12', '14:00:00', 30.00, 'Digital art experience', 1);

-- Insert trip expenses for Alice's trip
INSERT INTO trip_expenses (id, trip_id, trip_stop_id, expense_type, amount, currency, expense_date, description) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'accommodation', 400.00, 'EUR', '2026-06-15', '5 nights hotel in Paris'),
('b50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'transport', 120.00, 'EUR', '2026-06-15', 'Airport to hotel transfer'),
('b50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'meals', 200.00, 'EUR', '2026-06-19', 'Dinners and lunches in Paris'),
('b50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'accommodation', 300.00, 'EUR', '2026-06-21', '5 nights hotel in Rome'),
('b50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'transport', 85.00, 'EUR', '2026-06-20', 'Flight Paris to Rome'),
('b50e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440003', 'accommodation', 280.00, 'EUR', '2026-06-27', '9 nights Airbnb in Barcelona'),
('b50e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440003', 'transport', 95.00, 'EUR', '2026-06-26', 'Flight Rome to Barcelona'),
('b50e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440004', 'accommodation', 800.00, 'JPY', '2026-07-06', '9 nights hotel in Tokyo'),
('b50e8400-e29b-41d4-a716-446655440009', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440004', 'transport', 450.00, 'EUR', '2026-07-05', 'Flight Barcelona to Tokyo'),
('b50e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440001', NULL, 'other', 200.00, 'EUR', '2026-07-01', 'Travel insurance for the entire trip');

-- Insert saved destinations for Alice
INSERT INTO saved_destinations (id, user_id, city_id) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005'),
('c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440007'),
('c50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008')
ON CONFLICT DO NOTHING;

-- Insert saved destinations for Bob
INSERT INTO saved_destinations (id, user_id, city_id) VALUES
('c50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004'),
('c50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002')
ON CONFLICT DO NOTHING;

-- Insert trip shares for collaborative planning
INSERT INTO trip_shares (id, trip_id, shared_with_user_id, permission_level, share_token) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'view', 'share_token_alice_bob_001'),
('d50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'edit', 'share_token_alice_carol_001')
ON CONFLICT DO NOTHING;

-- Insert a sample trip for Bob
INSERT INTO trips (id, user_id, name, description, start_date, end_date, cover_photo_url, is_public, public_slug) VALUES
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Southeast Asia Explorer', 'An adventure across Thailand, uncovering temples, markets, and local cuisine.', '2026-04-10', '2026-04-25', 'https://api.example.com/trips/asia.jpg', false, NULL)
ON CONFLICT DO NOTHING;

-- Insert trip stops for Bob's trip
INSERT INTO trip_stops (id, trip_id, city_id, arrival_date, departure_date, stop_order, notes) VALUES
('950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '2026-04-10', '2026-04-25', 1, 'Full Bangkok experience with temples and street food')
ON CONFLICT DO NOTHING;

-- Insert trip activities for Bob's Bangkok trip
INSERT INTO trip_activities (id, trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order) VALUES
('a50e8400-e29b-41d4-a716-446655440014', '950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440013', '2026-04-12', '08:00:00', 15.00, 'Dress code: shoulders and knees covered', 1),
('a50e8400-e29b-41d4-a716-446655440015', '950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440014', '2026-04-15', '07:00:00', 30.00, 'Early morning tour recommended', 1),
('a50e8400-e29b-41d4-a716-446655440016', '950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440015', '2026-04-18', '14:00:00', 12.00, 'Traditional Thai massage', 1),
('a50e8400-e29b-41d4-a716-446655440017', '950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440016', '2026-04-20', '16:00:00', 35.00, 'Evening street food exploration', 1);

-- Insert trip expenses for Bob's trip
INSERT INTO trip_expenses (id, trip_id, trip_stop_id, expense_type, amount, currency, expense_date, description) VALUES
('b50e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440005', 'accommodation', 250.00, 'THB', '2026-04-10', '15 nights 3-star hotel in Bangkok'),
('b50e8400-e29b-41d4-a716-446655440012', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440005', 'transport', 800.00, 'EUR', '2026-04-10', 'International flight to Bangkok'),
('b50e8400-e29b-41d4-a716-446655440013', '850e8400-e29b-41d4-a716-446655440002', NULL, 'other', 150.00, 'EUR', '2026-04-10', 'Travel insurance');

-- Verify the seed data was inserted
SELECT 
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM cities) as city_count,
  (SELECT COUNT(*) FROM activities) as activity_count,
  (SELECT COUNT(*) FROM trips) as trip_count,
  (SELECT COUNT(*) FROM trip_stops) as stop_count,
  (SELECT COUNT(*) FROM trip_activities) as trip_activity_count,
  (SELECT COUNT(*) FROM trip_expenses) as expense_count,
  (SELECT COUNT(*) FROM saved_destinations) as saved_destination_count,
  (SELECT COUNT(*) FROM trip_shares) as share_count;
