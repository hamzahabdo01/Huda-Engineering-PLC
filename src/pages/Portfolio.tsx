import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
}

const samplePortfolio: PortfolioItem[] = [
  {
    id: 1,
    title: "Residential Complex",
    category: "Residential",
    description: "A modern residential apartment complex built to high quality standards.",
    image: "/images/portfolio/residential1.jpg",
  },
  {
    id: 2,
    title: "Commercial Tower",
    category: "Commercial",
    description: "High-rise commercial office space with advanced infrastructure.",
    image: "/images/portfolio/commercial1.jpg",
  },
  {
    id: 3,
    title: "Luxury Villa",
    category: "Residential",
    description: "Custom luxury villa with innovative architecture and sustainable materials.",
    image: "/images/portfolio/residential2.jpg",
  },
];

const categories = ["All", "Residential", "Commercial"];

const Portfolio = () => {
  const [filter, setFilter] = useState("All");

  const filteredItems =
    filter === "All" ? samplePortfolio : samplePortfolio.filter((item) => item.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Huda Engineering PLC Portfolio</h1>
          <p className="text-xl text-primary-foreground/90">
            Explore our diverse range of projects showcasing our expertise and commitment to excellence.
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-center gap-4">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            onClick={() => setFilter(cat)}
            className="px-6"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-56 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
