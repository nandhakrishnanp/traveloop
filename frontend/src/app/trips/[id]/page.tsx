"use client";

import axiosInstance from "@/app/axiosconfig";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/components/Logo";
import { Calendar, MapPin, Globe, Lock, ArrowLeft, Edit, Share2, Trash2, Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripData {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo_url: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PageProps {}

const Page = ({}: PageProps) => {
  const id = useParams().id;
  const router = useRouter();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stops, setStops] = useState<any[]>([]);
  const fetchTripData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTripData(response.data);
    } catch (error: any) {
      console.error("Error fetching trip data:", error);
      if (error.response?.status === 401) {
        router.push("/auth/login");
      } else {
        setError("Failed to load trip data");
      }
    } finally {
      setLoading(false);
    }
  };
 
    const fetchStops = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/trips/${id}/stops`, {
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

  const handleDeleteTrip = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/home");
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      if (error.response?.status === 401) {
        router.push("/auth/login");
      } else {
        setError("Failed to delete trip");
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripData();
      fetchStops();
    }
  }, [id]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading trip...</p>
        </div>
      </div>
    );
  }

   const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };


  if (error || !tripData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-inter mb-4">{error || "Trip not found"}</p>
          <Button onClick={() => router.push("/home")} className="bg-accent hover:bg-accent/90">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between w-full mb-5 bg-white p-4 rounded-lg shadow-sm">
          <Logo />
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
              <Image
                src={tripData.cover_photo_url}
                alt={tripData.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <div className="absolute top-4 right-4 flex gap-2">
                {tripData.is_public ? (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                    <Globe className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Public</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Private</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                  {tripData.name}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="font-medium">
                    {formatDate(tripData.start_date)} - {formatDate(tripData.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="font-medium">
                    {calculateDuration(tripData.start_date, tripData.end_date)} days
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About this trip</h2>
                <p className="text-gray-700 leading-relaxed">
                  {tripData.description || "No description provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => router.push(`/itinerary/build/${id}`)}
                  className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Itinerary
                </Button>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Trip
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trip Itinerary</h2>
              <Button 
                onClick={() => router.push(`/itenary/build/${id}`)}
                className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Stop
              </Button>
            </div>
             <div className="space-y-5 mb-8">
          {stops.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No stops added yet. Click "Add Stop" to begin building your itinerary.</p>
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
        {stops.length === 0 && (
          <div className="text-center text-gray-600">
            No stops added yet. Click "Add Stop" to begin building your itinerary.
          </div>  
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Trip</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{tripData.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTrip}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;