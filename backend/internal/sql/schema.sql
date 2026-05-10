-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_photo_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Cities table (master data)
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    cost_index DECIMAL(5,2) DEFAULT 50.00, -- relative cost index
    popularity_score INTEGER DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cities_country ON cities(country);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_popularity ON cities(popularity_score DESC);

-- Activities table (master data)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- sightseeing, food, adventure, culture, etc
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    duration_minutes INTEGER, -- estimated duration
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_cost ON activities(estimated_cost);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_photo_url TEXT,
    is_public BOOLEAN DEFAULT false,
    public_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trips_public_slug ON trips(public_slug) WHERE is_public = true;
CREATE INDEX idx_trips_is_public ON trips(is_public) WHERE is_public = true;

-- Trip stops (cities in a trip itinerary)
CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    stop_order INTEGER NOT NULL, -- order of cities in the trip
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_trip_stops_order ON trip_stops(trip_id, stop_order);
CREATE UNIQUE INDEX idx_trip_stops_unique_order ON trip_stops(trip_id, stop_order);

-- Trip activities (activities assigned to stops)
CREATE TABLE trip_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_stop_id UUID NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    actual_cost DECIMAL(10,2), -- user can override estimated cost
    notes TEXT,
    activity_order INTEGER DEFAULT 0, -- order within the day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_activities_stop_id ON trip_activities(trip_stop_id);
CREATE INDEX idx_trip_activities_date ON trip_activities(scheduled_date);
CREATE INDEX idx_trip_activities_order ON trip_activities(trip_stop_id, scheduled_date, activity_order);

-- Trip expenses (additional costs like transport, accommodation, meals)
CREATE TABLE trip_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE, -- optional: specific to a stop
    expense_type VARCHAR(50) NOT NULL, -- transport, accommodation, meals, other
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    expense_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_expenses_trip_id ON trip_expenses(trip_id);
CREATE INDEX idx_trip_expenses_type ON trip_expenses(expense_type);
CREATE INDEX idx_trip_expenses_date ON trip_expenses(expense_date);

-- Saved destinations (user wishlist)
CREATE TABLE saved_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, city_id)
);

CREATE INDEX idx_saved_destinations_user_id ON saved_destinations(user_id);

-- Trip shares (for collaborative planning or viewing)
CREATE TABLE trip_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'view', -- view, edit
    share_token VARCHAR(255) UNIQUE, -- for anonymous sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX idx_trip_shares_user_id ON trip_shares(shared_with_user_id);
CREATE INDEX idx_trip_shares_token ON trip_shares(share_token);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
