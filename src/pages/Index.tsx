
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Phone, Mail, MapPin, Award, Shield, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Calendar className="w-4 h-4 mr-2" />
            Established 2009 E.C (2017 G.C)
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Building Ethiopia's
            <span className="text-accent block">Modern Future</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            We build modern residential, commercial, and mixed-use buildings in Ethiopia with a focus on quality, safety, and timely delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3">
                Start Your Project
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3">
                View Our Work
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">7+</div>
              <div className="text-primary-foreground/80">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">50+</div>
              <div className="text-primary-foreground/80">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">0</div>
              <div className="text-primary-foreground/80">Legal Disputes</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">About Huda Engineering</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Based in Addis Ababa, we are a private construction and real estate development company committed to excellence in every project we undertake.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Quality & Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Zero litigation history demonstrates our commitment to quality construction and client satisfaction.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional engineers, architects, and foremen backed by our own tools and heavy machinery.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Timely Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We prioritize clear communication and project timelines to ensure on-time completion.
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

export default Index;
