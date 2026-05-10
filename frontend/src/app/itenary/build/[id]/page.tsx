"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/app/axiosconfig";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";

interface Stop {
  id: string;
  city_id: string;
  city_name: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  stop_order: number;
  notes: string;
  cost_index?: number;
  city_image?: string;
}

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo_url: string;
  is_public: boolean;
  stops_count: number;
  total_budget: number;
}

interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity_score: number;
  latitude: number;
  longitude: number;
  description: string;
  image_url: string;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [newStop, setNewStop] = useState({
    city_id: "",
    arrival_date: "",
    departure_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchTripDetails();
    fetchStops();
  }, [tripId]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCities();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchTripDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrip(response.data);
    } catch (err) {
      console.error("Error fetching trip:", err);
      setError("Failed to load trip details");
    }
  };

  const fetchStops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/trips/${tripId}/stops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStops(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stops:", err);
      setLoading(false);
    }
  };

  const searchCities = async () => {
    try {
      setSearching(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(
        `/cities/search?q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error("Error searching cities:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setNewStop({ ...newStop, city_id: city.id });
    setSearchQuery(city.name);
    setSearchResults([]);
  };

  const handleClearCity = () => {
    setSelectedCity(null);
    setSearchQuery("");
    setNewStop({ ...newStop, city_id: "" });
  };

  const handleAddStop = async () => {
    if (!newStop.city_id || !newStop.arrival_date || !newStop.departure_date) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(newStop.departure_date) < new Date(newStop.arrival_date)) {
      setError("Departure date must be after arrival date");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const stopOrder = Math.max(...stops.map((s) => s.stop_order), 0) + 1;

      const response = await axiosInstance.post(
        `/trips/${tripId}/stops`,
        {
          city_id: newStop.city_id,
          arrival_date: newStop.arrival_date,
          departure_date: newStop.departure_date,
          stop_order: stopOrder,
          notes: newStop.notes || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStops([...stops, response.data]);
      setNewStop({
        city_id: "",
        arrival_date: "",
        departure_date: "",
        notes: "",
      });
      setSelectedCity(null);
      setSearchQuery("");
      setShowAddSection(false);
      setError("");
    } catch (err: any) {
      setError("Failed to add stop. Please try again.");
      console.error("Error adding stop:", err);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/stops/${stopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStops(stops.filter((s) => s.id !== stopId));
    } catch (err) {
      setError("Failed to delete stop. Please try again.");
      console.error("Error deleting stop:", err);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="mx-auto font-inter px-4 sm:px-6 lg:px-8 py-5 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading itinerary...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto font-inter px-4 sm:px-6 lg:px-8 py-5 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between w-full mb-6 bg-white p-4 rounded-lg shadow-sm">
        <Logo />
        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"></div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip?.name}</h1>
            <p className="text-sm text-gray-600">
              {trip && `${calculateDays(trip.start_date, trip.end_date)} days`}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {trip && (
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-5 mb-8 border border-accent/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Duration
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {trip.start_date} to {trip.end_date}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Stops
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {stops.length} cities
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  ${trip.total_budget?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5 mb-8">
          {stops.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No stops added yet</p>
              <button
                onClick={() => setShowAddSection(true)}
                className="text-accent font-medium hover:underline"
              >
                Add your first stop
              </button>
            </div>
          ) : (
            stops
              .sort((a, b) => a.stop_order - b.stop_order)
              .map((stop, index) => (
                <div
                  key={stop.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stop.city_name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {stop.country}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete stop"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Date Range
                      </label>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">{stop.arrival_date}</span>
                        <span className="text-gray-400">to</span>
                        <span className="font-medium">
                          {stop.departure_date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateDays(stop.arrival_date, stop.departure_date)}{" "}
                        days
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Cost Index
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {(stop.cost_index || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Per day estimate</p>
                    </div>
                  </div>

                  {stop.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700">{stop.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/itenary/${stop.id}`)}
                      className="flex-1 px-4 py-2 bg-accent/10 text-accent hover:bg-accent/20 font-medium rounded-lg transition-colors text-sm"
                    >
                      View Activities
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {showAddSection && (
          <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Stop
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a city..."
                      disabled={!!selectedCity}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100"
                    />
                    {selectedCity && (
                      <button
                        onClick={handleClearCity}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {searching && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                      <p className="text-sm text-gray-600">Searching...</p>
                    </div>
                  )}

                  {searchResults.length > 0 && !selectedCity && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10">
                      {searchResults.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleSelectCity(city)}
                          className="w-full p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            {city.image_url && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={city.image_url}
                                  alt={city.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {city.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {city.region}, {city.country}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  Cost: ${city.cost_index.toFixed(0)}/day
                                </span>
                                <span className="text-xs text-accent">
                                  ★ {city.popularity_score}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedCity && (
                    <div className="mt-3 p-4 bg-white border border-accent/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        {selectedCity.image_url && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={selectedCity.image_url}
                              alt={selectedCity.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {selectedCity.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedCity.region}, {selectedCity.country}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newStop.arrival_date}
                    onChange={(e) =>
                      setNewStop({ ...newStop, arrival_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newStop.departure_date}
                    onChange={(e) =>
                      setNewStop({
                        ...newStop,
                        departure_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newStop.notes}
                  onChange={(e) =>
                    setNewStop({ ...newStop, notes: e.target.value })
                  }
                  placeholder="Add any notes for this stop..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddSection(false);
                    setNewStop({
                      city_id: "",
                      arrival_date: "",
                      departure_date: "",
                      notes: "",
                    });
                    setSelectedCity(null);
                    setSearchQuery("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStop}
                  disabled={!selectedCity}
                  className="flex-1 px-4 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {!showAddSection && (
          <button
            onClick={() => setShowAddSection(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-2 text-accent font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add another Stop
          </button>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-6 py-2.5 rounded-lg font-semibold"
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/trips/user/${trip?.id}`)}
              variant="outline"
              className="px-6 py-2.5 rounded-lg font-semibold"
            >
              View Trip Details
            </Button>
            <Button
              onClick={() => router.push("/home")}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-lg font-semibold"
            >
              Done Building
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;