# GlobeTrotter API Documentation

**Version:** 1.0.0  
**Development URL:** `http://localhost:8080/v1`

## Overview

GlobeTrotter is a comprehensive travel planning platform API that enables users to create multi-city itineraries, manage activities, track budgets, and share travel plans. Built with Go Gin framework and PostgreSQL with sqlc for type-safe database operations.[1]

## Authentication

Most endpoints require JWT bearer token authentication.[1]

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Tokens are obtained through the `/auth/login` or `/auth/register` endpoints.[1]

***

## API Endpoints

### Authentication & Users

#### POST /auth/register

Register a new user account.[1]

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `full_name`: Required

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "profile_photo_url": null,
    "language_preference": "en",
    "created_at": "2026-01-03T11:45:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

***

#### POST /auth/login

Authenticate existing user.[1]

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "profile_photo_url": null,
    "language_preference": "en",
    "created_at": "2026-01-03T11:45:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

***

#### GET /users/profile

Get current user's profile.[1]

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "profile_photo_url": "https://example.com/photo.jpg",
  "language_preference": "en",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### PATCH /users/profile

Update user profile.[1]

**Authentication:** Required

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "profile_photo_url": "https://example.com/new-photo.jpg",
  "language_preference": "es"
}
```

**Note:** All fields are optional

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "profile_photo_url": "https://example.com/new-photo.jpg",
  "language_preference": "es",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

### Trips

#### POST /trips

Create a new trip.[1]

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Europe Summer 2026",
  "description": "Exploring historic cities across Europe",
  "start_date": "2026-06-15",
  "end_date": "2026-06-30",
  "cover_photo_url": "https://example.com/europe.jpg",
  "is_public": false,
  "public_slug": "europe-summer-2026"
}
```

**Validation:**
- `name`: Required
- `start_date`: Required, format YYYY-MM-DD
- `end_date`: Required, format YYYY-MM-DD
- `is_public`: Boolean, default false
- Other fields optional

**Response:** `201 Created`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Europe Summer 2026",
  "description": "Exploring historic cities across Europe",
  "start_date": "2026-06-15",
  "end_date": "2026-06-30",
  "cover_photo_url": "https://example.com/europe.jpg",
  "is_public": false,
  "public_slug": "europe-summer-2026",
  "stops_count": 0,
  "total_budget": null,
  "created_at": "2026-01-03T11:45:00Z",
  "updated_at": "2026-01-03T11:45:00Z"
}
```

***

#### GET /trips

Get user's trips with pagination.[1]

**Authentication:** Required

**Query Parameters:**
- `limit` (integer, default: 20): Number of results per page
- `offset` (integer, default: 0): Pagination offset

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Europe Summer 2026",
      "description": "Exploring historic cities across Europe",
      "start_date": "2026-06-15",
      "end_date": "2026-06-30",
      "cover_photo_url": "https://example.com/europe.jpg",
      "is_public": false,
      "public_slug": null,
      "stops_count": 3,
      "total_budget": 2500.00,
      "created_at": "2026-01-03T11:45:00Z",
      "updated_at": "2026-01-03T11:45:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

***

#### GET /trips/:tripId

Get specific trip details.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Europe Summer 2026",
  "description": "Exploring historic cities across Europe",
  "start_date": "2026-06-15",
  "end_date": "2026-06-30",
  "cover_photo_url": "https://example.com/europe.jpg",
  "is_public": false,
  "public_slug": null,
  "stops_count": 3,
  "total_budget": 2500.00,
  "created_at": "2026-01-03T11:45:00Z",
  "updated_at": "2026-01-03T11:45:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Trip doesn't exist or user doesn't have access

***

#### PATCH /trips/:tripId

Update trip details.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Request Body:**
```json
{
  "name": "Europe Adventure 2026",
  "description": "Updated description",
  "is_public": true,
  "public_slug": "europe-adventure-2026"
}
```

**Note:** All fields are optional

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Europe Adventure 2026",
  "description": "Updated description",
  "start_date": "2026-06-15",
  "end_date": "2026-06-30",
  "cover_photo_url": "https://example.com/europe.jpg",
  "is_public": true,
  "public_slug": "europe-adventure-2026",
  "stops_count": 3,
  "total_budget": 2500.00,
  "created_at": "2026-01-03T11:45:00Z",
  "updated_at": "2026-01-03T11:50:00Z"
}
```

***

#### DELETE /trips/:tripId

Delete a trip.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Response:** `204 No Content`

***

#### GET /trips/:tripId/itinerary

Get complete trip itinerary with all stops, activities, and day-by-day breakdown.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Response:** `200 OK`
```json
{
  "trip": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Europe Summer 2026",
    "description": "Exploring historic cities across Europe",
    "start_date": "2026-06-15",
    "end_date": "2026-06-30",
    "cover_photo_url": "https://example.com/europe.jpg",
    "is_public": false,
    "created_at": "2026-01-03T11:45:00Z",
    "updated_at": "2026-01-03T11:45:00Z"
  },
  "stops": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "trip_id": "660e8400-e29b-41d4-a716-446655440001",
      "city_id": "880e8400-e29b-41d4-a716-446655440003",
      "city_name": "Paris",
      "country": "France",
      "cost_index": 75.50,
      "city_image": "https://example.com/paris.jpg",
      "arrival_date": "2026-06-15",
      "departure_date": "2026-06-20",
      "stop_order": 1,
      "notes": "Visit Eiffel Tower and Louvre",
      "created_at": "2026-01-03T11:45:00Z"
    }
  ],
  "day_by_day": [
    {
      "date": "2026-06-15",
      "city_name": "Paris",
      "city_id": "880e8400-e29b-41d4-a716-446655440003",
      "activities": [
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
          "activity_id": "aa0e8400-e29b-41d4-a716-446655440005",
          "activity_name": "Eiffel Tower Visit",
          "description": "Visit the iconic Eiffel Tower",
          "category": "sightseeing",
          "estimated_cost": 26.00,
          "actual_cost": null,
          "duration_minutes": 180,
          "scheduled_date": "2026-06-15",
          "scheduled_time": "10:00:00",
          "activity_order": 1,
          "notes": null,
          "image_url": "https://example.com/eiffel.jpg",
          "created_at": "2026-01-03T11:45:00Z"
        }
      ],
      "day_cost": 26.00
    }
  ],
  "total_cost": 2500.00,
  "total_days": 16
}
```

***

### Trip Stops

#### POST /trips/:tripId/stops

Add a city stop to trip itinerary.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Request Body:**
```json
{
  "city_id": "880e8400-e29b-41d4-a716-446655440003",
  "arrival_date": "2026-06-15",
  "departure_date": "2026-06-20",
  "stop_order": 1,
  "notes": "Visit Eiffel Tower and Louvre"
}
```

**Validation:**
- `city_id`: Required, must be valid city UUID
- `arrival_date`: Required, format YYYY-MM-DD
- `departure_date`: Required, format YYYY-MM-DD
- `stop_order`: Required, integer (for ordering cities)
- `notes`: Optional

**Response:** `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "city_id": "880e8400-e29b-41d4-a716-446655440003",
  "city_name": "Paris",
  "country": "France",
  "cost_index": 75.50,
  "city_image": "https://example.com/paris.jpg",
  "arrival_date": "2026-06-15",
  "departure_date": "2026-06-20",
  "stop_order": 1,
  "notes": "Visit Eiffel Tower and Louvre",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### GET /trips/:tripId/stops

Get all stops for a trip.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Response:** `200 OK`
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "trip_id": "660e8400-e29b-41d4-a716-446655440001",
    "city_id": "880e8400-e29b-41d4-a716-446655440003",
    "city_name": "Paris",
    "country": "France",
    "cost_index": 75.50,
    "city_image": "https://example.com/paris.jpg",
    "arrival_date": "2026-06-15",
    "departure_date": "2026-06-20",
    "stop_order": 1,
    "notes": "Visit Eiffel Tower and Louvre",
    "created_at": "2026-01-03T11:45:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440006",
    "trip_id": "660e8400-e29b-41d4-a716-446655440001",
    "city_id": "880e8400-e29b-41d4-a716-446655440007",
    "city_name": "Rome",
    "country": "Italy",
    "cost_index": 68.30,
    "city_image": "https://example.com/rome.jpg",
    "arrival_date": "2026-06-21",
    "departure_date": "2026-06-25",
    "stop_order": 2,
    "notes": "Colosseum and Vatican City",
    "created_at": "2026-01-03T11:45:00Z"
  }
]
```

***

#### GET /stops/:stopId

Get specific stop details.[1]

**Authentication:** Required

**Path Parameters:**
- `stopId` (UUID): Stop identifier

**Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "city_id": "880e8400-e29b-41d4-a716-446655440003",
  "city_name": "Paris",
  "country": "France",
  "cost_index": 75.50,
  "city_image": "https://example.com/paris.jpg",
  "arrival_date": "2026-06-15",
  "departure_date": "2026-06-20",
  "stop_order": 1,
  "notes": "Visit Eiffel Tower and Louvre",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### PATCH /stops/:stopId

Update stop details.[1]

**Authentication:** Required

**Path Parameters:**
- `stopId` (UUID): Stop identifier

**Request Body:**
```json
{
  "arrival_date": "2026-06-16",
  "departure_date": "2026-06-21",
  "stop_order": 2,
  "notes": "Updated notes"
}
```

**Note:** All fields are optional

**Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "city_id": "880e8400-e29b-41d4-a716-446655440003",
  "city_name": "Paris",
  "country": "France",
  "cost_index": 75.50,
  "city_image": "https://example.com/paris.jpg",
  "arrival_date": "2026-06-16",
  "departure_date": "2026-06-21",
  "stop_order": 2,
  "notes": "Updated notes",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### DELETE /stops/:stopId

Remove stop from trip.[1]

**Authentication:** Required

**Path Parameters:**
- `stopId` (UUID): Stop identifier

**Response:** `204 No Content`

***

### Activities

#### GET /cities/:cityId/activities

Get all available activities in a city.[1]

**Authentication:** Required

**Path Parameters:**
- `cityId` (UUID): City identifier

**Query Parameters:**
- `category` (string, optional): Filter by category (e.g., sightseeing, food, adventure, culture)

**Response:** `200 OK`
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "city_id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Eiffel Tower Visit",
    "description": "Visit the iconic Eiffel Tower with priority access",
    "category": "sightseeing",
    "estimated_cost": 26.00,
    "duration_minutes": 180,
    "image_url": "https://example.com/eiffel.jpg",
    "created_at": "2026-01-03T11:45:00Z"
  },
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440008",
    "city_id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Louvre Museum Tour",
    "description": "Guided tour of the world's largest art museum",
    "category": "culture",
    "estimated_cost": 45.00,
    "duration_minutes": 240,
    "image_url": "https://example.com/louvre.jpg",
    "created_at": "2026-01-03T11:45:00Z"
  }
]
```

***

#### POST /stops/:stopId/activities

Add activity to a trip stop.[1]

**Authentication:** Required

**Path Parameters:**
- `stopId` (UUID): Stop identifier

**Request Body:**
```json
{
  "activity_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "scheduled_date": "2026-06-15",
  "scheduled_time": "10:00:00",
  "actual_cost": 30.00,
  "notes": "Booked online in advance",
  "activity_order": 1
}
```

**Validation:**
- `activity_id`: Required, valid activity UUID
- `scheduled_date`: Required, format YYYY-MM-DD
- `scheduled_time`: Optional, format HH:MM:SS
- `actual_cost`: Optional, overrides estimated cost
- `activity_order`: Integer for ordering within the day

**Response:** `201 Created`
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
  "activity_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "activity_name": "Eiffel Tower Visit",
  "description": "Visit the iconic Eiffel Tower with priority access",
  "category": "sightseeing",
  "estimated_cost": 26.00,
  "actual_cost": 30.00,
  "duration_minutes": 180,
  "scheduled_date": "2026-06-15",
  "scheduled_time": "10:00:00",
  "activity_order": 1,
  "notes": "Booked online in advance",
  "image_url": "https://example.com/eiffel.jpg",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### GET /stops/:stopId/activities

Get all activities for a specific stop.[1]

**Authentication:** Required

**Path Parameters:**
- `stopId` (UUID): Stop identifier

**Response:** `200 OK`
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
    "activity_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "activity_name": "Eiffel Tower Visit",
    "description": "Visit the iconic Eiffel Tower with priority access",
    "category": "sightseeing",
    "estimated_cost": 26.00,
    "actual_cost": 30.00,
    "duration_minutes": 180,
    "scheduled_date": "2026-06-15",
    "scheduled_time": "10:00:00",
    "activity_order": 1,
    "notes": "Booked online in advance",
    "image_url": "https://example.com/eiffel.jpg",
    "created_at": "2026-01-03T11:45:00Z"
  }
]
```

***

#### PATCH /trip-activities/:activityId

Update trip activity details.[1]

**Authentication:** Required

**Path Parameters:**
- `activityId` (UUID): Trip activity identifier

**Request Body:**
```json
{
  "scheduled_date": "2026-06-16",
  "scheduled_time": "14:00:00",
  "actual_cost": 32.00,
  "notes": "Updated time slot",
  "activity_order": 2
}
```

**Note:** All fields are optional

**Response:** `200 OK`
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
  "activity_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "activity_name": "Eiffel Tower Visit",
  "description": "Visit the iconic Eiffel Tower with priority access",
  "category": "sightseeing",
  "estimated_cost": 26.00,
  "actual_cost": 32.00,
  "duration_minutes": 180,
  "scheduled_date": "2026-06-16",
  "scheduled_time": "14:00:00",
  "activity_order": 2,
  "notes": "Updated time slot",
  "image_url": "https://example.com/eiffel.jpg",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### DELETE /trip-activities/:activityId

Remove activity from trip.[1]

**Authentication:** Required

**Path Parameters:**
- `activityId` (UUID): Trip activity identifier

**Response:** `204 No Content`

***

### Cities

#### GET /cities/search

Search for cities to add to itinerary.[1]

**Authentication:** Required

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, default: 20): Number of results
- `offset` (integer, default: 0): Pagination offset

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Paris",
      "country": "France",
      "region": "Île-de-France",
      "cost_index": 75.50,
      "popularity_score": 950,
      "latitude": 48.8566,
      "longitude": 2.3522,
      "description": "The City of Light, known for its art, fashion, and culture",
      "image_url": "https://example.com/paris.jpg",
      "created_at": "2026-01-03T11:45:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

***

#### GET /cities/:cityId

Get detailed city information.[1]

**Authentication:** Required

**Path Parameters:**
- `cityId` (UUID): City identifier

**Response:** `200 OK`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "name": "Paris",
  "country": "France",
  "region": "Île-de-France",
  "cost_index": 75.50,
  "popularity_score": 950,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "description": "The City of Light, known for its art, fashion, and culture",
  "image_url": "https://example.com/paris.jpg",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

### Budget & Expenses

#### POST /trips/:tripId/expenses

Add expense to trip.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Request Body:**
```json
{
  "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
  "expense_type": "transport",
  "amount": 150.00,
  "currency": "USD",
  "expense_date": "2026-06-15",
  "description": "Flight from NYC to Paris"
}
```

**Validation:**
- `expense_type`: Required, one of: transport, accommodation, meals, other
- `amount`: Required, positive number
- `currency`: String, default "USD"
- `trip_stop_id`: Optional, associates expense with specific stop
- `expense_date`: Optional, format YYYY-MM-DD

**Response:** `201 Created`
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440009",
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
  "expense_type": "transport",
  "amount": 150.00,
  "currency": "USD",
  "expense_date": "2026-06-15",
  "description": "Flight from NYC to Paris",
  "created_at": "2026-01-03T11:45:00Z"
}
```

***

#### GET /trips/:tripId/expenses

Get all expenses for a trip.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Query Parameters:**
- `type` (string, optional): Filter by expense type (transport, accommodation, meals, other)

**Response:** `200 OK`
```json
[
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440009",
    "trip_id": "660e8400-e29b-41d4-a716-446655440001",
    "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
    "expense_type": "transport",
    "amount": 150.00,
    "currency": "USD",
    "expense_date": "2026-06-15",
    "description": "Flight from NYC to Paris",
    "created_at": "2026-01-03T11:45:00Z"
  },
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440010",
    "trip_id": "660e8400-e29b-41d4-a716-446655440001",
    "trip_stop_id": "770e8400-e29b-41d4-a716-446655440002",
    "expense_type": "accommodation",
    "amount": 600.00,
    "currency": "USD",
    "expense_date": "2026-06-15",
    "description": "Hotel for 5 nights",
    "created_at": "2026-01-03T11:45:00Z"
  }
]
```

***

#### GET /trips/:tripId/budget

Get comprehensive budget summary for trip.[1]

**Authentication:** Required

**Path Parameters:**
- `tripId` (UUID): Trip identifier

**Response:** `200 OK`
```json
{
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "transport_total": 150.00,
  "accommodation_total": 600.00,
  "meals_total": 300.00,
  "other_total": 50.00,
  "activities_total": 450.00,
  "total_expenses": 1100.00,
  "grand_total": 1550.00,
  "currency": "USD"
}
```

**Budget Breakdown:**
- `transport_total`: All transport expenses
- `accommodation_total`: All accommodation expenses
- `meals_total`: All meal expenses
- `other_total`: Other miscellaneous expenses
- `activities_total`: Sum of all trip activity costs
- `total_expenses`: Sum of all logged expenses (excluding activities)
- `grand_total`: Complete trip cost (expenses + activities)

***

### Dashboard

#### GET /dashboard

Get user dashboard with overview data.[1]

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "upcoming_trips": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Europe Summer 2026",
      "description": "Exploring historic cities across Europe",
      "start_date": "2026-06-15",
      "end_date": "2026-06-30",
      "cover_photo_url": "https://example.com/europe.jpg",
      "is_public": false,
      "stops_count": 3,
      "total_budget": 2500.00,
      "created_at": "2026-01-03T11:45:00Z",
      "updated_at": "2026-01-03T11:45:00Z"
    }
  ],
  "recent_trips": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440011",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Southeast Asia Adventure",
      "description": "Backpacking through Thailand and Vietnam",
      "start_date": "2025-12-01",
      "end_date": "2025-12-20",
      "cover_photo_url": "https://example.com/asia.jpg",
      "is_public": true,
      "stops_count": 5,
      "total_budget": 1800.00,
      "created_at": "2025-11-01T11:45:00Z",
      "updated_at": "2025-11-15T11:45:00Z"
    }
  ],
  "popular_cities": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Paris",
      "country": "France",
      "region": "Île-de-France",
      "cost_index": 75.50,
      "popularity_score": 950,
      "image_url": "https://example.com/paris.jpg"
    }
  ],
  "saved_destinations": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440007",
      "name": "Tokyo",
      "country": "Japan",
      "region": "Kanto",
      "cost_index": 82.30,
      "popularity_score": 920,
      "image_url": "https://example.com/tokyo.jpg"
    }
  ],
  "total_trips_count": 8
}
```

***

### Public Sharing

#### GET /public/trips/:slug

Get publicly shared trip by slug.[1]

**Authentication:** Not required

**Path Parameters:**
- `slug` (string): Public trip slug

**Response:** `200 OK`
```json
{
  "trip": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Europe Summer 2026",
    "description": "Exploring historic cities across Europe",
    "start_date": "2026-06-15",
    "end_date": "2026-06-30",
    "cover_photo_url": "https://example.com/europe.jpg",
    "is_public": true,
    "public_slug": "europe-summer-2026"
  },
  "stops": [...],
  "day_by_day": [...],
  "total_cost": 2500.00,
  "total_days": 16
}
```

**Note:** Returns full itinerary view for public trips. User information is not included for privacy.

***

## Error Responses

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "code": 400
}
```

### Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

***

## Data Models

### Expense Types

Valid expense types for trip budgeting:
- `transport`: Flights, trains, buses, car rentals
- `accommodation`: Hotels, hostels, Airbnb
- `meals`: Food and dining expenses
- `other`: Miscellaneous expenses

### Activity Categories

Common activity categories:
- `sightseeing`: Tourist attractions, landmarks
- `food`: Food tours, restaurants, culinary experiences
- `adventure`: Hiking, water sports, extreme activities
- `culture`: Museums, galleries, historical sites
- `entertainment`: Shows, concerts, nightlife
- `shopping`: Markets, malls, boutiques
- `nature`: Parks, beaches, natural wonders

***

## Rate Limiting

API requests are rate-limited to ensure fair usage:
- **Authenticated requests**: 1000 requests per hour
- **Public endpoints**: 100 requests per hour per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641225600
```

***

## Best Practices

### Date Formats
- Always use ISO 8601 format: `YYYY-MM-DD` for dates
- Time format: `HH:MM:SS` in 24-hour format
- Timestamps: RFC3339 format with timezone

### UUIDs
- All entity IDs use UUID v4 format
- Always validate UUID format before making requests

### Pagination
- Use `limit` and `offset` parameters consistently
- Maximum `limit` is 100
- Default `limit` is 20

### Trip Planning Workflow

1. **Create trip** → POST `/trips`
2. **Add stops** → POST `/trips/:tripId/stops`
3. **Search activities** → GET `/cities/:cityId/activities`
4. **Add activities** → POST `/stops/:stopId/activities`
5. **Track expenses** → POST `/trips/:tripId/expenses`
6. **View itinerary** → GET `/trips/:tripId/itinerary`
7. **Check budget** → GET `/trips/:tripId/budget`
8. **Share trip** → PATCH `/trips/:tripId` (set `is_public: true`)

**Last Updated:** January 3, 2026