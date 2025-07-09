
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Award, Target, Zap, CheckCircle, Calendar, MapPin, Phone, Mail, TrendingUp, Globe, Shield, Clock, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" className="text-accent w-16 h-16 lg:w-20 lg:h-20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Huda Engineering</h1>
          <p className="text-xl lg:text-2xl text-primary-foreground/90 max-w-4xl mx-auto">
            Building Ethiopia's future with quality, integrity, and innovation since 2009 E.C
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge className="mb-6 bg-accent text-accent-foreground text-base">
                <Calendar className="w-4 h-4 mr-2" />
                Founded 2009 E.C (2017 G.C)
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Huda Engineering PLC was established with a bold vision to transform Ethiopia's construction landscape. 
                Based in the heart of Addis Ababa, we have grown from a small construction company to a leading force in 
                residential, commercial, and mixed-use development across the nation.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Our journey began with a simple principle: never compromise on quality. This commitment has guided every 
                project we've undertaken, from luxury residential homes to towering commercial complexes. Today, we stand 
                proud with over 50 completed projects and a spotless record of zero litigation.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                What sets us apart is not just our technical expertise, but our deep understanding of Ethiopia's unique 
                construction challenges, local regulations, and the dreams of our clients. We don't just build structures; 
                we build relationships, communities, and futures.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 lg:h-[500px] rounded-lg flex items-center justify-center">
              <Logo size="lg" className="text-primary w-32 h-32 lg:w-40 lg:h-40" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">7+</div>
                <CardTitle className="text-lg">Years of Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Continuous growth and improvement in the Ethiopian construction industry
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <CardTitle className="text-lg">Completed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Successfully delivered projects ranging from residential to commercial developments
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <CardTitle className="text-lg">Legal Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Perfect track record demonstrating our commitment to quality and client satisfaction
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <CardTitle className="text-lg">Client Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every project completed to the highest standards with full client approval
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The fundamental principles that guide every decision we make and every project we undertake
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We never compromise on quality. Every material we use, every process we follow, and every detail 
                  we execute meets the highest standards of construction excellence. Quality is not just a goal—it's our guarantee.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our zero litigation history speaks volumes about our honest business practices and commitment to 
                  transparent communication with all stakeholders. We build trust through consistent, ethical actions.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We embrace modern construction techniques and cutting-edge technologies to deliver buildings that 
                  meet contemporary needs while setting new standards for the industry.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Teamwork</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our professional engineers, architects, and skilled foremen work together seamlessly to ensure 
                  every project not only meets but exceeds client expectations through collaborative excellence.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Award className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We strive for excellence in every aspect of our work, from initial design consultations to final 
                  project delivery and beyond. Excellence is not an act, but a habit we've cultivated.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We build for the future, incorporating sustainable practices and environmentally conscious materials 
                  that benefit both our clients and the Ethiopian environment for generations to come.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Professional Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the experts who bring your construction dreams to life with skill, dedication, and unwavering commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                title: "Licensed Engineers",
                description: "Structural and civil engineers with extensive experience in Ethiopian construction standards and international best practices.",
                icon: Target,
                count: "Professional"
              },
              {
                title: "Certified Architects", 
                description: "Creative designers who blend functionality with aesthetic appeal to create buildings that inspire and endure.",
                icon: Building2,
                count: "Expert"
              },
              {
                title: "Skilled Foremen",
                description: "Experienced supervisors who ensure quality control and safety compliance throughout every phase of construction.",
                icon: Shield,
                count: "Experienced"
              },
              {
                title: "Safety Specialists",
                description: "Dedicated professionals who maintain the highest safety standards and ensure zero-accident work environments.",
                icon: CheckCircle,
                count: "Certified"
              }
            ].map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <member.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                  <Badge className="mb-2 bg-accent text-accent-foreground">{member.count}</Badge>
                  <CardTitle className="text-lg">{member.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Equipment */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Equipment & Resources</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We own and maintain a comprehensive fleet of modern construction equipment and tools, ensuring project independence and quality control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Heavy Machinery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Our fleet includes excavators, bulldozers, cranes, and other heavy equipment necessary for large-scale construction projects.
                </CardDescription>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Tower cranes for high-rise construction</li>
                  <li>• Excavators for foundation work</li>
                  <li>• Concrete mixers and pumps</li>
                  <li>• Bulldozers for site preparation</li>
                  <li>• Material handling equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Precision Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Professional-grade tools and equipment for precision work, quality finishing, and detailed construction tasks.
                </CardDescription>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Surveying and measurement tools</li>
                  <li>• Power tools and equipment</li>
                  <li>• Safety equipment and gear</li>
                  <li>• Quality testing instruments</li>
                  <li>• Finishing and detailing tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Extended */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Why Clients Trust Us</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Beyond our technical expertise, discover what makes Huda Engineering the preferred choice for construction projects across Ethiopia
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Our Competitive Advantages</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: Globe,
                    title: "Local Market Expertise",
                    description: "Deep understanding of Ethiopian construction regulations, local suppliers, and market conditions."
                  },
                  {
                    icon: Clock,
                    title: "Proven Track Record",
                    description: "7+ years of consistent delivery with zero legal disputes and 100% client satisfaction rate."
                  },
                  {
                    icon: Shield,
                    title: "Risk Management",
                    description: "Comprehensive insurance coverage and risk mitigation strategies for all projects."
                  },
                  {
                    icon: TrendingUp,
                    title: "Value Engineering",
                    description: "Cost-effective solutions that maximize value without compromising quality or safety."
                  }
                ].map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <advantage.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{advantage.title}</h4>
                      <p className="text-muted-foreground">{advantage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Star className="w-16 h-16 text-accent mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Experience the Huda Engineering difference. Let's discuss how we can bring your construction vision to life with our proven expertise and unwavering commitment to excellence.
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
                View Our Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
