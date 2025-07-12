import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Maps = () => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Huda Engineering PLC location in Addis Ababa (example coordinates)
  const companyLocation = {
    lat: 9.0192,
    lng: 38.7525,
    name: "Huda Engineering PLC",
    address: "Bole Road, Addis Ababa, Ethiopia"
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+251 11 123 4567",
      action: "tel:+251111234567"
    },
    {
      icon: Mail,
      title: "Email", 
      value: "info@hudaengineering.com",
      action: "mailto:info@hudaengineering.com"
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Fri: 8:00 AM - 6:00 PM"
    },
    {
      icon: MapPin,
      title: "Address",
      value: companyLocation.address
    }
  ];

  useEffect(() => {
    const initializeMap = async () => {
      // Using a simple embedded map as a fallback for Google Maps
      // In production, you would use Google Maps API with proper API key
      try {
        if (mapRef.current) {
          // Create a simple map container with embedded Google Maps
          const mapContainer = mapRef.current;
          mapContainer.innerHTML = `
            <iframe
              width="100%"
              height="500"
              frameborder="0"
              scrolling="no"
              marginheight="0"
              marginwidth="0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=38.7425%2C9.0092%2C38.7625%2C9.0292&layer=mapnik&marker=9.0192%2C38.7525"
              style="border: 0; border-radius: 0.5rem;"
            ></iframe>
          `;
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        // Fallback content
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div class="text-center">
                <MapPin class="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 class="text-lg font-semibold">Map unavailable</h3>
                <p class="text-muted-foreground">Please visit us at ${companyLocation.address}</p>
              </div>
            </div>
          `;
        }
      }
    };

    initializeMap();
  }, []);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${companyLocation.lat},${companyLocation.lng}`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${companyLocation.lat},${companyLocation.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {t("maps.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t("maps.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={openInGoogleMaps} size="lg">
              <MapPin className="h-5 w-5 mr-2" />
              Open in Google Maps
            </Button>
            <Button onClick={getDirections} variant="outline" size="lg">
              <Navigation className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </section>

      {/* Map and Contact Info */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Our Location
                  </CardTitle>
                  <CardDescription>
                    Visit our office in Addis Ababa for consultations and project discussions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={mapRef} className="w-full h-96 bg-muted rounded-lg">
                    {!mapLoaded && (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={openInGoogleMaps} variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      View in Maps
                    </Button>
                    <Button onClick={getDirections} variant="outline" size="sm">
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with us</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {info.title}
                          </h4>
                          {info.action ? (
                            <a 
                              href={info.action}
                              className="text-foreground hover:text-primary transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-foreground">{info.value}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Parking Available</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Wheelchair Accessible</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Public Transport Access</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Meeting Rooms</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nearby Landmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Bole International Airport (15 min drive)</p>
                  <p>• Edna Mall (5 min walk)</p>
                  <p>• Commercial Bank of Ethiopia (2 min walk)</p>
                  <p>• Bole Medhanialem Church (10 min walk)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Location Info */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our centrally located office in Addis Ababa makes it convenient for clients 
              to visit us for consultations, project discussions, and property viewings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Prime Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Located in the heart of Bole, easily accessible from all parts of Addis Ababa
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Flexible Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Extended business hours to accommodate your schedule, including weekend appointments
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Multiple ways to reach us - phone, email, or visit in person for immediate assistance
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Maps;