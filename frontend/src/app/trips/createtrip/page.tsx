"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bannerimg1 from "../../../../public/banner.png";
import { useState } from "react";
import axiosInstance from "@/app/axiosconfig";

interface PageProps {}

const Page = ({}: PageProps) => {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  const handleCreateTrip = async () => {
    setError("");

    if (!name || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await axiosInstance.post(
        "/trips",
        {
          name,
          description: description || undefined,
          start_date: startDate,
          end_date: endDate,
          cover_photo_url: coverPhotoUrl || undefined,
          is_public: isPublic,
          public_slug: publicSlug || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/home");
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Unauthorized. Please log in again.");
          router.push("/auth/login");
        } else if (err.response.status === 400) {
          setError("Invalid trip data. Please check your inputs.");
        } else {
          setError("Failed to create trip. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto font-inter px-4 sm:px-6 lg:px-8 py-5 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between w-full mb-5 bg-white p-4 rounded-lg shadow-sm">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Create a new Trip
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Plan a new Trip
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Europe Summer 2026"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your trip"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo URL
              </label>
              <input
                type="url"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL for your trip cover photo
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="is-public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-2 focus:ring-accent cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="is-public"
                    className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {isPublic ? (
                      <Globe className="w-4 h-4 text-accent" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                    <span>Make this trip public</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Public trips can be viewed by anyone with the link
                  </p>
                </div>
              </div>

              {isPublic && (
                <div className="mt-4 ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom URL Slug (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      globaltrotter.com/trip/
                    </span>
                    <input
                      type="text"
                      value={publicSlug}
                      onChange={(e) => setPublicSlug(e.target.value)}
                      placeholder="my-europe-trip"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-0">
                    Create a custom URL for easy sharing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

    
        <div className="mt-8 flex justify-end gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="px-6 py-2.5 rounded-lg font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTrip}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Trip"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;