"use client";

import Logo from "@/components/Logo";
import bannerimg from "../../../public/banner2.jpg";
import bannerimg1 from "../../../public/banner.png";
import Image from "next/image";
import { MapPin, Calendar, Heart, ArrowRight, Plus, User2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "../axiosconfig";

interface PageProps {}

const Page = ({}: PageProps) => {
  const router = useRouter();
  const [recentTrips, setRecentTrips] = useState(null);

  const fetchRecentTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRecentTrips(res.data.data);
      console.log("Recent Trips:", res.data.data);
    } catch (error) {
      console.error("Error fetching recent trips:", error);
    }
  };

  const calucalteDaysDifference = (startDate: string, endDate: string) => {
    //"2026-01-04" input formate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  useEffect(() => {
    fetchRecentTrips();
  }, []);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-5">
        <Logo />
        <div className="flex items-center gap-3">
          {/* Navigation Buttons */}
          <button
            onClick={() => {
              router.push("/calender");
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => {
              router.push("/community");
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <Users className="w-4 h-4" />
            <span>Community</span>
          </button>
        </div>
        <div className=" flex items-center gap-3">
          <Button
            onClick={() => {
              router.push("/trips/createtrip");
            }}
            className=" bg-black/80 hover:bg-black/90 cursor-pointer "
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline-block mr-2">Add Trip</span>
          </Button>
          <div
            onClick={() => {
               router.push("/profile")
            }}
            className="w-12 h-12 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <User2 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="mb-5">
        <Image
          src={bannerimg}
          alt="Banner Image"
          className="w-full h-60   object-cover rounded-lg"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search for trips"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <button className="bg-accent text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
          Sort By
        </button>
      </div>

      {/* Trending Trips Section */}
      <div className="py-5">
        <h2 className="text-3xl font-bold font-space-grotesk text-black mb-6">
          Recent Trips
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentTrips &&
            recentTrips?.map((trip: any) => (
              <div
                key={trip.id}
                className="group font-inter relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={trip.cover_photo_url}
                    alt={trip.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md">
                    <Heart className="w-5 h-5 text-gray-700 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-accent transition-colors">
                    {trip.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{trip.name}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm">
                      {calucalteDaysDifference(trip.start_date, trip.end_date)}{" "}
                      days
                    </span>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => {
                      router.push(`/trips/${trip.id}`);
                    }}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 bg-accent/10 text-accent font-semibold py-2.5 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 group/btn"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
