package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/database/models"
	"oodo.hackathon/internal/middlewares"
)

// ExpensesHandler handles expense-related endpoints
type ExpensesHandler struct {
	queries db.Querier
}

// NewExpensesHandler creates a new expenses handler
func NewExpensesHandler(queries db.Querier) *ExpensesHandler {
	return &ExpensesHandler{
		queries: queries,
	}
}

// CreateExpense adds an expense to a trip
// POST /trips/:tripId/expenses
func (h *ExpensesHandler) CreateExpense(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tripID, err := uuid.Parse(c.Param("tripId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trip ID"})
		return
	}

	// Verify trip exists and belongs to user
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	var req models.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate expense type
	validTypes := map[string]bool{
		"transport":     true,
		"accommodation": true,
		"meals":         true,
		"other":         true,
	}
	if !validTypes[req.ExpenseType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense_type. Must be one of: transport, accommodation, meals, other"})
		return
	}

	// Parse expense date if provided
	var expenseDate pgtype.Date
	if req.ExpenseDate != nil {
		date, err := parseDate(*req.ExpenseDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expense_date format. Use YYYY-MM-DD"})
			return
		}
		expenseDate = pgtype.Date{Time: date, Valid: true}
	}

	// Parse trip_stop_id if provided
	var tripStopID pgtype.UUID
	if req.TripStopID != nil {
		copy(tripStopID.Bytes[:], req.TripStopID[:])
		tripStopID.Valid = true
	}

	// Convert amount to Numeric
	amount := parseFloat64ToNumeric(req.Amount)

	// Set default currency
	currency := "USD"
	if req.Currency != "" {
		currency = req.Currency
	}

	// Create expense
	expense, err := h.queries.CreateTripExpense(ctx, db.CreateTripExpenseParams{
		TripID:      tripID,
		TripStopID:  tripStopID,
		ExpenseType: req.ExpenseType,
		Amount:      amount,
		Currency:    &currency,
		ExpenseDate: expenseDate,
		Description: req.Description,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create expense"})
		return
	}

	// Format response
	amountFloat := parseNumericToFloat64(expense.Amount)
	expenseDateStr := ""
	if expense.ExpenseDate.Valid {
		expenseDateStr = expense.ExpenseDate.Time.Format("2006-01-02")
	}

	var tripStopIDRes *uuid.UUID
	if expense.TripStopID.Valid {
		id, err := uuid.Parse(expense.TripStopID.String())
		if err == nil {
			tripStopIDRes = &id
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":           expense.ID,
		"trip_id":      expense.TripID,
		"trip_stop_id": tripStopIDRes,
		"expense_type": expense.ExpenseType,
		"amount":       amountFloat,
		"currency":     expense.Currency,
		"expense_date": convertExpenseDate(expenseDateStr),
		"description":  expense.Description,
		"created_at":   expense.CreatedAt,
	})
}

// GetExpenses retrieves all expenses for a trip with optional type filter
// GET /trips/:tripId/expenses?type=transport
func (h *ExpensesHandler) GetExpenses(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tripID, err := uuid.Parse(c.Param("tripId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trip ID"})
		return
	}

	// Verify trip exists and belongs to user
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	// Get expenses, optionally filtered by type
	expenseType := c.Query("type")
	var expenses []db.TripExpense

	if expenseType != "" {
		// Validate expense type
		validTypes := map[string]bool{
			"transport":     true,
			"accommodation": true,
			"meals":         true,
			"other":         true,
		}
		if !validTypes[expenseType] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type. Must be one of: transport, accommodation, meals, other"})
			return
		}

		var err error
		expenses, err = h.queries.GetTripExpensesByType(ctx, db.GetTripExpensesByTypeParams{
			TripID:      tripID,
			ExpenseType: expenseType,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch expenses"})
			return
		}
	} else {
		var err error
		expenses, err = h.queries.GetTripExpenses(ctx, tripID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch expenses"})
			return
		}
	}

	// Format response
	var response []gin.H
	for _, expense := range expenses {
		amountFloat := parseNumericToFloat64(expense.Amount)
		expenseDateStr := ""
		if expense.ExpenseDate.Valid {
			expenseDateStr = expense.ExpenseDate.Time.Format("2006-01-02")
		}

		var tripStopIDRes *uuid.UUID
		if expense.TripStopID.Valid {
			id, err := uuid.Parse(expense.TripStopID.String())
			if err == nil {
				tripStopIDRes = &id
			}
		}

		response = append(response, gin.H{
			"id":           expense.ID,
			"trip_id":      expense.TripID,
			"trip_stop_id": tripStopIDRes,
			"expense_type": expense.ExpenseType,
			"amount":       amountFloat,
			"currency":     expense.Currency,
			"expense_date": convertExpenseDate(expenseDateStr),
			"description":  expense.Description,
			"created_at":   expense.CreatedAt,
		})
	}

	if response == nil {
		response = []gin.H{}
	}

	c.JSON(http.StatusOK, response)
}

// GetBudgetSummary retrieves comprehensive budget summary for trip
// GET /trips/:tripId/budget
func (h *ExpensesHandler) GetBudgetSummary(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tripID, err := uuid.Parse(c.Param("tripId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trip ID"})
		return
	}

	// Verify trip exists and belongs to user
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	// Get expenses budget summary
	budgetSummary, err := h.queries.GetTripBudgetSummary(ctx, tripID)
	if err != nil {
		// If no expenses exist, return zeros
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusOK, gin.H{
				"trip_id":             tripID,
				"transport_total":     0.0,
				"accommodation_total": 0.0,
				"meals_total":         0.0,
				"other_total":         0.0,
				"activities_total":    0.0,
				"total_expenses":      0.0,
				"grand_total":         0.0,
				"currency":            "USD",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch budget summary"})
		return
	}

	// Get activities cost
	transportTotal := float64(budgetSummary.TransportTotal)
	accommodationTotal := float64(budgetSummary.AccommodationTotal)
	mealsTotal := float64(budgetSummary.MealsTotal)
	otherTotal := float64(budgetSummary.OtherTotal)
	totalExpenses := float64(budgetSummary.TotalExpenses)

	// Get activities total cost
	activitiesCost := 0.0
	activitiesSummary, err := h.queries.GetTripActivitiesCost(ctx, tripID)
	if err == nil {
		activitiesCost = float64(activitiesSummary.TotalActivitiesCost)
	}

	// Calculate grand total
	grandTotal := totalExpenses + activitiesCost

	c.JSON(http.StatusOK, gin.H{
		"trip_id":             tripID,
		"transport_total":     transportTotal,
		"accommodation_total": accommodationTotal,
		"meals_total":         mealsTotal,
		"other_total":         otherTotal,
		"activities_total":    activitiesCost,
		"total_expenses":      totalExpenses,
		"grand_total":         grandTotal,
		"currency":            "USD",
	})
}

// Helper function to convert expense date string to *string (or nil if empty)
func convertExpenseDate(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
