import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service objects organized by domain
export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: { full_name?: string; profile_photo_url?: string; language_preference?: string }) =>
    api.patch("/users/profile", data),
};

export const tripsApi = {
  createTrip: (data: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_photo_url?: string;
    is_public?: boolean;
    public_slug?: string;
  }) => api.post("/trips", data),
  getTrips: (params?: { limit?: number; offset?: number }) =>
    api.get("/trips", { params }),
  getTripById: (tripId: string) => api.get(`/trips/${tripId}`),
  updateTrip: (
    tripId: string,
    data: {
      name?: string;
      description?: string;
      is_public?: boolean;
      public_slug?: string;
    }
  ) => api.patch(`/trips/${tripId}`, data),
  deleteTrip: (tripId: string) => api.delete(`/trips/${tripId}`),
  getItinerary: (tripId: string) => api.get(`/trips/${tripId}/itinerary`),
  getBudget: (tripId: string) => api.get(`/trips/${tripId}/budget`),
  getExpenses: (tripId: string, type?: string) =>
    api.get(`/trips/${tripId}/expenses`, { params: { type } }),
};

export const stopsApi = {
  addStop: (
    tripId: string,
    data: {
      city_id: string;
      arrival_date: string;
      departure_date: string;
      stop_order: number;
      notes?: string;
    }
  ) => api.post(`/trips/${tripId}/stops`, data),
  getStops: (tripId: string) => api.get(`/trips/${tripId}/stops`),
  getStopById: (stopId: string) => api.get(`/stops/${stopId}`),
  updateStop: (
    stopId: string,
    data: {
      arrival_date?: string;
      departure_date?: string;
      stop_order?: number;
      notes?: string;
    }
  ) => api.patch(`/stops/${stopId}`, data),
  deleteStop: (stopId: string) => api.delete(`/stops/${stopId}`),
};

export const activitiesApi = {
  getCityActivities: (cityId: string, category?: string) =>
    api.get(`/cities/${cityId}/activities`, { params: { category } }),
  addActivity: (
    stopId: string,
    data: {
      activity_id: string;
      scheduled_date: string;
      scheduled_time?: string;
      actual_cost?: number;
      notes?: string;
      activity_order?: number;
    }
  ) => api.post(`/stops/${stopId}/activities`, data),
  getStopActivities: (stopId: string) => api.get(`/stops/${stopId}/activities`),
  updateActivity: (
    activityId: string,
    data: {
      scheduled_date?: string;
      scheduled_time?: string;
      actual_cost?: number;
      notes?: string;
      activity_order?: number;
    }
  ) => api.patch(`/trip-activities/${activityId}`, data),
  deleteActivity: (activityId: string) => api.delete(`/trip-activities/${activityId}`),
};

export const citiesApi = {
  searchCities: (query: string, limit: number = 20, offset: number = 0) =>
    api.get("/cities/search", { params: { q: query, limit, offset } }),
  getCityById: (cityId: string) => api.get(`/cities/${cityId}`),
};

export const expensesApi = {
  addExpense: (
    tripId: string,
    data: {
      trip_stop_id?: string;
      expense_type: "transport" | "accommodation" | "meals" | "other";
      amount: number;
      currency?: string;
      expense_date?: string;
      description?: string;
    }
  ) => api.post(`/trips/${tripId}/expenses`, data),
  getExpenses: (tripId: string, type?: string) =>
    api.get(`/trips/${tripId}/expenses`, { params: { type } }),
  updateExpense: (expenseId: string, data: any) =>
    api.patch(`/expenses/${expenseId}`, data),
  deleteExpense: (expenseId: string) => api.delete(`/expenses/${expenseId}`),
};

export const dashboardApi = {
  getDashboard: () => api.get("/dashboard"),
};

export const publicApi = {
  getPublicTrip: (slug: string) => api.get(`/public/trips/${slug}`),
};

export default api;
