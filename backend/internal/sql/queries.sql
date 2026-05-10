-- queries.sql

-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name, profile_photo_url)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: UpdateUserProfile :one
UPDATE users
SET full_name = COALESCE(sqlc.narg('full_name'), full_name),
    profile_photo_url = COALESCE(sqlc.narg('profile_photo_url'), profile_photo_url),
    language_preference = COALESCE(sqlc.narg('language_preference'), language_preference)
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- Cities --

-- name: CreateCity :one
INSERT INTO cities (name, country, region, cost_index, popularity_score, latitude, longitude, description, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetCityByID :one
SELECT * FROM cities
WHERE id = $1 LIMIT 1;

-- name: SearchCities :many
SELECT * FROM cities
WHERE (name ILIKE '%' || $1 || '%' OR country ILIKE '%' || $1 || '%')
ORDER BY popularity_score DESC, name ASC
LIMIT $2 OFFSET $3;

-- name: GetCitiesByCountry :many
SELECT * FROM cities
WHERE country = $1
ORDER BY popularity_score DESC, name ASC;

-- name: GetPopularCities :many
SELECT * FROM cities
ORDER BY popularity_score DESC
LIMIT $1;

-- Activities --

-- name: CreateActivity :one
INSERT INTO activities (city_id, name, description, category, estimated_cost, duration_minutes, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetActivitiesByCity :many
SELECT * FROM activities
WHERE city_id = $1
ORDER BY estimated_cost ASC, name ASC;

-- name: SearchActivities :many
SELECT a.* FROM activities a
JOIN cities c ON a.city_id = c.id
WHERE (a.name ILIKE '%' || $1 || '%' OR a.description ILIKE '%' || $1 || '%')
  AND (sqlc.narg('city_id')::uuid IS NULL OR a.city_id = sqlc.narg('city_id')::uuid)
  AND (sqlc.narg('category')::text IS NULL OR a.category = sqlc.narg('category')::text)
ORDER BY a.estimated_cost ASC
LIMIT $2 OFFSET $3;

-- name: GetActivitiesByCategory :many
SELECT * FROM activities
WHERE city_id = $1 AND category = $2
ORDER BY estimated_cost ASC;

-- name: GetActivityByID :one
SELECT * FROM activities
WHERE id = $1 LIMIT 1;

-- Trips --

-- name: CreateTrip :one
INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public, public_slug)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetTripByID :one
SELECT * FROM trips
WHERE id = $1 LIMIT 1;

-- name: GetUserTrips :many
SELECT * FROM trips
WHERE user_id = $1
ORDER BY start_date DESC, created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetTripByPublicSlug :one
SELECT * FROM trips
WHERE public_slug = $1 AND is_public = true
LIMIT 1;

-- name: UpdateTrip :one
UPDATE trips
SET name = COALESCE(sqlc.narg('name'), name),
    description = COALESCE(sqlc.narg('description'), description),
    start_date = COALESCE(sqlc.narg('start_date'), start_date),
    end_date = COALESCE(sqlc.narg('end_date'), end_date),
    cover_photo_url = COALESCE(sqlc.narg('cover_photo_url'), cover_photo_url),
    is_public = COALESCE(sqlc.narg('is_public'), is_public),
    public_slug = COALESCE(sqlc.narg('public_slug'), public_slug)
WHERE id = $1
RETURNING *;

-- name: DeleteTrip :exec
DELETE FROM trips WHERE id = $1;

-- name: GetUpcomingTrips :many
SELECT * FROM trips
WHERE user_id = $1 AND start_date >= CURRENT_DATE
ORDER BY start_date ASC
LIMIT $2;

-- Trip Stops --

-- name: CreateTripStop :one
INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, stop_order, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetTripStops :many
SELECT ts.*, c.name as city_name, c.country, c.cost_index, c.image_url as city_image
FROM trip_stops ts
JOIN cities c ON ts.city_id = c.id
WHERE ts.trip_id = $1
ORDER BY ts.stop_order ASC;

-- name: GetTripStopByID :one
SELECT ts.*, c.name as city_name, c.country
FROM trip_stops ts
JOIN cities c ON ts.city_id = c.id
WHERE ts.id = $1
LIMIT 1;

-- name: UpdateTripStop :one
UPDATE trip_stops
SET arrival_date = COALESCE(sqlc.narg('arrival_date'), arrival_date),
    departure_date = COALESCE(sqlc.narg('departure_date'), departure_date),
    stop_order = COALESCE(sqlc.narg('stop_order'), stop_order),
    notes = COALESCE(sqlc.narg('notes'), notes)
WHERE id = $1
RETURNING *;

-- name: DeleteTripStop :exec
DELETE FROM trip_stops WHERE id = $1;

-- name: ReorderTripStops :exec
UPDATE trip_stops
SET stop_order = $2
WHERE id = $1;

-- Trip Activities --

-- name: CreateTripActivity :one
INSERT INTO trip_activities (trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes, activity_order)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetTripActivitiesByStop :many
SELECT ta.*, a.name as activity_name, a.description, a.category, a.estimated_cost, a.duration_minutes, a.image_url
FROM trip_activities ta
JOIN activities a ON ta.activity_id = a.id
WHERE ta.trip_stop_id = $1
ORDER BY ta.scheduled_date ASC, ta.activity_order ASC;

-- name: GetTripActivitiesByDate :many
SELECT ta.*, a.name as activity_name, a.description, a.category, a.estimated_cost
FROM trip_activities ta
JOIN activities a ON ta.activity_id = a.id
JOIN trip_stops ts ON ta.trip_stop_id = ts.id
WHERE ts.trip_id = $1 AND ta.scheduled_date = $2
ORDER BY ta.scheduled_time ASC, ta.activity_order ASC;

-- name: UpdateTripActivity :one
UPDATE trip_activities
SET scheduled_date = COALESCE(sqlc.narg('scheduled_date'), scheduled_date),
    scheduled_time = COALESCE(sqlc.narg('scheduled_time'), scheduled_time),
    actual_cost = COALESCE(sqlc.narg('actual_cost'), actual_cost),
    notes = COALESCE(sqlc.narg('notes'), notes),
    activity_order = COALESCE(sqlc.narg('activity_order'), activity_order)
WHERE id = $1
RETURNING *;

-- name: DeleteTripActivity :exec
DELETE FROM trip_activities WHERE id = $1;

-- name: GetTripActivityByID :one
SELECT * FROM trip_activities
WHERE id = $1 LIMIT 1;

-- Trip Expenses --

-- name: CreateTripExpense :one
INSERT INTO trip_expenses (trip_id, trip_stop_id, expense_type, amount, currency, expense_date, description)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetTripExpenses :many
SELECT * FROM trip_expenses
WHERE trip_id = $1
ORDER BY expense_date DESC, created_at DESC;

-- name: GetTripExpensesByType :many
SELECT * FROM trip_expenses
WHERE trip_id = $1 AND expense_type = $2
ORDER BY expense_date DESC;

-- name: GetTripBudgetSummary :one
SELECT 
    trip_id,
    SUM(CASE WHEN expense_type = 'transport' THEN amount ELSE 0 END) as transport_total,
    SUM(CASE WHEN expense_type = 'accommodation' THEN amount ELSE 0 END) as accommodation_total,
    SUM(CASE WHEN expense_type = 'meals' THEN amount ELSE 0 END) as meals_total,
    SUM(CASE WHEN expense_type = 'other' THEN amount ELSE 0 END) as other_total,
    SUM(amount) as total_expenses,
    COUNT(*) as expense_count
FROM trip_expenses
WHERE trip_id = $1
GROUP BY trip_id;

-- name: GetTripActivitiesCost :one
SELECT 
    ts.trip_id,
    SUM(COALESCE(ta.actual_cost, a.estimated_cost, 0)) as total_activities_cost,
    COUNT(ta.id) as activity_count
FROM trip_activities ta
JOIN activities a ON ta.activity_id = a.id
JOIN trip_stops ts ON ta.trip_stop_id = ts.id
WHERE ts.trip_id = $1
GROUP BY ts.trip_id;

-- name: DeleteTripExpense :exec
DELETE FROM trip_expenses WHERE id = $1;

-- Saved Destinations --

-- name: SaveDestination :one
INSERT INTO saved_destinations (user_id, city_id)
VALUES ($1, $2)
ON CONFLICT (user_id, city_id) DO NOTHING
RETURNING *;

-- name: GetSavedDestinations :many
SELECT sd.*, c.name, c.country, c.cost_index, c.image_url
FROM saved_destinations sd
JOIN cities c ON sd.city_id = c.id
WHERE sd.user_id = $1
ORDER BY sd.created_at DESC;

-- name: UnsaveDestination :exec
DELETE FROM saved_destinations
WHERE user_id = $1 AND city_id = $2;

-- Trip Shares --

-- name: CreateTripShare :one
INSERT INTO trip_shares (trip_id, shared_with_user_id, permission_level, share_token)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetTripSharesByTrip :many
SELECT ts.*, u.email, u.full_name
FROM trip_shares ts
LEFT JOIN users u ON ts.shared_with_user_id = u.id
WHERE ts.trip_id = $1;

-- name: GetTripShareByToken :one
SELECT * FROM trip_shares
WHERE share_token = $1
LIMIT 1;

-- name: DeleteTripShare :exec
DELETE FROM trip_shares WHERE id = $1;

-- Analytics (Optional) --

-- name: GetTripStats :one
SELECT 
    COUNT(DISTINCT t.id) as total_trips,
    COUNT(DISTINCT t.user_id) as unique_users,
    COUNT(DISTINCT ts.city_id) as unique_cities_visited,
    AVG(DATE_PART('day', t.end_date - t.start_date) + 1) as avg_trip_duration_days
FROM trips t
LEFT JOIN trip_stops ts ON t.id = ts.trip_id;

-- name: GetPopularCitiesStats :many
SELECT 
    c.id,
    c.name,
    c.country,
    COUNT(DISTINCT ts.trip_id) as trip_count,
    COUNT(DISTINCT t.user_id) as unique_visitors
FROM cities c
JOIN trip_stops ts ON c.id = ts.city_id
JOIN trips t ON ts.trip_id = t.id
GROUP BY c.id, c.name, c.country
ORDER BY trip_count DESC
LIMIT $1;
