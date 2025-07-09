
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Phone, Mail, MapPin, Award, Shield, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-800" />
              <span className="text-xl font-bold text-gray-900">Huda Engineering PLC</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-blue-800 transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-blue-800 transition-colors">Services</a>
              <a href="#projects" className="text-gray-700 hover:text-blue-800 transition-colors">Projects</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-800 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-amber-500 text-black hover:bg-amber-600">
            <Calendar className="w-4 h-4 mr-2" />
            Established 2009 E.C (2017 G.C)
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Building Ethiopia's
            <span className="text-amber-400 block">Modern Future</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            We build modern residential, commercial, and mixed-use buildings in Ethiopia with a focus on quality, safety, and timely delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3">
              Start Your Project
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-800 px-8 py-3">
              View Our Work
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-400">7+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">50+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">0</div>
              <div className="text-blue-100">Legal Disputes</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Huda Engineering</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based in Addis Ababa, we are a private construction and real estate development company committed to excellence in every project we undertake.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-800 mx-auto mb-4" />
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
                <Users className="w-12 h-12 text-blue-800 mx-auto mb-4" />
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
                <Clock className="w-12 h-12 text-blue-800 mx-auto mb-4" />
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

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Full-service construction from design to execution</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Building2 className="w-10 h-10 text-blue-800 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Residential Buildings</h3>
              <p className="text-gray-600 text-sm">Modern apartments and luxury homes designed for Ethiopian families.</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Award className="w-10 h-10 text-amber-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Commercial Spaces</h3>
              <p className="text-gray-600 text-sm">Office complexes and commercial buildings that meet business needs.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Users className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Mixed-Use Development</h3>
              <p className="text-gray-600 text-sm">Integrated developments combining residential and commercial spaces.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Shield className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Utility Systems</h3>
              <p className="text-gray-600 text-sm">Complete utility infrastructure and systems integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notable Projects</h2>
            <p className="text-xl text-gray-600">Showcasing our expertise in Ethiopian construction</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Huda Apartment Building</CardTitle>
                <CardDescription>B+G+9 Residential Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">251M ETB</Badge>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">SYS Luxury Apartments</CardTitle>
                <CardDescription>2B+G+13 High-Rise Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">Premium Project</Badge>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-700 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Tokoma Office Building</CardTitle>
                <CardDescription>B+G+5 Mixed Office Complex</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">Commercial</Badge>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Start Your Project Today</h2>
            <p className="text-xl text-blue-100">Ready to build your vision? Get in touch with our expert team.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <MapPin className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-blue-100">Addis Ababa, Ethiopia</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Phone className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-blue-100">+251-XXX-XXXX</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Mail className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-blue-100">info@hudaengineering.com</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3">
              Request a Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-amber-400" />
              <span className="text-lg font-semibold">Huda Engineering PLC</span>
            </div>
            <div className="text-sm">
              © 2024 Huda Engineering PLC. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
