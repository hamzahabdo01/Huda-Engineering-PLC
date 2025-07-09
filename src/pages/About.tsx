
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Award, Target, Zap, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Huda Engineering</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Building Ethiopia's future with quality, integrity, and innovation since 2009 E.C
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-accent text-accent-foreground">
                Founded 2009 E.C (2017 G.C)
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Huda Engineering PLC was established with a vision to transform Ethiopia's construction landscape. 
                Based in Addis Ababa, we have grown from a small construction company to a leading force in 
                residential, commercial, and mixed-use development.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our commitment to quality, safety, and timely delivery has earned us the trust of clients 
                across Ethiopia, with zero litigation history reflecting our dedication to excellence.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 rounded-lg flex items-center justify-center">
              <Building2 className="w-32 h-32 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">The principles that guide every project we undertake</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We never compromise on quality. Every material, every process, and every detail 
                  meets the highest standards of construction excellence.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CheckCircle className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our zero litigation history speaks to our honest business practices and 
                  commitment to transparent communication with all stakeholders.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We embrace modern construction techniques and technologies to deliver 
                  cutting-edge buildings that meet contemporary needs.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Teamwork</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our professional engineers, architects, and skilled foremen work together 
                  to ensure every project exceeds expectations.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Award className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We strive for excellence in every aspect of our work, from initial design 
                  to final delivery and beyond.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Building2 className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We build for the future, incorporating sustainable practices and materials 
                  that benefit both our clients and the environment.
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

export default About;
