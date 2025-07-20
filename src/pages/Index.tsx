import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Phone, Mail, MapPin, Award, Shield, Clock, Zap, Target, CheckCircle, ArrowRight, Star, TrendingUp, Globe, Wrench, Play, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-real-estate.jpg";
const Index = () => {
  const {
    t
  } = useTranslation();
  return <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen lg:h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Modern real estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00555b]/85 via-[#004147]/80 to-[#002b2f]/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 lg:py-0">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 animate-fade-in">
                <span className="text-sm font-medium tracking-wide">{t("hero.badge")}</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight animate-fade-in">
                <span className="block">{t("hero.title")}</span>
                <span className="block text-white/90 mt-2">{t("hero.subtitle")}</span>
              </h1>
            </div>
            
            <p className="text-xl text-white/80 leading-relaxed max-w-lg animate-fade-in">
              {t("hero.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button size="lg" className="bg-white text-[#00555b] hover:bg-white/90 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200" asChild>
                <Link to="/booking">
                  {t("hero.exploreNow")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200" asChild>
                <Link to="/virtual-tour" className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {t("nav.virtualTour")}
                </Link>
              </Button>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-white/70">{t("hero.projectsCompleted")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/70">{t("hero.clientSatisfaction")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-white/70">{t("hero.yearsExperience")}</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Property Showcase */}
          <div className="relative space-y-6">
            {/* Featured Property Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{t("hero.featuredProperty")}</h3>
                <span className="bg-green-400/20 text-green-300 text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                  {t("hero.availableNow")}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-white/80">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">4</div>
                    <div className="text-sm">{t("hero.bedrooms")}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-sm">{t("hero.bathrooms")}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm text-white/70">{t("hero.startingFrom")}</div>
                    <div className="text-3xl font-bold text-white">8.5M ETB</div>
                  </div>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30" asChild>
                    <Link to="/projects">
                      {t("hero.viewDetails")}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Property Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
                <h3 className="text-sm font-medium text-white/70 mb-1">{t("hero.location")}</h3>
                <p className="text-white font-semibold">{t("hero.locationValue")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
                <h3 className="text-sm font-medium text-white/70 mb-1">{t("hero.pricing")}</h3>
                <p className="text-white font-semibold">{t("hero.pricingValue")}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("whyChoose.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("whyChoose.description")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.quality.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.quality.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.expert.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.expert.description")}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.timely.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.timely.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.local.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.local.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.modern.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.modern.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{t("whyChoose.fullService.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("whyChoose.fullService.description")}
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
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("services.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("services.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t("services.residential.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.residential.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(t("services.residential.features", {
                  returnObjects: true
                }) as string[]).map((feature, index) => <li key={index}>• {feature}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{t("services.commercial.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.commercial.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(t("services.commercial.features", {
                  returnObjects: true
                }) as string[]).map((feature, index) => <li key={index}>• {feature}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/services">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4">
                {t("services.viewAll")}
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
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("projects.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("projects.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>{t("projects.hudaApartment.title")}</CardTitle>
                <Badge className="w-fit">{t("projects.hudaApartment.floors")}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("projects.hudaApartment.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>{t("projects.sysLuxury.title")}</CardTitle>
                <Badge className="w-fit">{t("projects.sysLuxury.floors")}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("projects.sysLuxury.description")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Globe className="w-16 h-16 text-primary" />
              </div>
              <CardHeader>
                <CardTitle>{t("projects.tokomaOffice.title")}</CardTitle>
                <Badge className="w-fit">{t("projects.tokomaOffice.floors")}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("projects.tokomaOffice.description")}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/projects">
              <Button size="lg" variant="outline" className="px-8 py-4">
                {t("projects.viewAll")}
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
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("constructionProcess.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("constructionProcess.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
            step: "01",
            title: t("constructionProcess.steps.consultation.title"),
            description: t("constructionProcess.steps.consultation.description"),
            icon: Users
          }, {
            step: "02",
            title: t("constructionProcess.steps.design.title"),
            description: t("constructionProcess.steps.design.description"),
            icon: Target
          }, {
            step: "03",
            title: t("constructionProcess.steps.construction.title"),
            description: t("constructionProcess.steps.construction.description"),
            icon: Wrench
          }, {
            step: "04",
            title: t("constructionProcess.steps.completion.title"),
            description: t("constructionProcess.steps.completion.description"),
            icon: CheckCircle
          }].map((item, index) => <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
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
              </Card>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("testimonials.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("testimonials.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            name: "Ahmed Hassan",
            project: "Residential Complex Owner",
            content: "Huda Engineering delivered our apartment complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
            rating: 5
          }, {
            name: "Meron Tadesse",
            project: "Commercial Building Client",
            content: "The quality of construction and the professionalism of the team was outstanding. They handled every aspect of our office building project perfectly.",
            rating: 5
          }, {
            name: "Solomon Bekele",
            project: "Luxury Home Owner",
            content: "From design to completion, Huda Engineering provided exceptional service. Our dream home became reality thanks to their expertise and dedication.",
            rating: 5
          }].map((testimonial, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-primary">{testimonial.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">{t("cta.title")}</h2>
          <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 px-8 py-4 text-lg">
                {t("cta.consultation")}
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg">
                {t("cta.portfolio")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;