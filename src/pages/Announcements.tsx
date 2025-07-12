
import { useState } from "react";
import { Calendar, Clock, Tag, Search, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: "New Projects" | "Construction Progress" | "Sales" | "Company News";
  shortDescription: string;
  fullContent: string;
  image?: string;
}

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Grand Opening of Luxury Residential Complex in Bole",
    date: "2024-01-15",
    category: "New Projects",
    shortDescription: "We're excited to announce the grand opening of our newest luxury residential complex featuring 50 premium units with modern amenities.",
    fullContent: "We're thrilled to announce the grand opening of our newest luxury residential complex in the heart of Bole district. This state-of-the-art development features 50 premium residential units, each designed with modern living in mind. The complex includes a swimming pool, fitness center, children's playground, and 24/7 security. Units range from 2-bedroom apartments to 4-bedroom penthouses, all featuring high-end finishes and smart home technology. Early bird pricing is available for the first 20 buyers.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop"
  },
  {
    id: "2",
    title: "Construction Progress Update - Sarbet Heights Project",
    date: "2024-01-10",
    category: "Construction Progress",
    shortDescription: "Our Sarbet Heights project is now 75% complete. We're on track to deliver all units by March 2024.",
    fullContent: "We're pleased to update you on the significant progress of our Sarbet Heights residential project. The construction is now 75% complete, with all structural work finished and interior finishing well underway. The landscaping and external amenities installation has begun. We remain on schedule to deliver all 80 units by March 2024. Site visits are available for interested buyers every weekend from 9 AM to 5 PM.",
    image: "https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=250&fit=crop"
  },
  {
    id: "3",
    title: "Special Holiday Sales Campaign - Up to 15% Discount",
    date: "2024-01-05",
    category: "Sales",
    shortDescription: "Limited time offer: Get up to 15% discount on selected properties during our holiday sales campaign.",
    fullContent: "This holiday season, we're offering exceptional discounts on selected properties across our portfolio. Enjoy up to 15% off on apartments in our Kazanchis development, and 10% off on villa units in Old Airport area. This promotion is valid until January 31st, 2024, and includes flexible payment plans. Additional benefits include free interior design consultation and one-year maintenance package. Contact our sales team to learn more about eligibility and terms.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop"
  },
  {
    id: "4",
    title: "Huda Engineering PLC Wins Real Estate Excellence Award",
    date: "2023-12-28",
    category: "Company News",
    shortDescription: "We're honored to receive the Real Estate Excellence Award for our commitment to quality and innovation in property development.",
    fullContent: "We're proud to announce that Huda Engineering PLC has been awarded the prestigious Real Estate Excellence Award 2023 by the Ethiopian Real Estate Association. This recognition highlights our commitment to delivering high-quality residential and commercial properties while maintaining the highest standards of construction and customer service. The award ceremony took place at the Skylight Hotel, where we were recognized alongside other industry leaders. This achievement motivates us to continue our mission of transforming Ethiopia's real estate landscape.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop"
  },
  {
    id: "5",
    title: "New Affordable Housing Initiative Launched",
    date: "2023-12-20",
    category: "New Projects",
    shortDescription: "Introducing our affordable housing program designed to make homeownership accessible to middle-income families.",
    fullContent: "We're excited to launch our new affordable housing initiative, aimed at making quality homes accessible to middle-income families in Addis Ababa. This program offers 2 and 3-bedroom apartments starting from 2.8 million ETB, with flexible financing options and down payments as low as 20%. The first phase includes 120 units in the Lebu area, featuring modern amenities while maintaining affordability. Registration is now open, and we're partnering with local banks to provide attractive mortgage rates for qualified buyers.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop"
  }
];

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const categories = ["all", "New Projects", "Construction Progress", "Sales", "Company News"];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Company Announcements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our latest projects, construction progress, and company news
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-input"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 bg-background border-input">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Announcements Grid */}
        <div className="grid gap-6">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col lg:flex-row">
                {announcement.image && (
                  <div className="lg:w-1/3">
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                    />
                  </div>
                )}
                <div className={`${announcement.image ? 'lg:w-2/3' : 'w-full'} p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                          <Tag className="w-3 h-3 inline mr-1" />
                          {announcement.category}
                        </span>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(announcement.date)}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {announcement.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {expandedCard === announcement.id 
                      ? announcement.fullContent 
                      : announcement.shortDescription
                    }
                  </p>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedCard(
                      expandedCard === announcement.id ? null : announcement.id
                    )}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 p-0 h-auto font-medium"
                  >
                    {expandedCard === announcement.id ? "Show Less" : "Read More"}
                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                      expandedCard === announcement.id ? "rotate-90" : ""
                    }`} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No announcements found matching your criteria.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Announcements;
