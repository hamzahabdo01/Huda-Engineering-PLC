


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Shield,
  Clock,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Globe,
  Wrench,
  Play,
  ArrowUpRight,
  ArrowLeft,
  Search,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Bed,
  Home,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroVideo from "@/assets/video_2025-09-10_11-26-19.mp4";
import heroImage from "@/assets/Screenshot 2025-09-23 152611.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCardItem {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  status: string;
  location: string;
  project_type: string;
  start_date: string;
  end_date: string;
  units: Record<string, string>;
  Amenities: string[];
}

interface TestimonialItem {
  id: string;
  name: string;
  project: string;
  content: string;
  rating: number;
  video_url?: string | null;
}

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [previousProjects, setPreviousProjects] = useState<ProjectCardItem[]>(
    []
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[] | null>(
    null
  );
  
  // Search form state
  const [searchLocation, setSearchLocation] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [searchBedrooms, setSearchBedrooms] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  
  // Backend data for dropdowns
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
  // Search results state
  const [searchResults, setSearchResults] = useState<ProjectCardItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchPrevious = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,title,short_description,image_url,status,created_at,location,project_type,start_date,end_date,units,Amenities")
        .in("status", ["previous"])
        .order("created_at", { ascending: false })
        .limit(6);
      const normalized = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        short_description: p.short_description,
        image_url: p.image_url,
        status: p.status,
        location: p.location || "",
        project_type: p.project_type || "",
        start_date: p.start_date || "",
        end_date: p.end_date || "",
        units: p.units || {},
        Amenities: p.Amenities || [],
      }));
      setPreviousProjects(normalized);
    };
    
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id,name,project,content,rating,video_url,created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (!error && data) {
        setTestimonials(data as unknown as TestimonialItem[]);
      } else {
        setTestimonials(null);
      }
    };
    
    const fetchPropertyTypesAndLocations = async () => {
      const { data } = await supabase
        .from("projects")
        .select("project_type,location")
        .not("project_type", "is", null)
        .not("location", "is", null);
      
      if (data) {
        // Extract unique property types
        const uniqueTypes = [...new Set(data.map(p => p.project_type).filter(Boolean))];
        setPropertyTypes(uniqueTypes);
        
        // Extract unique locations
        const uniqueLocations = [...new Set(data.map(p => p.location).filter(Boolean))];
        setLocations(uniqueLocations);
      }
    };
    
    fetchPrevious();
    fetchTestimonials();
    fetchPropertyTypesAndLocations();
  }, []);

  // Helper functions from Projects page
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "previous":
        return (
          <Badge variant="secondary">
            Previous
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary">
            Completed
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            Active
          </Badge>
        );
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-500 to-green-600";
      case "active":
        return "from-blue-500 to-blue-600";
      case "upcoming":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from("projects")
        .select("id,title,short_description,image_url,status,created_at,location,project_type,start_date,end_date,units,Amenities");

      // Apply filters based on search criteria
      if (searchLocation) {
        query = query.ilike('location', `%${searchLocation}%`);
      }
      
      if (searchPropertyType) {
        query = query.eq('project_type', searchPropertyType);
      }
      
      if (searchStatus) {
        query = query.eq('status', searchStatus);
      }

      // For bedrooms, we'll need to check the units field if it exists
      if (searchBedrooms) {
        // This is a simplified approach - you might need to adjust based on your exact data structure
        query = query.contains('units', { [`${searchBedrooms}B`]: '' });
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        const normalized = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          short_description: p.short_description,
          image_url: p.image_url,
          status: p.status,
          location: p.location,
          project_type: p.project_type,
          start_date: p.start_date,
          end_date: p.end_date,
          units: p.units || {},
          Amenities: p.Amenities || [],
        }));
        setSearchResults(normalized);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-8 sm:py-12">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={heroImage}
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <Logo variant="white" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4" />
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg lg:text-xl font-medium mb-3 sm:mb-4 tracking-wide">
            TRUSTWORTHY REAL ESTATE
          </p>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-10 lg:mb-12 leading-tight">
            HUDA ENGINEERING
          </h1>

          {/* Search Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-5xl mx-auto mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Location Search */}
              <div className="relative group sm:col-span-2 lg:col-span-1">
                <input
                  type="text"
                  placeholder="Search by location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
              </div>

              {/* Property Type */}
              <div className="relative group">
                <select 
                  value={searchPropertyType}
                  onChange={(e) => setSearchPropertyType(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg appearance-none border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <option value="">Property Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type} className="py-2">{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
              </div>

              {/* Bedrooms */}
              <div className="relative group">
                <select 
                  value={searchBedrooms}
                  onChange={(e) => setSearchBedrooms(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg appearance-none border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <option value="">Bedrooms</option>
                  <option value="1" className="py-2">1 Bedroom</option>
                  <option value="2" className="py-2">2 Bedrooms</option>
                  <option value="3" className="py-2">3 Bedrooms</option>
                  <option value="4+" className="py-2">4+ Bedrooms</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
              </div>

              {/* Property Status */}
              <div className="relative group">
                <select 
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg appearance-none border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <option value="">Property Status</option>
                  <option value="active" className="py-2">Active</option>
                  <option value="completed" className="py-2">Completed</option>
                  <option value="upcoming" className="py-2">Upcoming</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all duration-200"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">Search...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Search Properties</span>
                    <span className="sm:hidden">Search</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white/20 hover:bg-white hover:text-gray-800 text-white border-white/30 font-semibold shadow-lg px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200"
                asChild
              >
                <Link to="/virtual-tour" className="flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{t("nav.virtualTour")}</span>
                  <span className="sm:hidden">Virtual Tour</span>
                </Link>
              </Button>
            </div>

            {/* Search Results - Inline */}
            {hasSearched && (
              <div className="mt-6 sm:mt-8 max-w-6xl mx-auto px-2 sm:px-0">
                {/* Results Header */}
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-white text-sm sm:text-base lg:text-lg font-medium px-2">
                    {isSearching ? (
                      "Searching for properties..."
                    ) : searchResults.length > 0 ? (
                      `Found ${searchResults.length} ${searchResults.length === 1 ? 'property' : 'properties'} matching your criteria`
                    ) : (
                      "No properties found matching your search criteria."
                    )}
                  </p>
                </div>

                {/* Results Grid */}
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {searchResults.map((project) => (
                      <Card
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        role="link"
                        tabIndex={0}
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border bg-white/90 backdrop-blur-sm rounded-xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3 sm:gap-4">
                          {/* Left: Thumbnail */}
                          <div className="relative w-full sm:w-48 md:w-64 lg:w-80 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                            <div
                              className={`bg-gradient-to-br ${getStatusColor(
                                project.status
                              )} w-full h-full flex items-center justify-center overflow-hidden relative`}
                            >
                              {project.image_url ? (
                                <img
                                  src={project.image_url}
                                  alt={project.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <Building2 className="w-16 h-16 text-white" />
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-2 right-2">
                                {getStatusBadge(project.status)}
                              </div>
                            </div>
                          </div>

                          {/* Right: Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            {/* Title + Meta */}
                            <div>
                              <CardHeader className="py-0 px-0">
                                <CardTitle className="text-lg md:text-xl line-clamp-1 text-left">
                                  {project.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                  <Building2 className="w-4 h-4 text-primary" />
                                  <span className="truncate">
                                    {project.project_type}
                                  </span>
                                </div>
                              </CardHeader>

                              <CardContent className="px-0 pt-2 pb-0">
                                <div className="flex flex-col gap-2 text-xs md:text-sm">
                                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="truncate">
                                      {project.location}
                                    </span>
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>
                                      Start{" "}
                                      {new Date(project.start_date).getFullYear()}
                                    </span>
                                    {project.end_date && (
                                      <span className="whitespace-nowrap">
                                        • Target{" "}
                                        {new Date(project.end_date).getFullYear()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Units */}
                                  {Object.keys(project.units || {}).length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Users className="w-4 h-4 text-primary" />
                                      {Object.entries(project.units)
                                        .slice(0, 3)
                                        .map(([type, price]) => (
                                          <Badge
                                            key={type}
                                            variant="secondary"
                                            className="text-[10px] md:text-xs bg-primary/10 text-primary"
                                          >
                                            {type}
                                            {price ? ` • ${price}` : ""}
                                          </Badge>
                                        ))}
                                      {Object.entries(project.units).length > 3 && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] md:text-xs"
                                        >
                                          +{Object.entries(project.units).length - 3}{" "}
                                          more
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Amenities */}
                                  {project.Amenities &&
                                    project.Amenities.length > 0 && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        {project.Amenities.slice(0, 3).map(
                                          (amenity, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-[10px] md:text-xs bg-primary/10 text-primary"
                                            >
                                              {amenity}
                                            </Badge>
                                          )
                                        )}
                                        {project.Amenities.length > 3 && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] md:text-xs"
                                          >
                                            +{project.Amenities.length - 3} more
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </CardContent>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-6 sm:py-8 px-4">
                    <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-white/60 mx-auto mb-3 sm:mb-4" />
                    <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">
                      Try adjusting your search criteria
                    </p>
                    <Button
                      onClick={() => {
                        setSearchLocation("");
                        setSearchPropertyType("");
                        setSearchBedrooms("");
                        setSearchStatus("");
                        setHasSearched(false);
                        setSearchResults([]);
                      }}
                      variant="outline"
                      className="bg-white/20 hover:bg-white hover:text-gray-800 text-white border-white/30 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("whyChoose.title")}
            </h2>
          </div>
          <div className="relative">
            {/* Gradient edge fades (mobile only) */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
            {/* Scroll buttons (mobile only) */}
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("why-choose-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("why-choose-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="why-choose-scroll"
              className="
          flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide pb-2 -mx-4 px-4
          snap-x snap-mandatory md:snap-none
        "
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehaviorX: "contain",
              }}
            >
              {[
                {
                  icon: Shield,
                  title: t("whyChoose.quality.title"),
                  desc: t("whyChoose.quality.description"),
                },
                {
                  icon: Users,
                  title: t("whyChoose.expert.title"),
                  desc: t("whyChoose.expert.description"),
                },
                {
                  icon: Clock,
                  title: t("whyChoose.timely.title"),
                  desc: t("whyChoose.timely.description"),
                },
                {
                  icon: Target,
                  title: t("whyChoose.local.title"),
                  desc: t("whyChoose.local.description"),
                },
                {
                  icon: Zap,
                  title: t("whyChoose.modern.title"),
                  desc: t("whyChoose.modern.description"),
                },
                {
                  icon: CheckCircle,
                  title: t("whyChoose.fullService.title"),
                  desc: t("whyChoose.fullService.description"),
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="
              group relative text-center cursor-default rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
              min-w-[80vw] max-w-[80vw] mx-auto md:min-w-0 md:max-w-none flex-shrink-0
              snap-center md:snap-none
            "
                  role="presentation"
                  aria-disabled="true"
                >
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-60 pointer-events-none"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

                  <CardHeader className="relative z-10">
                    <item.icon className="w-16 h-16 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />
                    <CardTitle className="text-xl font-semibold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base">
                      {item.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Scroll indicator for mobile */}
            <div className="flex md:hidden justify-center mt-4 gap-2">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40"
                  id={`why-choose-dot-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("services.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("services.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">
                  {t("services.residential.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.residential.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(
                    t("services.residential.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">
                  {t("services.commercial.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.commercial.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(
                    t("services.commercial.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/services">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
              >
                {t("services.viewAll")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Previous Projects (from backend) */}
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Previous Projects
            </h2>
          </div>

          <div className="relative mb-16">
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("projects-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("projects-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="projects-scroll"
              className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide px-4 snap-x snap-mandatory md:snap-none scroll-smooth pb-2 items-stretch"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehaviorX: "contain",
              }}
            >
              {previousProjects.map((proj) => (
                <Card
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  role="link"
                  tabIndex={0}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[85vw] max-w-[85vw] mx-auto md:min-w-0 md:max-w-none snap-center md:snap-none cursor-pointer"
                >
                  <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                    {proj.image_url ? (
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-primary" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{proj.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{proj.short_description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link to="/projects?tab=delivered">
              <Button size="lg" variant="outline" className="px-8 py-4">
                See more
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process */}

      {/* Testimonials (video from backend) */}
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("testimonials.description")}
            </p>
          </div>

          <div className="relative">
            {/* Gradient edges and buttons on mobile */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("testimonials-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("testimonials-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="testimonials-scroll"
              className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide px-4 snap-x snap-mandatory md:snap-none scroll-smooth pb-2 items-stretch"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehavior: "contain",
              }}
            >
              {(
                testimonials ?? [
                  {
                    id: "fallback-1",
                    name: "Ahmed Hassan",
                    project: "Residential Complex Owner",
                    content:
                      "Huda Engineering delivered our apartment complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                  {
                    id: "fallback-2",
                    name: "Meron Tadesse",
                    project: "Commercial Building Client",
                    content:
                      "The quality of construction and the professionalism of the team was outstanding. They handled every aspect of our office building project perfectly.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                  {
                    id: "fallback-3",
                    name: "Solomon Bekele",
                    project: "Luxury Home Owner",
                    content:
                      "From design to completion, Huda Engineering provided exceptional service. Our dream home became reality thanks to their expertise and dedication.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                ]
              ).map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow min-w-[85vw] max-w-[85vw] mx-auto md:min-w-0 md:max-w-none snap-center md:snap-none"
                >
                  <CardHeader>
                    <div className="flex mb-4">
                      {[
                        ...Array(
                          Math.max(0, Math.min(5, testimonial.rating || 0))
                        ),
                      ].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <CardTitle className="text-lg">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-primary">
                      {testimonial.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic mb-4">
                      "{testimonial.content}"
                    </p>
                    {testimonial.video_url &&
                      (testimonial.video_url.includes("youtube.com") ||
                      testimonial.video_url.includes("youtu.be") ? (
                        <div className="w-full h-56">
                          <iframe
                            src={testimonial.video_url}
                            title={`${testimonial.name} video testimonial`}
                            allowFullScreen
                            className="w-full h-full rounded-lg"
                          ></iframe>
                        </div>
                      ) : (
                        <video controls className="w-full rounded-lg">
                          <source
                            src={testimonial.video_url}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}

      <Footer />
    </div>
  );
};

export default Index;
