
import { useState } from "react";
import { Calendar, MapPin, Home, DollarSign, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: "Available" | "Reserved" | "Sold";
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
}

const properties: Property[] = [
  {
    id: "1",
    title: "Modern 3BR Apartment",
    location: "Bole, Addis Ababa",
    price: "4,500,000 ETB",
    status: "Available",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    area: "120 sqm"
  },
  {
    id: "2",
    title: "Luxury Villa with Garden",
    location: "Old Airport, Addis Ababa",
    price: "12,000,000 ETB",
    status: "Available",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    bedrooms: 5,
    bathrooms: 4,
    area: "350 sqm"
  },
  {
    id: "3",
    title: "Cozy 2BR Condo",
    location: "Kazanchis, Addis Ababa",
    price: "3,200,000 ETB",
    status: "Reserved",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    area: "85 sqm"
  },
  {
    id: "4",
    title: "Executive Penthouse",
    location: "Sarbet, Addis Ababa",
    price: "8,500,000 ETB",
    status: "Available",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    area: "200 sqm"
  }
];

const Booking = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    property: "",
    moveInDate: "",
    notes: ""
  });

  const availableProperties = properties.filter(p => p.status === "Available");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking form submitted:", formData);
    
    toast({
      title: "Booking Request Submitted!",
      description: "We'll contact you within 24 hours to confirm your property viewing appointment.",
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      property: "",
      moveInDate: "",
      notes: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Book Your Dream Property
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our available properties and submit a booking request to schedule a viewing
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Property Listings */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Available Properties</h2>
            <div className="space-y-6">
              {properties.map((property) => (
                <Card key={property.id} className={`transition-all duration-300 hover:shadow-lg ${
                  property.status !== "Available" ? "opacity-60" : ""
                }`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{property.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          property.status === "Available" 
                            ? "bg-green-100 text-green-800"
                            : property.status === "Reserved"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {property.bedrooms} BR
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-1">🚿</span>
                          {property.bathrooms} Bath
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-1">📐</span>
                          {property.area}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary">
                          <DollarSign className="w-5 h-5 mr-1" />
                          <span className="text-lg font-bold">{property.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Book a Property Viewing</CardTitle>
                <CardDescription>
                  Fill out the form below to schedule a viewing appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID *</Label>
                    <Input
                      id="nationalId"
                      name="nationalId"
                      type="text"
                      required
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      placeholder="Enter your national ID number"
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property">Select Property *</Label>
                    <Select 
                      value={formData.property} 
                      onValueChange={(value) => setFormData({...formData, property: value})}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Choose a property" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {availableProperties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title} - {property.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
                    <Input
                      id="moveInDate"
                      name="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or questions..."
                      className="bg-background border-input"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Submit Booking Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
