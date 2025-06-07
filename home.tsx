import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Map, Heart, Leaf, Beef, Sprout, Users, Building, Stethoscope, Trophy, MapPin, Calendar, Building2, Award, Crown, Star, Home as HomeIcon, Briefcase, Target, Gift, Coins, Truck, Clock, TrendingUp, Handshake, Shirt, HandHeart, UserPlus, Camera, Eye, EyeOff, PartyPopper } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import PostCard from "@/components/post-card";
import PostFormModal from "@/components/post-form-modal";
import MapView from "@/components/map-view";
import { PostWithAuthor } from "@shared/schema";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [postFormType, setPostFormType] = useState<"donation" | "request" | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    dietaryType: "all"
  });

  const { data: posts, isLoading, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = !filters.search || 
      post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.location.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === "all" || post.type === filters.type;
    const matchesStatus = filters.status === "all" || post.status === filters.status;
    const matchesDietaryType = filters.dietaryType === "all" || post.dietaryType === filters.dietaryType;
    
    return matchesSearch && matchesType && matchesStatus && matchesDietaryType;
  });

  const handlePostSuccess = () => {
    setShowPostForm(false);
    setPostFormType(null);
    refetch();
  };

  if (showMapView) {
    return <MapView posts={posts || []} onBack={() => setShowMapView(false)} />;
  }

  return (
    <div className="min-h-screen app-bg">
      {/* Global Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search food donations, communities, events, or services..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-400 bg-white dark:bg-gray-700"
            />
            {globalSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlobalSearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            )}
          </div>
          
          {/* Quick Search Suggestions */}
          {globalSearch && (
            <div className="max-w-2xl mx-auto mt-3">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Link href="/adopt-a-slum">
                    <Button variant="ghost" size="sm" className="text-left justify-start w-full">
                      🏘️ Adopt Communities
                    </Button>
                  </Link>
                  <Link href="/event-food-pickup">
                    <Button variant="ghost" size="sm" className="text-left justify-start w-full">
                      🎉 Event Pickup
                    </Button>
                  </Link>
                  <Link href="/donation-centers">
                    <Button variant="ghost" size="sm" className="text-left justify-start w-full">
                      🏢 Donation Centers
                    </Button>
                  </Link>
                  <Link href="/medical-aid">
                    <Button variant="ghost" size="sm" className="text-left justify-start w-full">
                      🏥 Medical Aid
                    </Button>
                  </Link>
                  <Link href="/care-institutions">
                    <Button variant="ghost" size="sm" className="text-left justify-start w-full">
                      🏠 Care Institutions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="empathy-gradient py-16 empathy-shadow relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Unity Through Food Visual */}
          <div className="mb-8">
            <div className="flex justify-center items-center mb-6">
              <svg viewBox="0 0 600 160" className="w-full max-w-3xl h-40">
                {/* Background circle representing unity */}
                <circle cx="300" cy="80" r="70" fill="none" stroke="#FFA500" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />
                
                {/* Person 1 - African woman with child */}
                <g transform="translate(120, 50)">
                  <ellipse cx="0" cy="0" rx="16" ry="22" fill="#8B4513" />
                  <circle cx="0" cy="-12" r="10" fill="#654321" />
                  <path d="M-10,-18 Q-5,-22 0,-20 Q5,-22 10,-18" fill="#2F1B14" />
                  <circle cx="-3" cy="-15" r="1.2" fill="white" />
                  <circle cx="3" cy="-15" r="1.2" fill="white" />
                  <path d="M-2,-8 Q0,-6 2,-8" fill="none" stroke="#8B4513" strokeWidth="1" />
                  {/* Child beside */}
                  <circle cx="18" cy="5" r="6" fill="#8B4513" />
                  <circle cx="18" cy="-2" r="4" fill="#B8860B" />
                  <circle cx="16.5" cy="-3" r="0.8" fill="white" />
                  <circle cx="19.5" cy="-3" r="0.8" fill="white" />
                </g>
                
                {/* Person 2 - Asian elderly man */}
                <g transform="translate(200, 45)">
                  <ellipse cx="0" cy="0" rx="15" ry="20" fill="#4A90E2" />
                  <circle cx="0" cy="-12" r="9" fill="#F4C2A1" />
                  <path d="M-8,-18 Q0,-20 8,-18" fill="#D3D3D3" />
                  <ellipse cx="-2.5" cy="-15" rx="0.8" ry="0.6" fill="#2F1B14" />
                  <ellipse cx="2.5" cy="-15" rx="0.8" ry="0.6" fill="#2F1B14" />
                  <path d="M-2,-8 Q0,-6 2,-8" fill="none" stroke="#2F1B14" strokeWidth="1" />
                </g>
                
                {/* Person 3 - Middle Eastern woman */}
                <g transform="translate(280, 40)">
                  <ellipse cx="0" cy="0" rx="16" ry="23" fill="#9B59B6" />
                  <circle cx="0" cy="-13" r="10" fill="#D4A574" />
                  <path d="M-9,-20 Q0,-24 9,-20" fill="#4A4A4A" />
                  <circle cx="-3" cy="-16" r="1.1" fill="#654321" />
                  <circle cx="3" cy="-16" r="1.1" fill="#654321" />
                  <path d="M-2,-9 Q0,-7 2,-9" fill="none" stroke="#8B4513" strokeWidth="1" />
                  <path d="M-12,-18 Q-8,-22 -4,-18" fill="#4A4A4A" opacity="0.8" />
                </g>
                
                {/* Person 4 - European family (man and woman) */}
                <g transform="translate(360, 45)">
                  <ellipse cx="0" cy="0" rx="15" ry="21" fill="#E74C3C" />
                  <circle cx="0" cy="-12" r="9" fill="#FFE4B5" />
                  <path d="M-7,-18 Q0,-20 7,-18" fill="#B8860B" />
                  <circle cx="-2.5" cy="-15" r="1.2" fill="#4169E1" />
                  <circle cx="2.5" cy="-15" r="1.2" fill="#4169E1" />
                  <path d="M-2,-8 Q0,-6 2,-8" fill="none" stroke="#8B4513" strokeWidth="1" />
                  {/* Woman beside */}
                  <ellipse cx="-20" cy="0" rx="14" ry="20" fill="#E74C3C" />
                  <circle cx="-20" cy="-12" r="8.5" fill="#FDBCB4" />
                  <path d="M-28,-18 Q-20,-22 -12,-18" fill="#8B4513" />
                  <circle cx="-22" cy="-15" r="1.1" fill="#4169E1" />
                  <circle cx="-18" cy="-15" r="1.1" fill="#4169E1" />
                </g>
                
                {/* Person 5 - Latino young woman */}
                <g transform="translate(460, 50)">
                  <ellipse cx="0" cy="0" rx="15" ry="21" fill="#2ECC71" />
                  <circle cx="0" cy="-12" r="9" fill="#D2B48C" />
                  <path d="M-8,-18 Q0,-22 8,-18" fill="#2F1B14" />
                  <circle cx="-2.5" cy="-15" r="1.2" fill="#654321" />
                  <circle cx="2.5" cy="-15" r="1.2" fill="#654321" />
                  <path d="M-2,-8 Q0,-6 2,-8" fill="none" stroke="#2F1B14" strokeWidth="1" />
                </g>
                
                {/* Additional children playing around */}
                <g transform="translate(180, 90)">
                  <circle cx="0" cy="0" r="5" fill="#FF6B6B" />
                  <circle cx="0" cy="-8" r="3.5" fill="#F4C2A1" />
                  <circle cx="-1" cy="-9" r="0.6" fill="black" />
                  <circle cx="1" cy="-9" r="0.6" fill="black" />
                </g>
                
                <g transform="translate(420, 85)">
                  <circle cx="0" cy="0" r="5" fill="#FFB366" />
                  <circle cx="0" cy="-8" r="3.5" fill="#D4A574" />
                  <circle cx="-1" cy="-9" r="0.6" fill="brown" />
                  <circle cx="1" cy="-9" r="0.6" fill="brown" />
                </g>
                
                {/* Connecting hands/arms representing unity */}
                <path d="M136,60 Q158,55 185,60" stroke="#FF6B35" strokeWidth="3" fill="none" />
                <path d="M215,55 Q248,50 265,55" stroke="#FF6B35" strokeWidth="3" fill="none" />
                <path d="M295,55 Q325,50 340,55" stroke="#FF6B35" strokeWidth="3" fill="none" />
                <path d="M380,60 Q420,55 445,60" stroke="#FF6B35" strokeWidth="3" fill="none" />
                
                {/* Central food sharing symbol */}
                <g transform="translate(300, 110)">
                  <circle cx="0" cy="0" r="22" fill="#FF6B35" opacity="0.9" />
                  <circle cx="0" cy="0" r="17" fill="#FFD700" opacity="0.8" />
                  <text x="0" y="7" textAnchor="middle" fontSize="22" fill="white">🍽️</text>
                </g>
                
                {/* Unity hearts and symbols floating around */}
                <circle cx="220" cy="25" r="3" fill="#E74C3C" opacity="0.7" />
                <circle cx="380" cy="30" r="3" fill="#E74C3C" opacity="0.7" />
                <circle cx="150" cy="120" r="3" fill="#E74C3C" opacity="0.7" />
                <circle cx="450" cy="115" r="3" fill="#E74C3C" opacity="0.7" />
                
                {/* Small family symbols */}
                <text x="100" y="25" fontSize="14" opacity="0.6">👨‍👩‍👧‍👦</text>
                <text x="500" y="30" fontSize="14" opacity="0.6">🤝</text>
                
                {/* Diversity text beneath */}
                <text x="300" y="150" textAnchor="middle" fontSize="14" fill="#666" fontWeight="600">
                  Families, Communities, Humanity United
                </text>
              </svg>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 mb-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🌍</span>
                <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">
                  Food Connects All Humanity
                </h2>
                <span className="text-2xl">🤝</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Beyond race, religion, caste, and ethnicity - food is our universal language of love, compassion, and unity. 
                Every shared meal builds bridges between communities, every helping hand strengthens our bonds as one human family. 
                Through interfaith collaboration and cross-cultural partnerships, we nourish both body and soul.
              </p>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to FoodShare
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Unite communities through food sharing, interfaith collaboration, and social harmony
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => {
                setPostFormType("donation");
                setShowPostForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Share Food
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setPostFormType("request");
                setShowPostForm(true);
              }}
            >
              <Heart className="mr-2 h-4 w-4" />
              Request Help
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowMapView(true)}
            >
              <Map className="mr-2 h-4 w-4" />
              Map View
            </Button>
          </div>
        </div>
      </section>

      {/* UN SDG Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-2xl font-bold">UN SDG 2: ZERO HUNGER</h3>
                <p className="text-blue-100">Supporting Global Sustainability Goals</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="text-2xl font-bold">UN SDG 17: PARTNERSHIPS</h3>
                <p className="text-blue-100">Building Communities Together</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Support Services - Integrated */}
      <section className="bg-gray-50 dark:bg-gray-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              How We Support Our Community
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Beyond food sharing, we provide comprehensive support services that strengthen community bonds and ensure no one is left behind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* Medical Aid - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/medical-aid'}>
              <CardContent className="p-4">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🏥</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Medical Aid</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Healthcare support</p>
              </CardContent>
            </Card>

            {/* Clothing Donations - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/clothing-donations'}>
              <CardContent className="p-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👕</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Clothing Aid</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Essential garments</p>
              </CardContent>
            </Card>

            {/* Corporate CSR - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/corporate-csr'}>
              <CardContent className="p-4">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🏢</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Corporate CSR</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Business partnerships</p>
              </CardContent>
            </Card>

            {/* Community Centers - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/donation-centers'}>
              <CardContent className="p-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🏪</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Centers</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Local hubs</p>
              </CardContent>
            </Card>

            {/* Interfaith Partnerships - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/community-partnerships'}>
              <CardContent className="p-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🤝</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Interfaith Unity</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Religious harmony</p>
              </CardContent>
            </Card>

            {/* Event Food Pickup - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/event-food-pickup'}>
              <CardContent className="p-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PartyPopper className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Event Rescue</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Large event pickup</p>
              </CardContent>
            </Card>

            {/* Volunteer Delivery - Compact */}
            <Card className="text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/volunteer-registration'}>
              <CardContent className="p-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🚗</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">Delivery Help</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Transport volunteers</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action - Subtle */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Join Our Mission Beyond Food
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
              Whether you're a healthcare provider, business owner, community leader, or someone with a vehicle, 
              there are many ways to support our neighbors in need.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/volunteer-registration'}>
                Volunteer to Deliver
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/corporate-csr'}>
                Corporate Partnership
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/community-partnerships'}>
                Community Collaboration
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Animal Welfare Section - Balanced and Warm */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-3">
              <span className="text-xl mr-2">🐾</span>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                Compassion for All Living Beings
              </h2>
              <span className="text-xl ml-2">🐕</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm">
              Our circle of care extends to animals in need through safe, specialized partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-lg">🐕</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Animal Welfare Partners</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">PETA, Local Shelters</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Specialized feeding programs for strays through veterinary-approved protocols.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-lg">🛡️</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Safety First</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Separate & Safe Programs</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Independent systems ensure both human and animal safety standards.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-700 border-green-600 hover:bg-green-50 dark:text-green-300 dark:border-green-500"
              onClick={() => window.open('https://www.peta.org', '_blank')}
            >
              <Heart className="mr-2 h-3 w-3" />
              Animal Welfare Info
            </Button>
          </div>
        </div>
      </section>

      {/* Community Impact Heat Map */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <span className="text-4xl mr-3">🗺️</span>
              <h2 className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                Community Impact Heat Map
              </h2>
              <span className="text-4xl ml-3">🔥</span>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Witness the warmth of generosity spreading across our neighborhoods. Every donation creates ripples of kindness that 
              <span className="font-semibold text-orange-700 dark:text-orange-300"> light up communities with hope and compassion</span>.
            </p>
          </div>

          {/* Heat Map Visualization */}
          <div className="bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-2xl p-8 mb-10 border border-orange-200/50 dark:border-orange-700/30">
            <div className="grid grid-cols-8 gap-2 mb-6">
              {/* Heat map grid simulation */}
              {Array.from({ length: 64 }, (_, i) => {
                const intensity = Math.random();
                let bgColor = "bg-gray-100 dark:bg-gray-700";
                if (intensity > 0.8) bgColor = "bg-red-500 animate-pulse";
                else if (intensity > 0.6) bgColor = "bg-orange-500";
                else if (intensity > 0.4) bgColor = "bg-yellow-400";
                else if (intensity > 0.2) bgColor = "bg-green-300";
                
                return (
                  <div
                    key={i}
                    className={`${bgColor} h-8 w-full rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer`}
                    title={`Activity Level: ${Math.round(intensity * 100)}%`}
                  />
                );
              })}
            </div>
            
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">Low Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">Growing</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">High Impact</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">Exceptional</span>
              </div>
            </div>
          </div>

          {/* Community Champions Leaderboard */}
          <div className="bg-gradient-to-r from-white to-yellow-50 dark:from-gray-800 dark:to-yellow-900/20 rounded-2xl p-8 border border-yellow-200/50 dark:border-yellow-700/30">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <span className="text-3xl mr-3">🏆</span>
                <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  Community Champions
                </h3>
                <span className="text-3xl ml-3">⭐</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Celebrating neighborhoods where generosity flourishes and communities thrive through shared compassion.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* 1st Place */}
              <Card className="text-center bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-6xl mb-4">🥇</div>
                  <h4 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">Downtown District</h4>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">2,847</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">meals shared</p>
                  <div className="flex justify-center space-x-1 mb-3">
                    <span className="text-2xl">🏆</span>
                    <span className="text-2xl">🏆</span>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <Badge className="bg-yellow-500 text-white">Compassion Champion</Badge>
                </CardContent>
              </Card>

              {/* 2nd Place */}
              <Card className="text-center bg-gradient-to-b from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-400 dark:border-gray-500 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-6xl mb-4">🥈</div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Riverside Community</h4>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">2,156</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">meals shared</p>
                  <div className="flex justify-center space-x-1 mb-3">
                    <span className="text-2xl">🏆</span>
                    <span className="text-2xl">🏆</span>
                    <span className="text-xl">⭐</span>
                  </div>
                  <Badge className="bg-gray-500 text-white">Unity Builder</Badge>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="text-center bg-gradient-to-b from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-2 border-orange-400 dark:border-orange-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-6xl mb-4">🥉</div>
                  <h4 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">Garden Heights</h4>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">1,923</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">meals shared</p>
                  <div className="flex justify-center space-x-1 mb-3">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xl">⭐</span>
                    <span className="text-xl">⭐</span>
                  </div>
                  <Badge className="bg-orange-500 text-white">Heart of Gold</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Additional Rankings */}
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">More Community Heroes</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏅</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Maple Valley</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">1,687 meals</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">Rising Star</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Sunset Plaza</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">1,534 meals</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">Community Builder</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💜</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Heritage Hills</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">1,298 meals</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">Kindness Leader</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💎</span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Oceanview</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">1,167 meals</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-teal-700 border-teal-300">Caring Neighbor</Badge>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
                "Every shared meal is a victory, every helping hand a trophy. Together, we're building a world where no one goes hungry."
              </p>
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3"
                onClick={() => {
                  setPostFormType("donation");
                  setShowPostForm(true);
                }}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Join the Champions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Festive Giving Camps */}
      <section className="bg-gradient-to-br from-red-50 via-green-50 to-gold-50 dark:from-red-900/20 dark:via-green-900/20 dark:to-yellow-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <span className="text-4xl mr-3 animate-bounce">🎪</span>
              <h2 className="text-3xl font-bold text-red-800 dark:text-red-200">
                Festive Giving Camps
              </h2>
              <span className="text-4xl ml-3 animate-bounce">🎈</span>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Throughout the year, we transform holidays and celebrations into opportunities for community unity. 
              <span className="font-semibold text-red-700 dark:text-red-300">Every festival becomes a feast of sharing, every celebration a chance to spread joy through food</span>.
            </p>
          </div>

          {/* Current/Upcoming Camps */}
          <div className="bg-gradient-to-r from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 rounded-2xl p-8 mb-10 border border-red-200/50 dark:border-red-700/30">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl mr-2">🎄</span>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Current Season: Winter Warmth</h3>
                <span className="text-2xl ml-2">❄️</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">December 2024 - February 2025</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-b from-green-50 to-red-50 dark:from-green-900/30 dark:to-red-900/30 border-2 border-green-300 dark:border-green-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🎄</span>
                      <div>
                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Christmas Joy Camp</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Dec 20-25, 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Join churches, community centers, and families in creating magical Christmas meals for those in need. 
                    Special focus on traditional holiday foods and warm comfort meals.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300 font-medium">1,247 meals shared so far</span>
                    <span className="text-gray-600 dark:text-gray-400">15 locations</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">🕯️</span>
                      <div>
                        <h4 className="text-lg font-bold text-purple-800 dark:text-purple-200">New Year Unity Feast</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Dec 31 - Jan 2, 2025</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-purple-700 border-purple-400">Upcoming</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Start the new year with hope and community. Multi-cultural celebration featuring foods from around the world, 
                    symbolizing unity and fresh beginnings.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Target: 2,000 meals</span>
                    <span className="text-gray-600 dark:text-gray-400">25 locations planned</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold px-6 py-3">
                <Calendar className="mr-2 h-5 w-5" />
                Join Winter Camps
              </Button>
            </div>
          </div>

          {/* Seasonal Calendar */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-pink-50 to-red-50 dark:from-pink-900/30 dark:to-red-900/30">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🌸</div>
                <h3 className="font-semibold mb-2 text-pink-800 dark:text-pink-200">Spring Renewal</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">March - May</p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>🐣 Easter Sharing</li>
                  <li>🌺 Holi Colors & Food</li>
                  <li>🕊️ Passover Unity</li>
                  <li>🌱 Earth Day Gardens</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">☀️</div>
                <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Summer Joy</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">June - August</p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>🏖️ Beach Picnics</li>
                  <li>🎇 Independence BBQs</li>
                  <li>🌽 Harvest Prep</li>
                  <li>🍉 Cool Summer Treats</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🍂</div>
                <h3 className="font-semibold mb-2 text-orange-800 dark:text-orange-200">Autumn Harvest</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">September - November</p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>🎃 Halloween Treats</li>
                  <li>🦃 Thanksgiving Feast</li>
                  <li>🪔 Diwali Sweets</li>
                  <li>🌾 Harvest Festivals</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">❄️</div>
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Winter Warmth</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">December - February</p>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>🎄 Christmas Joy</li>
                  <li>🕯️ Hanukkah Light</li>
                  <li>🎊 New Year Unity</li>
                  <li>💝 Valentine Sharing</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Impact Stories */}
          <div className="bg-gradient-to-r from-white/90 to-yellow-50/90 dark:from-gray-800/90 dark:to-yellow-900/20 rounded-xl p-8 border border-yellow-200/50 dark:border-yellow-700/30">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-3">
                Celebrating Together: Impact Stories
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎃</div>
                <h4 className="font-semibold mb-2">Halloween 2024</h4>
                <div className="text-2xl font-bold text-orange-600 mb-1">3,456</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">treat bags shared with families</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🦃</div>
                <h4 className="font-semibold mb-2">Thanksgiving 2024</h4>
                <div className="text-2xl font-bold text-amber-600 mb-1">5,789</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">complete holiday meals delivered</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🪔</div>
                <h4 className="font-semibold mb-2">Diwali 2024</h4>
                <div className="text-2xl font-bold text-purple-600 mb-1">2,134</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">sweet boxes shared across communities</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
              "Every festival is a reminder that joy multiplies when shared. Through festive camps, we don't just feed bodies - we nourish souls and build lasting memories of kindness."
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                className="border-red-500 text-red-700 hover:bg-red-50 dark:text-red-300 dark:border-red-500"
                onClick={() => {
                  setPostFormType("donation");
                  setShowPostForm(true);
                }}
              >
                🎁 Host a Festive Camp
              </Button>
              <Button 
                variant="outline" 
                className="border-green-500 text-green-700 hover:bg-green-50 dark:text-green-300 dark:border-green-500"
              >
                📅 View Full Calendar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Group Givers & Family Mode Section */}
      <section className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Group Givers & Family Mode
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              💞 <strong>Collective giving, better impact.</strong><br/>
              Families or housing societies can create group accounts to donate in bulk.<br/>
              Earn joint badges like "Neighborhood Nourisher" or "Street Squad".
            </p>
          </div>

          {/* Featured Groups */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-purple-100 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Oak Grove Society</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Housing Society</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-purple-600">23</div>
                    <div className="text-gray-600 dark:text-gray-300">Members</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">89</div>
                    <div className="text-gray-600 dark:text-gray-300">Donations</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">267</div>
                    <div className="text-gray-600 dark:text-gray-300">Meals</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">🏆 Champions</Badge>
                  <Badge variant="secondary" className="text-xs">🏘️ Street Squad</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-purple-100 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sunset Family Circle</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Family Group</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-purple-600">8</div>
                    <div className="text-gray-600 dark:text-gray-300">Members</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">47</div>
                    <div className="text-gray-600 dark:text-gray-300">Donations</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">124</div>
                    <div className="text-gray-600 dark:text-gray-300">Meals</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">🏠 Nourisher</Badge>
                  <Badge variant="secondary" className="text-xs">🍽️ Heroes</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-purple-100 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Unity Workplace</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Workplace Team</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-purple-600">15</div>
                    <div className="text-gray-600 dark:text-gray-300">Members</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">34</div>
                    <div className="text-gray-600 dark:text-gray-300">Donations</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">91</div>
                    <div className="text-gray-600 dark:text-gray-300">Meals</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">🏘️ Squad</Badge>
                  <Badge variant="secondary" className="text-xs">💼 Team</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badge Progression */}
          <Card className="bg-white dark:bg-gray-800 mb-8 border border-purple-100 dark:border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Group Badge Progression</h3>
              <div className="flex justify-center items-center gap-4 overflow-x-auto pb-2">
                <div className="text-center min-w-[80px]">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-xs font-medium">New Group</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center min-w-[80px]">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <HomeIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs font-medium">Neighborhood Nourisher</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center min-w-[80px]">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-medium">Street Squad</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center min-w-[80px]">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs font-medium">Block Blessers</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center min-w-[80px]">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-xs font-medium">Community Champions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Create or Join</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Form a family group, housing society, or workplace team to pool your giving efforts.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Donate Together</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Coordinate bulk donations and share meals collectively for greater impact.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold mb-2">Earn Joint Badges</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Unlock shared achievements and build neighborhood pride through collective giving.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/group-givers'}
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg shadow-lg"
            >
              <Users className="h-6 w-6 mr-3" />
              Explore Group Givers & Family Mode
            </Button>
          </div>
        </div>
      </section>

      {/* Gamified Volunteer Missions Section */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gamified Volunteer Missions
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              🎯 <strong>Turn kindness into adventure!</strong><br/>
              Complete fun challenges, earn Kindness Coins, and unlock amazing rewards while making a difference.
            </p>
          </div>

          {/* Mission Categories */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Feeding Missions</h3>
                <p className="text-sm opacity-90">Feed 5 strays in 5 days</p>
                <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1">
                  50-150 points
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Delivery Missions</h3>
                <p className="text-sm opacity-90">Deliver 3 meals to elderly</p>
                <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1">
                  100-300 points
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Community Missions</h3>
                <p className="text-sm opacity-90">Host a neighborhood food drive</p>
                <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1">
                  200-500 points
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Special Events</h3>
                <p className="text-sm opacity-90">Festival food sharing events</p>
                <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1">
                  300-1000 points
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Mission */}
          <Card className="bg-white dark:bg-gray-800 mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Weekly Challenge: Community Helper</h3>
                    <p className="text-gray-600 dark:text-gray-300">Complete 3 different types of missions this week</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Medium Difficulty
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">750</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Points Reward</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Days Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1/3</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Progress</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>33%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Store Preview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Coins className="h-6 w-6 text-yellow-500" />
                  Kindness Coins Store
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">$5 off at Local Cafe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Partner discount</p>
                    </div>
                    <Badge variant="secondary">50 coins</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">10% off Grocery Store</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Weekly special</p>
                    </div>
                    <Badge variant="secondary">100 coins</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">Free Food Delivery</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Premium reward</p>
                    </div>
                    <Badge variant="secondary">200 coins</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Community Leaderboard
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div className="flex-1">
                      <p className="font-semibold">Sarah Chen</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Community Champion</p>
                    </div>
                    <p className="font-bold text-yellow-600">12,450 pts</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div className="flex-1">
                      <p className="font-semibold">Ahmed Hassan</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Kindness Leader</p>
                    </div>
                    <p className="font-bold text-gray-600">9,830 pts</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div className="flex-1">
                      <p className="font-semibold">Maria Garcia</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Helper Hero</p>
                    </div>
                    <p className="font-bold text-orange-600">8,675 pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/volunteer-missions'}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-full text-lg shadow-lg"
            >
              <Target className="h-6 w-6 mr-3" />
              Start Your Mission Adventure
            </Button>
          </div>
        </div>
      </section>

      {/* Before/After Photo Stories Section */}
      <section className="bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Before & After Photo Stories
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              📸 <strong>Make impact visible.</strong><br/>
              Share powerful before & after photos of your food sharing journey and inspire others
            </p>
          </div>

          {/* Story Categories */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h3 className="font-semibold mb-2">Meal Pickup</h3>
                <p className="text-sm opacity-90">Before empty plates, after full families</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👶</span>
                </div>
                <h3 className="font-semibold mb-2">Kids Fed</h3>
                <p className="text-sm opacity-90">Smiling children receiving nutritious meals</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🐕</span>
                </div>
                <h3 className="font-semibold mb-2">Stray Animals</h3>
                <p className="text-sm opacity-90">Hungry strays to happy, fed animals</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="font-semibold mb-2">Community Events</h3>
                <p className="text-sm opacity-90">Empty venues to food distribution success</p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Stories Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 overflow-hidden">
              <div className="relative">
                <div className="grid grid-cols-2 gap-1 p-2">
                  <div className="relative">
                    <div className="w-full h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐕</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Before
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full h-24 bg-green-300 dark:bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐕💕</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      After
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Fed 20 Stray Dogs Today</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Found hungry strays near the market. After feeding them proper food...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>45 likes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    🐕 20 animals fed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 overflow-hidden">
              <div className="relative">
                <div className="grid grid-cols-2 gap-1 p-2">
                  <div className="relative">
                    <div className="w-full h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👶</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Before
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full h-24 bg-blue-300 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👶🍽️</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      After
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Lunch for Homeless Kids</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Prepared lunch boxes for children at the shelter. Happy kids enjoying...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                    <span>78 likes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    👥 25 people fed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 overflow-hidden">
              <div className="relative">
                <div className="grid grid-cols-2 gap-1 p-2">
                  <div className="relative">
                    <div className="w-full h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Before
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full h-24 bg-purple-300 dark:bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎉📦📦</span>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      After
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Community Food Drive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Empty collection point to overflowing with donations from 50+ families...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>92 likes</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    🏠 50 families helped
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-center mb-6">Visual Impact This Month</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2,450</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">People Reached</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Trust Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">340</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">New Volunteers</div>
              </div>
            </div>
          </div>

          {/* Privacy Options */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-blue-500 rounded-full">
                <EyeOff className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Privacy-First Sharing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">You control your story visibility</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-green-500" />
                <span className="text-sm">Public stories inspire the community</span>
              </div>
              <div className="flex items-center gap-3">
                <EyeOff className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Private stories for personal tracking</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/photo-stories'}
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg shadow-lg"
            >
              <Camera className="h-6 w-6 mr-3" />
              Share Your Impact Story
            </Button>
          </div>
        </div>
      </section>

      {/* Interfaith Community Unity - Enhanced with Love */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center mb-4">
              <span className="text-3xl mr-3">🕌</span>
              <span className="text-3xl mr-3">⛪</span>
              <span className="text-3xl mr-3">🕍</span>
              <span className="text-3xl mr-3">🛕</span>
              <span className="text-3xl">🏫</span>
            </div>
            <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">
              Where Faith Meets Food, Love Multiplies
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Across mosques, churches, temples, synagogues, and schools, we unite in the sacred act of feeding our neighbors. 
              <span className="font-semibold text-purple-700 dark:text-purple-300">When communities of different faiths come together to share food, they create miracles of unity and understanding.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <span className="text-2xl mr-1">🕌</span>
                  <span className="text-2xl mr-1">⛪</span>
                  <span className="text-2xl">🛕</span>
                </div>
                <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">Interfaith Harmony</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Religious communities working side by side, sharing kitchens and breaking bread together
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="text-3xl mb-4">🏫</div>
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">School Partnerships</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Students learning compassion through action, creating lunch programs for hungry classmates
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-gradient-to-b from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">Social Harmony</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Building bridges across communities through the universal language of sharing food
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/20 rounded-xl p-6 text-center border border-purple-200/50 dark:border-purple-700/30">
            <div className="flex items-center justify-center mb-3">
              <span className="text-xl mr-2">💜</span>
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Breaking Barriers Through Shared Meals</h3>
              <span className="text-xl ml-2">💜</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "In every shared meal between communities of different faiths, we witness the miracle of understanding. 
              Food becomes the bridge that transforms strangers into neighbors, differences into gifts, and barriers into blessings."
            </p>
            <Button 
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = '/community-partnerships'}
            >
              Join Interfaith Partnerships
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search food items, locations..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="donation">Donations</SelectItem>
                  <SelectItem value="request">Requests</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dietaryType} onValueChange={(value) => setFilters(prev => ({ ...prev, dietaryType: value }))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Dietary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dietary</SelectItem>
                  <SelectItem value="vegetarian">
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-green-600" />
                      Vegetarian
                    </div>
                  </SelectItem>
                  <SelectItem value="non-vegetarian">
                    <div className="flex items-center">
                      <Beef className="h-4 w-4 mr-2 text-red-600" />
                      Non-Vegetarian
                    </div>
                  </SelectItem>
                  <SelectItem value="vegan">
                    <div className="flex items-center">
                      <Sprout className="h-4 w-4 mr-2 text-green-700" />
                      Vegan
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">Mixed/Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    setPostFormType("donation");
                    setShowPostForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Post Donation
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {
                    setPostFormType("request");
                    setShowPostForm(true);
                  }}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Request Food
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowMapView(true)}
                >
                  <Map className="mr-2 h-4 w-4" />
                  View Map
                </Button>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Community Partnerships</h3>
              <div className="space-y-3">
                <Link to="/medical-aid" className="block">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Free Medical Aid</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Independent doctors providing free consultations</p>
                  </div>
                </Link>
                
                <Link to="/clothing-donations" className="block">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Clothing Donations</span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Partner NGOs accepting clothing donations</p>
                  </div>
                </Link>
                
                <Link to="/corporate-csr" className="block">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Corporate CSR</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">Company partnerships for large-scale donations</p>
                  </div>
                </Link>
                
                <Link to="/community-partnerships" className="block">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">Social Harmony</span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300">Schools, mosques, temples interfaith collaboration</p>
                  </div>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <Badge variant="secondary">{posts?.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <Badge className="bg-green-100 text-green-800">
                    {posts?.filter(p => p.status === 'active').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donations</span>
                  <Badge variant="outline">
                    {posts?.filter(p => p.type === 'donation').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests</span>
                  <Badge variant="outline">
                    {posts?.filter(p => p.type === 'request').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vegetarian</span>
                  <Badge className="bg-green-100 text-green-800">
                    {posts?.filter(p => p.dietaryType === 'vegetarian').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Non-Vegetarian</span>
                  <Badge className="bg-red-100 text-red-800">
                    {posts?.filter(p => p.dietaryType === 'non-vegetarian').length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vegan</span>
                  <Badge className="bg-green-200 text-green-900">
                    {posts?.filter(p => p.dietaryType === 'vegan').length || 0}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Posts Feed */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Posts</h2>
              <div className="text-sm text-muted-foreground">
                {filteredPosts?.length || 0} posts found
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-32 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={refetch} />
                ))}
              </div>
            ) : (
              <Card className="text-center p-12">
                <div className="text-muted-foreground mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {filters.search || filters.type !== "all" || filters.status !== "all" ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">No posts match your filters</h3>
                      <p>Try adjusting your search terms or filters to see more results.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p>Be the first to share food in your community!</p>
                    </>
                  )}
                </div>
                <Button 
                  onClick={() => {
                    setPostFormType("donation");
                    setShowPostForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Post First Item
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Post Form Modal */}
      <PostFormModal
        isOpen={showPostForm}
        onClose={() => {
          setShowPostForm(false);
          setPostFormType(null);
        }}
        defaultType={postFormType}
        onSuccess={handlePostSuccess}
      />
    </div>
  );
}