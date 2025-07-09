
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Projects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Projects</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Showcasing our expertise in Ethiopian construction and development
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground">Our most notable construction achievements</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Huda Apartment Building */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary to-primary/80 h-64 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-primary-foreground" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl">Huda Apartment Building</CardTitle>
                  <Badge className="bg-accent text-accent-foreground">Flagship</Badge>
                </div>
                <CardDescription className="text-lg">B+G+9 Residential Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Completed 2023</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>120+ Family Units</span>
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold text-primary mb-2">251M ETB</div>
                    <p className="text-muted-foreground">
                      A modern residential complex featuring basement parking, ground floor commercial space, 
                      and 9 floors of luxury apartments with modern amenities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SYS Luxury Apartments */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-accent to-accent/80 h-64 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-accent-foreground" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl">SYS Luxury Apartments</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                </div>
                <CardDescription className="text-lg">2B+G+13 High-Rise Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Completed 2024</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>200+ Luxury Units</span>
                  </div>
                  <div className="pt-4">
                    <div className="text-lg font-semibold text-primary mb-2">Premium Development</div>
                    <p className="text-muted-foreground">
                      Our tallest residential project featuring two basement levels, ground floor amenities, 
                      and 13 floors of luxury apartments with panoramic city views.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Projects Grid */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">All Projects</h2>
            <p className="text-xl text-muted-foreground">Our complete portfolio of construction projects</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tokoma Office Building */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Tokoma Office Building</CardTitle>
                <CardDescription>B+G+5 Mixed Office Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Completed 2022</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge variant="secondary">Commercial</Badge>
              </CardContent>
            </Card>

            {/* Residential Project 1 */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-accent/20 to-primary/20 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Megenagna Residences</CardTitle>
                <CardDescription>G+6 Apartment Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Completed 2021</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge variant="secondary">Residential</Badge>
              </CardContent>
            </Card>

            {/* Commercial Project */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary/30 to-accent/30 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Bole Commercial Center</CardTitle>
                <CardDescription>G+4 Retail Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Completed 2020</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge variant="secondary">Commercial</Badge>
              </CardContent>
            </Card>

            {/* Mixed Use Project */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-accent/25 to-primary/25 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Kirkos Mixed Development</CardTitle>
                <CardDescription>B+G+8 Mixed-Use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Completed 2019</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge variant="secondary">Mixed-Use</Badge>
              </CardContent>
            </Card>

            {/* Luxury Homes */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary/15 to-accent/15 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">CMC Luxury Villas</CardTitle>
                <CardDescription>Premium Single Family Homes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Completed 2023</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge variant="secondary">Luxury</Badge>
              </CardContent>
            </Card>

            {/* Ongoing Project */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-accent">
              <div className="bg-gradient-to-br from-accent/30 to-primary/30 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Sarbet Towers</CardTitle>
                <CardDescription>2B+G+12 Residential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                </div>
                <Badge className="bg-accent text-accent-foreground">Ongoing</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
