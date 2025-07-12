import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Phone, Mail, MapPin, Award, Shield, Clock, Zap, Target, CheckCircle, ArrowRight, Star, TrendingUp, Globe, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#00555b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <div className="space-y-6">
                <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 text-sm border-white/30">
                  <Calendar className="w-4 h-4 mr-2" />
                  REAL ESTATE
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Discover Your Future:
                  <span className="block text-accent mt-2">Find The Perfect Property</span>
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 max-w-2xl leading-relaxed">
                  We build modern residential, commercial, and mixed-use buildings in Ethiopia with a focus on quality, safety, and timely delivery.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg">
                    Explore Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white/30 text-white hover:bg-white/10">
                    View Properties
                  </Button>
                </Link>
              </div>

              {/* Property Search Filters */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-white/70 mb-1">Location</div>
                  <div className="text-white font-medium">Addis Ababa, Ethiopia</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-white/70 mb-1">Pricing</div>
                  <div className="text-white font-medium">3M - 15M ETB</div>
                </div>
              </div>
            </div>

            {/* Right Content - Property Image */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
                  alt="Luxury Apartment Complex"
                  className="w-full h-full object-cover"
                />
                
                {/* Property Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white space-y-2">
                    <h3 className="text-xl font-bold">Luxury Apartment Complex</h3>
                    <p className="text-gray-200 text-sm">Modern 3BR apartment with premium finishes</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full">Available</span>
                      <span>B+G+9 Floors</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border">
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-accent rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-accent-foreground">7+</div>
                <div className="text-sm text-accent-foreground/80">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Why Choose Huda Engineering?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We bring together expertise, integrity, and innovation to deliver exceptional construction projects across Ethiopia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Quality & Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Zero litigation history demonstrates our unwavering commitment to quality construction and complete client satisfaction in every project we undertake.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Professional engineers, architects, and skilled foremen backed by our own comprehensive tools and heavy machinery for complete project control.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Timely Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We prioritize clear communication and realistic project timelines to ensure on-time completion without compromising on quality standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Local Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Deep understanding of Ethiopian construction standards, local terrain, logistics, and regulatory requirements for seamless project execution.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Modern Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We leverage cutting-edge construction technologies and modern building techniques to deliver innovative, efficient, and sustainable structures.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Full-Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  From initial design and planning to final construction and handover, we provide comprehensive end-to-end construction services.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive construction solutions for all your building needs in Ethiopia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Residential Construction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  From luxury homes to high-rise apartment buildings, we create modern living spaces that combine comfort, functionality, and aesthetic appeal.
                </CardDescription>
                <ul className="text-sm space-y-2">
                  <li>• Single-family luxury homes</li>
                  <li>• Multi-story apartment buildings</li>
                  <li>• Residential complexes</li>
                  <li>• Custom home designs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Commercial Development</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Professional office buildings, retail spaces, and commercial complexes designed to meet modern business requirements and standards.
                </CardDescription>
                <ul className="text-sm space-y-2">
                  <li>• Office buildings and complexes</li>
                  <li>• Retail and shopping centers</li>
                  <li>• Industrial facilities</li>
                  <li>• Mixed-use developments</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/services">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Featured Projects</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Showcasing our commitment to excellence through completed projects across Ethiopia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>Huda Apartment Building</CardTitle>
                <Badge className="w-fit">B+G+9 Floors</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  A modern 9-story residential building featuring contemporary design, premium finishes, and modern amenities. Project value: 251M ETB.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>SYS Luxury Apartments</CardTitle>
                <Badge className="w-fit">2B+G+13 Floors</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Premium high-rise apartment complex with luxury amenities, underground parking, and stunning city views. Our tallest completed project.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Globe className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>Tokoma Office Building</CardTitle>
                <Badge className="w-fit">B+G+5 Floors</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Modern mixed-use office building with commercial spaces, meeting rooms, and contemporary facilities for business operations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/projects">
              <Button size="lg" variant="outline" className="px-8 py-4">
                View All Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Our Construction Process</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A systematic approach to ensure quality, efficiency, and client satisfaction in every project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Consultation & Planning",
                description: "Initial project assessment, requirements gathering, and comprehensive planning phase.",
                icon: Users
              },
              {
                step: "02", 
                title: "Design & Engineering",
                description: "Detailed architectural design, structural engineering, and technical specifications.",
                icon: Target
              },
              {
                step: "03",
                title: "Construction & Execution", 
                description: "Professional construction execution with quality control and safety management.",
                icon: Wrench
              },
              {
                step: "04",
                title: "Completion & Handover",
                description: "Final inspections, quality assurance, and smooth project handover to clients.",
                icon: CheckCircle
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="text-4xl font-bold text-accent mb-4">{item.step}</div>
                  <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real feedback from satisfied clients who have trusted us with their construction projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ahmed Hassan",
                project: "Residential Complex Owner",
                content: "Huda Engineering delivered our apartment complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
                rating: 5
              },
              {
                name: "Meron Tadesse", 
                project: "Commercial Building Client",
                content: "The quality of construction and the professionalism of the team was outstanding. They handled every aspect of our office building project perfectly.",
                rating: 5
              },
              {
                name: "Solomon Bekele",
                project: "Luxury Home Owner", 
                content: "From design to completion, Huda Engineering provided exceptional service. Our dream home became reality thanks to their expertise and dedication.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-primary">{testimonial.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90">
            Join the 50+ satisfied clients who have trusted us with their construction needs. Let's build your vision together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg">
                Get Free Consultation
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg">
                View Our Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
