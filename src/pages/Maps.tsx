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

  // Company location coordinates (Addis Ababa, Ethiopia)
  const companyLocation = {
    lat: 9.005401,
    lng: 38.763611,
    address: "Bole Sub City, Wereda 03, Addis Ababa, Ethiopia"
  };

  // Contact information
  const contactInfo = [
    {
      icon: Phone,
      label: t("contact.info.phone"),
      primary: "+251 91 123 4567",
      secondary: "+251 11 234 5678"
    },
    {
      icon: Mail,
      label: t("contact.info.email"),
      primary: "info@hudaengineering.com",
      secondary: "projects@hudaengineering.com"
    },
    {
      icon: Clock,
      label: t("contact.info.hours"),
      primary: t("contact.info.mondayFriday"),
      secondary: t("contact.info.saturday")
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

  // Open Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${companyLocation.lat},${companyLocation.lng}`;
    window.open(url, '_blank');
  };

  // Get directions
  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${companyLocation.lat},${companyLocation.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("maps.title")}
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            {t("maps.description")}
          </p>
          <Button onClick={openInGoogleMaps} size="lg">
            <MapPin className="mr-2 h-5 w-5" />
            {t("mapsPage.openInGoogleMaps")}
          </Button>
        </div>
      </section>

      {/* Map and Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Interactive Map Container */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{t("hero.location")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Embedded Google Maps */}
                  <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6177614537234!2d${companyLocation.lng}!3d${companyLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMTkuNCJOIDM4wrA0NSc0OS4wIkU!5e0!3m2!1sen!2set!4v1635000000000!5m2!1sen!2set`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button onClick={openInGoogleMaps} variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      {t("mapsPage.viewInMaps")}
                    </Button>
                    <Button onClick={getDirections} variant="outline" size="sm">
                      <Navigation className="mr-2 h-4 w-4" />
                      {t("mapsPage.directions")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("mapsPage.contactInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.label}</h3>
                          <p className="text-muted-foreground">{info.primary}</p>
                          {info.secondary && (
                            <p className="text-muted-foreground">{info.secondary}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{t("contact.info.location")}</h3>
                      <p className="text-muted-foreground">{companyLocation.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact CTA */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("mapsPage.easyContact")}</CardTitle>
                  <CardDescription>
                    {t("contact.hero.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => window.location.href = 'tel:+251911234567'}>
                      <Phone className="mr-2 h-4 w-4" />
                      {t("contact.info.phone")}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = 'mailto:info@hudaengineering.com'}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t("contact.info.email")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Maps;