
import { useState, useEffect, useCallback } from "react";
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

  const scrollToNext = useCallback(() => {
    if (currentIndex < announcements.length - 1 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  }, [currentIndex, announcements.length, isScrolling]);

  const scrollToPrev = useCallback(() => {
    if (currentIndex > 0 && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 800);
    }
  }, [currentIndex, isScrolling]);

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

    let startX: number;
    let startY: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) {
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = startX - endX;
      const diffY = startY - endY;

      // Minimum swipe distance
      const minSwipeDistance = 50;

      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
        if (diffY > 0) {
          // Swipe up - go to next
          scrollToNext();
        } else {
          // Swipe down - go to previous
          scrollToPrev();
        }
      }

      startX = 0;
      startY = 0;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, isScrolling, scrollToNext, scrollToPrev]);

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
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <h2 className="text-sm sm:text-lg font-semibold text-center">Latest Company Updates & Announcements</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Announcement Display */}

        <div 
          className={`min-h-full py-8 sm:py-12 transition-all duration-700 ease-in-out transform ${
            isScrolling ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row items-center md:items-start">
            <Link
              to={`/announcements/${currentAnnouncement.id}`}
              className="block w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
                {/* Image Section */}
                <div className="relative w-full">
                  <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl">
                    <img
                      src={currentAnnouncement.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"}
                      alt={currentAnnouncement.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <Badge className={`${getCategoryColor(currentAnnouncement.category)} border-0 text-xs sm:text-sm`}>
                        <Tag className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        {currentAnnouncement.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4 sm:space-y-6 lg:pl-8 w-full">
                  <div className="flex items-center text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {formatDate(currentAnnouncement.created_at)}
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground leading-tight group-hover:underline">
                    {currentAnnouncement.title}
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                    {currentAnnouncement.short_description}
                  </p>

                  <div className="pt-2 sm:pt-4">
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">
                      {currentAnnouncement.content}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>


        {/* Navigation Indicators: hidden on small screens, show on md+ */}
        <div className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 flex-col space-y-1">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isScrolling) {
                  setIsScrolling(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsScrolling(false), 700);
                }
              }}
              aria-label={`Go to announcement ${index + 1}`}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>


        {/* Scroll Hints - always visible, moved slightly higher on small screens to avoid overlap */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-muted-foreground z-30">
          <div className="text-xs sm:text-sm text-center">
            <div>{currentIndex + 1} of {announcements.length}</div>
            <div className="text-xs hidden sm:block">Scroll or use arrow keys to navigate</div>
            <div className="text-xs sm:hidden">Swipe to navigate</div>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            {currentIndex > 0 && (
              <button
                onClick={scrollToPrev}
                className="flex items-center space-x-1 text-xs hover:text-primary transition-colors"
                disabled={isScrolling}
              >
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
            )}
            {currentIndex < announcements.length - 1 && (
              <button
                onClick={scrollToNext}
                className="flex items-center space-x-1 text-xs hover:text-primary transition-colors"
                disabled={isScrolling}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
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
