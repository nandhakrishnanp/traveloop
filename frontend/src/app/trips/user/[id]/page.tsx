"use client";

import { useState } from "react";
import { Search, Calendar, MapPin, DollarSign, ArrowRight, X, SlidersHorizontal } from "lucide-react";

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  cities: string[];
  budget: number;
  status: "ongoing" | "upcoming" | "completed";
  imageUrl: string;
  description: string;
  activities: number;
}

interface PageProps {}

const Page = ({}: PageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [sortBy, setSortBy] = useState("date");

  const trips: Trip[] = [
    {
      id: 1,
      name: "Southeast Asia Adventure",
      startDate: "2026-01-10",
      endDate: "2026-01-20",
      cities: ["Bangkok", "Singapore", "Bali"],
      budget: 2500,
      status: "ongoing",
      imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
      description: "Explore the vibrant cultures, pristine beaches, and bustling markets of Southeast Asia.",
      activities: 12,
    },
    {
      id: 2,
      name: "European Summer Tour",
      startDate: "2026-02-05",
      endDate: "2026-02-18",
      cities: ["Paris", "Rome", "Barcelona", "Amsterdam"],
      budget: 4200,
      status: "ongoing",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      description: "A romantic journey through Europe's most iconic cities and landmarks.",
      activities: 18,
    },
  ];

  const upcomingTrips: Trip[] = [
    {
      id: 3,
      name: "Tokyo Winter Escape",
      startDate: "2026-03-10",
      endDate: "2026-03-20",
      cities: ["Tokyo", "Kyoto", "Osaka"],
      budget: 3100,
      status: "upcoming",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      description: "Experience cherry blossoms, ancient temples, and modern technology.",
      activities: 15,
    },
    {
      id: 4,
      name: "Australian Outback",
      startDate: "2026-04-01",
      endDate: "2026-04-15",
      cities: ["Sydney", "Melbourne", "Brisbane"],
      budget: 3800,
      status: "upcoming",
      imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
      description: "Discover stunning coastlines, wildlife, and the Great Barrier Reef.",
      activities: 14,
    },
  ];

  const completedTrips: Trip[] = [
    {
      id: 5,
      name: "Dubai Luxury Getaway",
      startDate: "2025-11-15",
      endDate: "2025-11-22",
      cities: ["Dubai", "Abu Dhabi"],
      budget: 5000,
      status: "completed",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
      description: "Luxury shopping, desert safaris, and world-class dining experiences.",
      activities: 10,
    },
    {
      id: 6,
      name: "Iceland Northern Lights",
      startDate: "2025-10-10",
      endDate: "2025-10-18",
      cities: ["Reykjavik", "Akureyri"],
      budget: 3500,
      status: "completed",
      imageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80",
      description: "Chase the aurora borealis and explore volcanic landscapes.",
      activities: 9,
    },
    {
      id: 7,
      name: "New York City Explorer",
      startDate: "2025-09-05",
      endDate: "2025-09-12",
      cities: ["New York"],
      budget: 2800,
      status: "completed",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
      description: "Broadway shows, Central Park, and the iconic NYC skyline.",
      activities: 11,
    },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div
      onClick={() => setSelectedTrip(trip)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={trip.imageUrl}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl mb-1">{trip.name}</h3>
          <p className="text-white/90 text-sm">{trip.cities.join(" • ")}</p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-green-600" />
            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-green-700">
            <DollarSign className="w-4 h-4" />
            <span>{trip.budget.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">{trip.activities} activities</span>
          <button className="text-green-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search & Filters */}
      <div className="bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <button className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition font-semibold shadow-md">
              + New Trip
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trips by name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="budget">Sort by Budget</option>
                <option value="name">Sort by Name</option>
              </select>
              <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-medium text-gray-700 shadow-sm">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Ongoing Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-green-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Ongoing</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {trips.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>

        {/* Upcoming Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {upcomingTrips.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>

        {/* Completed Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Completed</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
              {completedTrips.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      </div>

      {/* View Modal */}
      {selectedTrip && (
        <div 
          onClick={() => setSelectedTrip(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="relative h-80">
              <img
                src={selectedTrip.imageUrl}
                alt={selectedTrip.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTrip(null);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-white font-bold text-3xl mb-2">{selectedTrip.name}</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedTrip.cities.join(", ")}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-gray-600 text-lg mb-6">{selectedTrip.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Duration</span>
                  </div>
                  <p className="text-gray-700">{formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">Budget</span>
                  </div>
                  <p className="text-gray-700 font-bold">${selectedTrip.budget.toLocaleString()}</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Cities</span>
                  </div>
                  <p className="text-gray-700">{selectedTrip.cities.length} destinations</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <span className="font-semibold">Activities</span>
                  </div>
                  <p className="text-gray-700">{selectedTrip.activities} planned</p>
                </div>
              </div>
              
              <button className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition font-semibold text-lg shadow-lg">
                View Full Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;