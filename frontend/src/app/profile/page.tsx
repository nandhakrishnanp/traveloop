"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  User,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Globe,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/axiosconfig";
import Image from "next/image";

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
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  profile_photo_url: string | null;
  language_preference: string;
  created_at: string;
}

interface PageProps {}

const Page = ({}: PageProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [editedInfo, setEditedInfo] = useState({
    full_name: "",
    profile_photo_url: "",
    language_preference: "en",
  });

  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserInfo(parsedUser);
      setEditedInfo({
        full_name: parsedUser.full_name,
        profile_photo_url: parsedUser.profile_photo_url || "",
        language_preference: parsedUser.language_preference,
      });
    }
    fetchUserProfile();
    fetchTrips();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
      setEditedInfo({
        full_name: response.data.full_name,
        profile_photo_url: response.data.profile_photo_url || "",
        language_preference: response.data.language_preference,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get("/trips?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const trips = response.data.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = trips.filter(
        (trip: Trip) => new Date(trip.start_date) >= today,
      );
      const past = trips.filter(
        (trip: Trip) => new Date(trip.end_date) < today,
      );

      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("token");

      const updateData: any = {
        full_name: editedInfo.full_name,
        language_preference: editedInfo.language_preference,
      };

      if (editedInfo.profile_photo_url) {
        updateData.profile_photo_url = editedInfo.profile_photo_url;
      }

      const response = await axiosInstance.patch("/users/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserInfo(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div
      onClick={() => router.push(`/trips/user/${trip.id}`)}
      className="bg-white font-inter rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={trip.cover_photo_url}
          alt={trip.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1">{trip.name}</h3>
          <div className="flex items-center gap-1 text-white/90 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{trip.stops_count} stops</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
          <Calendar className="w-4 h-4 text-accent" />
          <span>
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">
            {calculateDays(trip.start_date, trip.end_date)} days
          </span>
          <span className="font-semibold text-gray-900">
            ${trip.total_budget?.toFixed(2) || "0.00"}
          </span>
        </div>
        <button className="w-full py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition font-medium text-sm">
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-inter mb-4">Failed to load profile</p>
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-inter bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-grow w-full">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account and view your travel history
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent/20">
                    {userInfo.profile_photo_url ? (
                      <Image
                        src={userInfo.profile_photo_url}
                        alt={userInfo.full_name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                        <User className="w-16 h-16 text-accent" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    User Details
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedInfo({
                            full_name: userInfo.full_name,
                            profile_photo_url: userInfo.profile_photo_url || "",
                            language_preference: userInfo.language_preference,
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 text-accent" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInfo.full_name}
                        onChange={(e) =>
                          setEditedInfo({
                            ...editedInfo,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    ) : (
                      <p className="text-gray-900 text-base">
                        {userInfo.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 text-accent" />
                      Email Address
                    </label>
                    <p className="text-gray-900 text-base">{userInfo.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Globe className="w-4 h-4 text-accent" />
                      Language Preference
                    </label>
                    {isEditing ? (
                      <select
                        value={editedInfo.language_preference}
                        onChange={(e) =>
                          setEditedInfo({
                            ...editedInfo,
                            language_preference: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 text-base">
                        {userInfo.language_preference === "en" && "English"}
                        {userInfo.language_preference === "es" && "Spanish"}
                        {userInfo.language_preference === "fr" && "French"}
                        {userInfo.language_preference === "de" && "German"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      Member Since
                    </label>
                    <p className="text-gray-900 text-base">
                      {formatDate(userInfo.created_at)}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Camera className="w-4 h-4 text-accent" />
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={editedInfo.profile_photo_url}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          profile_photo_url: e.target.value,
                        })
                      }
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-accent rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Trips
              </h2>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                {upcomingTrips.length}
              </span>
            </div>
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No upcoming trips planned</p>
                <button
                  onClick={() => router.push("/trips/createtrip")}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Plan a Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Past Trips</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                {pastTrips.length}
              </span>
            </div>
            {pastTrips.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No past trips yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Page;
