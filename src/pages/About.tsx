
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Award, Target, Zap, CheckCircle, Calendar, MapPin, Phone, Mail, TrendingUp, Globe, Shield, Clock, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" className="text-accent w-16 h-16 lg:w-20 lg:h-20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("about.hero.title")}</h1>
          <p className="text-xl lg:text-2xl text-primary-foreground/90 max-w-4xl mx-auto">
            {t("about.hero.subtitle")}
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
                {t("about.story.badge")}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("about.story.title")}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {t("about.story.p1")}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {t("about.story.p2")}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("about.story.p3")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 lg:h-[500px] rounded-lg flex items-center justify-center">
              <Building2 className="text-primary w-32 h-32 lg:w-40 lg:h-40" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">7+</div>
                <CardTitle className="text-lg">{t("about.stats.years")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("about.stats.yearsDesc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <CardTitle className="text-lg">{t("about.stats.projects")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("about.stats.projectsDesc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <CardTitle className="text-lg">{t("about.stats.disputes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("about.stats.disputesDesc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <CardTitle className="text-lg">{t("about.stats.satisfaction")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("about.stats.satisfactionDesc")}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("about.values.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.values.description")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.quality.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.quality.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.integrity.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.integrity.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.innovation.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.innovation.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.teamwork.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.teamwork.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Award className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.excellence.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.excellence.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("about.values.sustainability.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("about.values.sustainability.description")}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("about.team.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.team.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                title: t("about.team.engineers.title"),
                description: t("about.team.engineers.description"),
                icon: Target,
                count: t("about.team.engineers.count")
              },
              {
                title: t("about.team.architects.title"), 
                description: t("about.team.architects.description"),
                icon: Building2,
                count: t("about.team.architects.count")
              },
              {
                title: t("about.team.foremen.title"),
                description: t("about.team.foremen.description"),
                icon: Shield,
                count: t("about.team.foremen.count")
              },
              {
                title: t("about.team.safety.title"),
                description: t("about.team.safety.description"),
                icon: CheckCircle,
                count: t("about.team.safety.count")
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("about.equipment.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.equipment.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t("about.equipment.heavy.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("about.equipment.heavy.description")}
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
                <CardTitle className="text-2xl">{t("about.equipment.precision.title")}</CardTitle>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("about.advantages.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.advantages.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">{t("about.advantages.competitive")}</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: Globe,
                    title: t("about.advantages.local.title"),
                    description: t("about.advantages.local.description")
                  },
                  {
                    icon: Clock,
                    title: t("about.advantages.proven.title"),
                    description: t("about.advantages.proven.description")
                  },
                  {
                    icon: Shield,
                    title: t("about.advantages.risk.title"),
                    description: t("about.advantages.risk.description")
                  },
                  {
                    icon: TrendingUp,
                    title: t("about.advantages.value.title"),
                    description: t("about.advantages.value.description")
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
                <div className="text-muted-foreground">{t("about.advantages.satisfaction")}</div>
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
    <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg transition-transform hover:scale-105">
      {t("nav.contact")}
      <Phone className="ml-2 h-5 w-5" />
    </Button>
  </Link>
  <Link to="/projects">
    <Button size="lg" variant="outline" className="border-primary-foreground text-primary hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg transition-transform hover:scale-105">
      {t("nav.projects")}
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
