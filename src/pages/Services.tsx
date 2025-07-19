
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, Briefcase, Layers, Wrench, Cog } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("servicesPage.hero.title")}</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            {t("servicesPage.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Home className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Residential Construction</CardTitle>
                <Badge className="w-fit bg-accent text-accent-foreground">Popular</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Modern apartments, luxury homes, and residential complexes designed for Ethiopian families. 
                  From single-family homes to high-rise apartment buildings up to 2B+G+13 floors.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Luxury apartment complexes</li>
                  <li>• Single-family residences</li>
                  <li>• High-rise developments</li>
                  <li>• Affordable housing projects</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Briefcase className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Commercial Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Office complexes, retail spaces, and commercial buildings that meet modern business needs 
                  with cutting-edge design and functionality.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Office complexes</li>
                  <li>• Retail centers</li>
                  <li>• Business parks</li>
                  <li>• Corporate headquarters</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Layers className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Mixed-Use Development</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Integrated developments combining residential, commercial, and office spaces 
                  to create vibrant urban communities.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Residential-commercial combos</li>
                  <li>• Urban development projects</li>
                  <li>• Community centers</li>
                  <li>• Multi-purpose complexes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Wrench className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Construction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  End-to-end project management services ensuring quality, safety, and timely delivery 
                  of all construction projects.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Project planning & scheduling</li>
                  <li>• Quality control</li>
                  <li>• Safety management</li>
                  <li>• Budget oversight</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Design & Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Comprehensive architectural design and engineering services from concept 
                  to detailed construction drawings.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Architectural design</li>
                  <li>• Structural engineering</li>
                  <li>• Urban planning</li>
                  <li>• 3D visualization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Cog className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">Utility Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Complete utility infrastructure including electrical, plumbing, HVAC, 
                  and telecommunications systems integration.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Electrical systems</li>
                  <li>• Plumbing & water systems</li>
                  <li>• HVAC installation</li>
                  <li>• Telecommunications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Huda Engineering?</h2>
            <p className="text-xl text-muted-foreground">What sets us apart in Ethiopian construction</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Our Advantages</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Own Equipment & Machinery:</strong>
                    <p className="text-muted-foreground">We own our construction equipment and heavy machinery, ensuring project control and cost efficiency.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Professional Team:</strong>
                    <p className="text-muted-foreground">Experienced engineers, architects, and skilled foremen with deep local expertise.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Zero Litigation:</strong>
                    <p className="text-muted-foreground">Our clean legal record demonstrates our commitment to quality and client satisfaction.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <strong className="text-foreground">Local Knowledge:</strong>
                    <p className="text-muted-foreground">Deep understanding of Ethiopian construction standards, terrain, and logistics.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-foreground mb-6">Our Process</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Consultation & Planning</h4>
                    <p className="text-muted-foreground text-sm">Understanding your vision and requirements</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Design & Engineering</h4>
                    <p className="text-muted-foreground text-sm">Creating detailed plans and specifications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Construction</h4>
                    <p className="text-muted-foreground text-sm">Professional execution with quality control</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Delivery & Support</h4>
                    <p className="text-muted-foreground text-sm">Timely completion with ongoing support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
