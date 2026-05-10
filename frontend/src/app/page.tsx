"use client";

import { useRouter } from "next/navigation";
import { Globe, Map, Users, Calendar, DollarSign, Share2 } from "lucide-react";

interface PageProps {}

const Page = ({}: PageProps) => {
  const router = useRouter();

  const features = [
    {
      icon: <Map className="w-8 h-8" />,
      title: "Explore Destinations",
      description: "Discover amazing places around the world with detailed guides and recommendations",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Plan Itineraries",
      description: "Design structured, day-by-day travel plans that bring your dream trips to life",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Budget Smart",
      description: "Make cost-effective decisions with transparent pricing and budget tracking tools",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborate",
      description: "Plan trips together with friends and family in real-time collaboration",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Share Experiences",
      description: "Connect with a community of travelers and share your unforgettable journeys",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Personalized AI",
      description: "Get intelligent recommendations tailored to your preferences and travel style",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-secondary to-background">
      {/* Hero Section */}
      <div className="flex flex-col h-screen items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex items-center gap-3">
          <Globe className="w-12 h-12 text-accent" />
          <h1 className="text-5xl font-bold text-accent font-space-grotesk">
            GlobeTrotter
          </h1>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk mb-6 max-w-4xl">
          Transform the Way You{" "}
          <span className="text-accent">Plan & Experience</span> Travel
        </h2>
        <p className="text-xl font-inter text-muted-foreground max-w-2xl mb-8">
          Dream it. Design it. Experience it. Your personalized, intelligent travel companion 
          that makes planning as exciting as the journey itself.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              router.push("/auth/login");
            }}
            className="bg-accent hover:bg-accent/90 px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all font-inter cursor-pointer"
          >
            Get Started
          </button>
          <button
            onClick={() => {
              router.push("/auth/login");
            }}
            className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all font-inter cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 max-w-7xl mx-auto w-full">
        <h3 className="text-3xl font-bold text-center mb-4 font-space-grotesk">
          Everything You Need for the Perfect Trip
        </h3>
        <p className="text-center text-muted-foreground mb-12 font-inter max-w-2xl mx-auto">
          An end-to-end travel planning platform that combines flexibility, 
          intelligence, and community
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-secondary/50 backdrop-blur-sm p-6 rounded-2xl border border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="text-accent mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-2 font-space-grotesk">
                {feature.title}
              </h4>
              <p className="text-muted-foreground font-inter">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 font-space-grotesk">
            Your Journey in Three Simple Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 font-space-grotesk">
                1
              </div>
              <h4 className="text-xl font-bold mb-2 font-space-grotesk">Dream</h4>
              <p className="text-muted-foreground font-inter">
                Explore destinations and get inspired by our global travel guides
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 font-space-grotesk">
                2
              </div>
              <h4 className="text-xl font-bold mb-2 font-space-grotesk">Design</h4>
              <p className="text-muted-foreground font-inter">
                Create detailed itineraries with smart budgeting and scheduling tools
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 font-space-grotesk">
                3
              </div>
              <h4 className="text-xl font-bold mb-2 font-space-grotesk">Share</h4>
              <p className="text-muted-foreground font-inter">
                Collaborate with others and share your adventures with the community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4 font-space-grotesk">
          Ready to Start Your Adventure?
        </h3>
        <p className="text-xl text-muted-foreground mb-8 font-inter max-w-2xl mx-auto">
          Join thousands of travelers who are already planning their dream trips with GlobeTrotter
        </p>
        <button
          onClick={() => {
            router.push("/auth/login");
          }}
          className="bg-accent hover:bg-accent/90 px-10 py-4 rounded-xl text-white font-semibold text-lg transition-all font-inter cursor-pointer"
        >
          Start Planning Now
        </button>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-accent/20 text-center">
        <p className="text-muted-foreground font-inter">
          © 2026 GlobeTrotter. Making travel planning as exciting as the trip itself.
        </p>
      </footer>
    </div>
  );
};

export default Page;