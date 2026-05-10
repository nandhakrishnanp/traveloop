"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Heart, MessageCircle, Share2, MapPin, Calendar, User, MoreVertical, Bookmark } from "lucide-react";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  tripTitle: string;
  location: string;
  date: string;
  description: string;
  images: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface PageProps {}

const Page = ({}: PageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        username: "@sarahtravels",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
      },
      tripTitle: "Amazing Europe Adventure",
      location: "Paris, France",
      date: "Dec 2025",
      description: "Just returned from an incredible 2-week journey through Europe! Paris was absolutely magical, especially the Eiffel Tower at sunset. Can't wait to share more photos and tips! 🗼✨",
      images: [
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
        "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80",
      ],
      likes: 234,
      comments: 45,
      isLiked: false,
      isSaved: false,
    },
    {
      id: "2",
      author: {
        name: "Mike Chen",
        username: "@mikeexplores",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      },
      tripTitle: "Tokyo Street Food Tour",
      location: "Tokyo, Japan",
      date: "Nov 2025",
      description: "The street food scene in Tokyo is unreal! From ramen to takoyaki, every bite was a new adventure. Shout out to the locals who recommended the best spots! 🍜🇯🇵",
      images: [
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      ],
      likes: 512,
      comments: 89,
      isLiked: true,
      isSaved: true,
    },
    {
      id: "3",
      author: {
        name: "Emma Rodriguez",
        username: "@emmaadventures",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
      },
      tripTitle: "Bali Beach Paradise",
      location: "Bali, Indonesia",
      date: "Oct 2025",
      description: "Found paradise in Bali! The beaches are pristine, the sunsets are breathtaking, and the local culture is so welcoming. This is definitely a place I'll return to! 🏝️🌅",
      images: [
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
      ],
      likes: 892,
      comments: 156,
      isLiked: true,
      isSaved: false,
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  const PostCard = ({ post }: { post: CommunityPost }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{post.author.name}</h3>
            <p className="text-xs text-gray-500">{post.author.username}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Post Images */}
      <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-1`}>
        {post.images.slice(0, 3).map((image, idx) => (
          <div
            key={idx}
            className={`relative ${post.images.length === 3 && idx === 0 ? 'col-span-2' : ''}`}
          >
            <img
              src={image}
              alt={`${post.tripTitle} ${idx + 1}`}
              className="w-full h-64 object-cover"
            />
            {post.images.length > 3 && idx === 2 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{post.images.length - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <MapPin className="w-3.5 h-3.5 text-green-600" />
            <span>{post.location}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Calendar className="w-3.5 h-3.5 text-green-600" />
            <span>{post.date}</span>
          </div>
        </div>

        <h4 className="font-bold text-gray-900 text-base mb-2">{post.tripTitle}</h4>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{post.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-1.5 transition ${
                post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleSave(post.id)}
            className={`transition ${
              post.isSaved ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Discover and share amazing travel experiences from around the world</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Popular', 'Recent', 'Following', 'Asia', 'Europe', 'Americas'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      selectedFilter === filter.toLowerCase()
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Info Card */}
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Share your genuine travel experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Be respectful to other travelers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Use photos and videos you own</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Help others with tips and advice</span>
                  </li>
                </ul>
              </div>

              {/* Trending Destinations */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Trending Destinations</h3>
                <div className="space-y-3">
                  {['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York, USA', 'Barcelona, Spain'].map((destination, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{destination}</span>
                      <span className="text-xs text-gray-500">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
