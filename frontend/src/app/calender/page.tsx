"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Loader,
} from "lucide-react";
import axiosInstance from "@/app/axiosconfig";
import Link from "next/link";

interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  total_budget?: number;
  cover_photo_url?: string;
}

const Page = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripColors, setTripColors] = useState<{ [key: string]: string }>({});

  // Color palette for trips
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ];

  const getRandomColor = (tripId: string) => {
    if (tripColors[tripId]) {
      return tripColors[tripId];
    }
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setTripColors((prev) => ({ ...prev, [tripId]: randomColor }));
    return randomColor;
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/trips", {
        params: { limit: 50 },
      });
      const data = response.data.data || [];
      setTrips(data);
      // Pre-assign colors for all trips
      const colors: { [key: string]: string } = {};
      const colorPalette = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-teal-500",
        "bg-indigo-500",
        "bg-cyan-500",
      ];
      data.forEach((trip: Trip, index: number) => {
        colors[trip.id] = colorPalette[index % colorPalette.length];
      });
      setTripColors(colors);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTripForDate = (date: Date | null) => {
    if (!date || trips.length === 0) return [];

    const dateStr = date.toISOString().split("T")[0];
    return trips.filter((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const days = getDaysInMonth(currentMonth);
  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white font-inter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 font-space-grotesk">
              Calendar
            </h1>
            <Link href="/trips/createtrip">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold text-sm">
                <Plus className="w-4 h-4" />
                New Trip
              </button>
            </Link>
          </div>
        </div>
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          />
        </div>

        {/* Calendar Container */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
              <button
                onClick={previousMonth}
                className="p-1.5 hover:bg-gray-100 rounded transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">
                {monthYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-gray-100 rounded transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const tripsForDay = getTripForDate(day);
                  const isToday =
                    day && day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-21 border rounded-md p-1.5 ${
                        day
                          ? "bg-white hover:bg-gray-50 border-gray-200"
                          : "bg-gray-50 border-transparent"
                      } ${isToday ? "ring-2 ring-accent ring-inset" : ""} transition cursor-pointer`}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-xs font-medium mb-1 ${
                              isToday ? "text-accent" : "text-gray-700"
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {tripsForDay.slice(0, 2).map((trip) => {
                              const isStart =
                                day.toISOString().split("T")[0] ===
                                trip.start_date;
                              const tripColor =
                                tripColors[trip.id] || "bg-accent";

                              return (
                                <div
                                  key={trip.id}
                                  onClick={() => setSelectedTrip(trip)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${tripColor} text-white truncate font-medium hover:opacity-80 transition cursor-pointer`}
                                  title={trip.name}
                                >
                                  {isStart ? trip.name : ""}
                                </div>
                              );
                            })}
                            {tripsForDay.length > 2 && (
                              <div
                                onClick={() => setSelectedTrip(tripsForDay[2])}
                                className="text-[10px] text-gray-500 px-1 hover:text-gray-700 cursor-pointer"
                              >
                                +{tripsForDay.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="mt-4 flex items-center justify-between">
          {/* Legend - Simplified */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-accent rounded"></div>
              <span className="text-gray-600">Your Trips</span>
            </div>
          </div>

          {/* Actions */}
          <Link href="/trips/createtrip">
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition">
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          </Link>
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-accent text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedTrip.name}</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Date Range */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Duration
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedTrip.start_date)} -{" "}
                    {formatDate(selectedTrip.end_date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getDuration(
                      selectedTrip.start_date,
                      selectedTrip.end_date,
                    )}{" "}
                    days
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedTrip.description && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedTrip.description}
                  </p>
                </div>
              )}

              {/* Budget */}
              {selectedTrip.total_budget && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Budget
                    </p>
                    <p className="text-sm text-gray-600">
                      ${selectedTrip.total_budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link
                  href={`/itinerary/build/${selectedTrip.id}`}
                  className="flex-1"
                >
                  <button className="w-full px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition">
                    View Itinerary
                  </button>
                </Link>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
