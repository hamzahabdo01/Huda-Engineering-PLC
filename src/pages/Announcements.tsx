
import { useState, useEffect } from "react";
import { Calendar, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  created_at: string;
  category: string;
  short_description: string;
  content: string;
  image_url: string;
  is_published: boolean;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "New Projects": return "bg-blue-100 text-blue-800";
      case "Construction Progress": return "bg-green-100 text-green-800";
      case "Sales": return "bg-yellow-100 text-yellow-800";
      case "Company News": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const scrollToNext = () => {
    if (currentIndex < announcements.length - 1 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        scrollToNext();
      } else {
        scrollToPrev();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        scrollToNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToPrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, isScrolling]);

  const currentAnnouncement = announcements[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading announcements...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No announcements yet</h2>
            <p className="text-muted-foreground">Check back later for updates.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Sticky Header Banner */}
      <div className="bg-primary text-primary-foreground py-3 sm:py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold">Latest Company Updates & Announcements</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-auto min-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Announcement Display */}
        <div 
          className={`w-full transition-all duration-700 ease-in-out transform ${
            isScrolling ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <Link to={`/announcements/${currentAnnouncement.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 w-full items-start group">
              {/* Image Section */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                  <img
                    src={currentAnnouncement.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"}
                    alt={currentAnnouncement.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <Badge className={`${getCategoryColor(currentAnnouncement.category)} border-0 text-xs sm:text-sm`}>
                      <Tag className="w-3 h-3 mr-1 inline-block" />
                      {currentAnnouncement.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-4 sm:space-y-6 lg:pl-8 block">
                <div className="flex items-center text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(currentAnnouncement.created_at)}
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {currentAnnouncement.title}
                </h1>
                
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {currentAnnouncement.short_description}
                </p>
                
                <div className="pt-2 sm:pt-4">
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {currentAnnouncement.content}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Indicators */}
        <div className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 flex-col space-y-2">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isScrolling) {
                  setIsScrolling(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsScrolling(false), 800);
                }
              }}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Scroll Hints */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-muted-foreground">
          <div className="text-xs sm:text-sm text-center">
            <div>{currentIndex + 1} of {announcements.length}</div>
            <div className="text-[10px] sm:text-xs">Scroll or use arrow keys to navigate</div>
          </div>
          <div className="flex space-x-3 sm:space-x-4">
            {currentIndex > 0 && (
              <button
                onClick={scrollToPrev}
                className="flex items-center space-x-1 text-xs hover:text-primary transition-colors"
                disabled={isScrolling}
              >
                <ChevronUp className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            {currentIndex < announcements.length - 1 && (
              <button
                onClick={scrollToNext}
                className="flex items-center space-x-1 text-xs hover:text-primary transition-colors"
                disabled={isScrolling}
              >
                <span>Next</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Announcements;
