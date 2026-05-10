package models

import (
	"time"

	"github.com/google/uuid"
)

// Request/Response Types

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"full_name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type UserResponse struct {
	ID              uuid.UUID `json:"id"`
	Email           string    `json:"email"`
	FullName        string    `json:"full_name"`
	ProfilePhotoURL *string   `json:"profile_photo_url,omitempty"`
	Language        string    `json:"language_preference"`
	CreatedAt       time.Time `json:"created_at"`
}

type UpdateProfileRequest struct {
	FullName        *string `json:"full_name,omitempty"`
	ProfilePhotoURL *string `json:"profile_photo_url,omitempty"`
	Language        *string `json:"language_preference,omitempty"`
}

// Trip Types

type CreateTripRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   *string `json:"description,omitempty"`
	StartDate     string  `json:"start_date" binding:"required"` // YYYY-MM-DD
	EndDate       string  `json:"end_date" binding:"required"`
	CoverPhotoURL *string `json:"cover_photo_url,omitempty"`
	IsPublic      bool    `json:"is_public"`
	PublicSlug    *string `json:"public_slug,omitempty"`
}

type UpdateTripRequest struct {
	Name          *string `json:"name,omitempty"`
	Description   *string `json:"description,omitempty"`
	StartDate     *string `json:"start_date,omitempty"`
	EndDate       *string `json:"end_date,omitempty"`
	CoverPhotoURL *string `json:"cover_photo_url,omitempty"`
	IsPublic      *bool   `json:"is_public,omitempty"`
	PublicSlug    *string `json:"public_slug,omitempty"`
}

type TripResponse struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	Name          string    `json:"name"`
	Description   *string   `json:"description,omitempty"`
	StartDate     string    `json:"start_date"`
	EndDate       string    `json:"end_date"`
	CoverPhotoURL *string   `json:"cover_photo_url,omitempty"`
	IsPublic      bool      `json:"is_public"`
	PublicSlug    *string   `json:"public_slug,omitempty"`
	StopsCount    int       `json:"stops_count,omitempty"`
	TotalBudget   *float64  `json:"total_budget,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Trip Stop Types

type CreateTripStopRequest struct {
	CityID        uuid.UUID `json:"city_id" binding:"required"`
	ArrivalDate   string    `json:"arrival_date" binding:"required"`
	DepartureDate string    `json:"departure_date" binding:"required"`
	StopOrder     int       `json:"stop_order" binding:"required"`
	Notes         *string   `json:"notes,omitempty"`
}

type UpdateTripStopRequest struct {
	ArrivalDate   *string `json:"arrival_date,omitempty"`
	DepartureDate *string `json:"departure_date,omitempty"`
	StopOrder     *int    `json:"stop_order,omitempty"`
	Notes         *string `json:"notes,omitempty"`
}

type TripStopResponse struct {
	ID            uuid.UUID `json:"id"`
	TripID        uuid.UUID `json:"trip_id"`
	CityID        uuid.UUID `json:"city_id"`
	CityName      string    `json:"city_name"`
	Country       string    `json:"country"`
	CostIndex     float64   `json:"cost_index"`
	CityImage     *string   `json:"city_image,omitempty"`
	ArrivalDate   string    `json:"arrival_date"`
	DepartureDate string    `json:"departure_date"`
	StopOrder     int       `json:"stop_order"`
	Notes         *string   `json:"notes,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// Activity Types

type CreateActivityRequest struct {
	CityID          uuid.UUID `json:"city_id" binding:"required"`
	Name            string    `json:"name" binding:"required"`
	Description     *string   `json:"description,omitempty"`
	Category        string    `json:"category" binding:"required"`
	EstimatedCost   float64   `json:"estimated_cost"`
	DurationMinutes *int      `json:"duration_minutes,omitempty"`
	ImageURL        *string   `json:"image_url,omitempty"`
}

type ActivityResponse struct {
	ID              uuid.UUID `json:"id"`
	CityID          uuid.UUID `json:"city_id"`
	Name            string    `json:"name"`
	Description     *string   `json:"description,omitempty"`
	Category        string    `json:"category"`
	EstimatedCost   float64   `json:"estimated_cost"`
	DurationMinutes *int      `json:"duration_minutes,omitempty"`
	ImageURL        *string   `json:"image_url,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// Trip Activity Types

type CreateTripActivityRequest struct {
	ActivityID    uuid.UUID `json:"activity_id" binding:"required"`
	ScheduledDate string    `json:"scheduled_date" binding:"required"`
	ScheduledTime *string   `json:"scheduled_time,omitempty"`
	ActualCost    *float64  `json:"actual_cost,omitempty"`
	Notes         *string   `json:"notes,omitempty"`
	ActivityOrder int       `json:"activity_order"`
}

type UpdateTripActivityRequest struct {
	ScheduledDate *string  `json:"scheduled_date,omitempty"`
	ScheduledTime *string  `json:"scheduled_time,omitempty"`
	ActualCost    *float64 `json:"actual_cost,omitempty"`
	Notes         *string  `json:"notes,omitempty"`
	ActivityOrder *int     `json:"activity_order,omitempty"`
}

type TripActivityResponse struct {
	ID              uuid.UUID `json:"id"`
	TripStopID      uuid.UUID `json:"trip_stop_id"`
	ActivityID      uuid.UUID `json:"activity_id"`
	ActivityName    string    `json:"activity_name"`
	Description     *string   `json:"description,omitempty"`
	Category        string    `json:"category"`
	EstimatedCost   float64   `json:"estimated_cost"`
	ActualCost      *float64  `json:"actual_cost,omitempty"`
	DurationMinutes *int      `json:"duration_minutes,omitempty"`
	ScheduledDate   string    `json:"scheduled_date"`
	ScheduledTime   *string   `json:"scheduled_time,omitempty"`
	ActivityOrder   int       `json:"activity_order"`
	Notes           *string   `json:"notes,omitempty"`
	ImageURL        *string   `json:"image_url,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// Expense Types

type CreateExpenseRequest struct {
	TripStopID  *uuid.UUID `json:"trip_stop_id,omitempty"`
	ExpenseType string     `json:"expense_type" binding:"required"` // transport, accommodation, meals, other
	Amount      float64    `json:"amount" binding:"required"`
	Currency    string     `json:"currency"`
	ExpenseDate *string    `json:"expense_date,omitempty"`
	Description *string    `json:"description,omitempty"`
}

type ExpenseResponse struct {
	ID          uuid.UUID  `json:"id"`
	TripID      uuid.UUID  `json:"trip_id"`
	TripStopID  *uuid.UUID `json:"trip_stop_id,omitempty"`
	ExpenseType string     `json:"expense_type"`
	Amount      float64    `json:"amount"`
	Currency    string     `json:"currency"`
	ExpenseDate *string    `json:"expense_date,omitempty"`
	Description *string    `json:"description,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type BudgetSummaryResponse struct {
	TripID             uuid.UUID `json:"trip_id"`
	TransportTotal     float64   `json:"transport_total"`
	AccommodationTotal float64   `json:"accommodation_total"`
	MealsTotal         float64   `json:"meals_total"`
	OtherTotal         float64   `json:"other_total"`
	ActivitiesTotal    float64   `json:"activities_total"`
	TotalExpenses      float64   `json:"total_expenses"`
	GrandTotal         float64   `json:"grand_total"`
	Currency           string    `json:"currency"`
}

// City Types

type CityResponse struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	Country         string    `json:"country"`
	Region          *string   `json:"region,omitempty"`
	CostIndex       float64   `json:"cost_index"`
	PopularityScore int       `json:"popularity_score"`
	Latitude        *float64  `json:"latitude,omitempty"`
	Longitude       *float64  `json:"longitude,omitempty"`
	Description     *string   `json:"description,omitempty"`
	ImageURL        *string   `json:"image_url,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type SearchCitiesRequest struct {
	Query  string `form:"q" binding:"required"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

// Dashboard Types

type DashboardResponse struct {
	UpcomingTrips     []TripResponse `json:"upcoming_trips"`
	RecentTrips       []TripResponse `json:"recent_trips"`
	PopularCities     []CityResponse `json:"popular_cities"`
	SavedDestinations []CityResponse `json:"saved_destinations"`
	TotalTripsCount   int            `json:"total_trips_count"`
}

// Itinerary View Types

type ItineraryDayView struct {
	Date       string                 `json:"date"`
	CityName   string                 `json:"city_name"`
	CityID     uuid.UUID              `json:"city_id"`
	Activities []TripActivityResponse `json:"activities"`
	DayCost    float64                `json:"day_cost"`
}

type ItineraryResponse struct {
	Trip      TripResponse       `json:"trip"`
	Stops     []TripStopResponse `json:"stops"`
	DayByDay  []ItineraryDayView `json:"day_by_day"`
	TotalCost float64            `json:"total_cost"`
	TotalDays int                `json:"total_days"`
}

// Error Response

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code"`
}

// Pagination

type PaginationMeta struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
	Total  int `json:"total,omitempty"`
}

type PaginatedResponse struct {
	Data       interface{}    `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}
