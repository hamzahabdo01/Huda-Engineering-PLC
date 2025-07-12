
import { useState, useEffect } from "react";
import { Calendar, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: "New Projects" | "Construction Progress" | "Sales" | "Company News";
  shortDescription: string;
  fullContent: string;
  image: string;
}

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Grand Opening of Luxury Residential Complex in Bole",
    date: "2024-01-15",
    category: "New Projects",
    shortDescription: "We're excited to announce the grand opening of our newest luxury residential complex featuring 50 premium units with modern amenities.",
    fullContent: "We're thrilled to announce the grand opening of our newest luxury residential complex in the heart of Bole district. This state-of-the-art development features 50 premium residential units, each designed with modern living in mind. The complex includes a swimming pool, fitness center, children's playground, and 24/7 security. Units range from 2-bedroom apartments to 4-bedroom penthouses, all featuring high-end finishes and smart home technology. Early bird pricing is available for the first 20 buyers.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop"
  },
  {
    id: "2",
    title: "Construction Progress Update - Sarbet Heights Project",
    date: "2024-01-10",
    category: "Construction Progress",
    shortDescription: "Our Sarbet Heights project is now 75% complete. We're on track to deliver all units by March 2024.",
    fullContent: "We're pleased to update you on the significant progress of our Sarbet Heights residential project. The construction is now 75% complete, with all structural work finished and interior finishing well underway. The landscaping and external amenities installation has begun. We remain on schedule to deliver all 80 units by March 2024. Site visits are available for interested buyers every weekend from 9 AM to 5 PM.",
    image: "https://images.unsplash.com/photo-1541976590-713941681591?w=600&h=400&fit=crop"
  },
  {
    id: "3",
    title: "Special Holiday Sales Campaign - Up to 15% Discount",
    date: "2024-01-05",
    category: "Sales",
    shortDescription: "Limited time offer: Get up to 15% discount on selected properties during our holiday sales campaign.",
    fullContent: "This holiday season, we're offering exceptional discounts on selected properties across our portfolio. Enjoy up to 15% off on apartments in our Kazanchis development, and 10% off on villa units in Old Airport area. This promotion is valid until January 31st, 2024, and includes flexible payment plans. Additional benefits include free interior design consultation and one-year maintenance package. Contact our sales team to learn more about eligibility and terms.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
  },
  {
    id: "4",
    title: "Huda Engineering PLC Wins Real Estate Excellence Award",
    date: "2023-12-28",
    category: "Company News",
    shortDescription: "We're honored to receive the Real Estate Excellence Award for our commitment to quality and innovation in property development.",
    fullContent: "We're proud to announce that Huda Engineering PLC has been awarded the prestigious Real Estate Excellence Award 2023 by the Ethiopian Real Estate Association. This recognition highlights our commitment to delivering high-quality residential and commercial properties while maintaining the highest standards of construction and customer service. The award ceremony took place at the Skylight Hotel, where we were recognized alongside other industry leaders. This achievement motivates us to continue our mission of transforming Ethiopia's real estate landscape.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop"
  },
  {
    id: "5",
    title: "New Affordable Housing Initiative Launched",
    date: "2023-12-20",
    category: "New Projects",
    shortDescription: "Introducing our affordable housing program designed to make homeownership accessible to middle-income families.",
    fullContent: "We're excited to launch our new affordable housing initiative, aimed at making quality homes accessible to middle-income families in Addis Ababa. This program offers 2 and 3-bedroom apartments starting from 2.8 million ETB, with flexible financing options and down payments as low as 20%. The first phase includes 120 units in the Lebu area, featuring modern amenities while maintaining affordability. Registration is now open, and we're partnering with local banks to provide attractive mortgage rates for qualified buyers.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
  }
];

const Announcements = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Sticky Header Banner */}
      <div className="bg-primary text-primary-foreground py-4 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Clock className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Latest Company Updates & Announcements</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-[calc(100vh-8rem)] overflow-hidden">
        {/* Announcement Display */}
        <div 
          className={`h-full transition-all duration-700 ease-in-out transform ${
            isScrolling ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="grid lg:grid-cols-2 gap-12 w-full items-center">
              {/* Image Section */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={currentAnnouncement.image}
                    alt={currentAnnouncement.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getCategoryColor(currentAnnouncement.category)} border-0`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {currentAnnouncement.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6 lg:pl-8">
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(currentAnnouncement.date)}
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {currentAnnouncement.title}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentAnnouncement.shortDescription}
                </p>
                
                <div className="pt-4">
                  <p className="text-foreground leading-relaxed">
                    {currentAnnouncement.fullContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Indicators */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Scroll Hints */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-muted-foreground">
          <div className="text-sm text-center">
            <div>{currentIndex + 1} of {announcements.length}</div>
            <div className="text-xs">Scroll or use arrow keys to navigate</div>
          </div>
          <div className="flex space-x-4">
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
