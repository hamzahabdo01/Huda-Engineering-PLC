import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, Phone, Mail, MapPin, Award, Shield, Clock, Zap, Target, CheckCircle, ArrowRight, Star, TrendingUp, Globe, Wrench, Play, ArrowUpRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-real-estate.jpg";
const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden md:pt-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Modern real estate" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#00555b]/85 via-[#004147]/80 to-[#002b2f]/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-16">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 animate-fade-in">
                <span className="text-sm font-medium tracking-wide">{t("hero.badge")}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight animate-fade-in">
                <span className="">{t("hero.title")}</span>
                <span className="block text-white/90 mt-2">{t("hero.subtitle")}</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-lg animate-fade-in">
              {t("hero.description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button 
                size="lg" 
                className="bg-white text-[#00555b] hover:bg-white/90 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                asChild
              >
                <Link to="/booking">
                  {t("Book Now")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                asChild
              >
                <Link to="/virtual-tour" className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {t("nav.virtualTour")}
                </Link>
              </Button>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 animate-fade-in">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-xs sm:text-sm text-white/70">{t("hero.projectsCompleted")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-xs sm:text-sm text-white/70">{t("hero.clientSatisfaction")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-xs sm:text-sm text-white/70">{t("hero.yearsExperience")}</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Property Showcase */}
          <div className="relative space-y-6 mt-8 lg:mt-0">
            {/* Featured Property Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl animate-fade-in">
                              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{t("hero.featuredProperty")}</h3>
                  <span className="bg-green-400/20 text-green-300 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">
                    {t("hero.availableNow")}
                  </span>
                </div>
              
              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-white/80">
                    <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">4</div>
                      <div className="text-xs sm:text-sm">{t("hero.bedrooms")}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">3</div>
                      <div className="text-xs sm:text-sm">{t("hero.bathrooms")}</div>
                    </div>
                  </div>
                
                                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className="text-xs sm:text-sm text-white/70">{t("hero.startingFrom")}</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">8.5M ETB</div>
                    </div>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm" asChild>
                      <Link to="/projects">
                        {t("hero.viewDetails")}
                        <ArrowUpRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                  </div>
              </div>
            </div>
            
            {/* Property Info Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 animate-fade-in">
                <h3 className="text-xs sm:text-sm font-medium text-white/70 mb-1">{t("hero.location")}</h3>
                <p className="text-sm sm:text-base text-white font-semibold">{t("hero.locationValue")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 animate-fade-in">
                <h3 className="text-xs sm:text-sm font-medium text-white/70 mb-1">{t("hero.pricing")}</h3>
                <p className="text-sm sm:text-base text-white font-semibold">{t("hero.pricingValue")}</p>
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
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("whyChoose.description")}</p>
      <p className="text-sm text-muted-foreground mt-2">These highlight cards are informational and not clickable.</p>
    </div>
    <div className="relative">
      {/* Gradient edge fades (mobile only) */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
      {/* Scroll buttons (mobile only) */}
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
        onClick={() => document.getElementById('why-choose-scroll')?.scrollBy({ left: -320, behavior: 'smooth' })}
        aria-label="Scroll left"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
        onClick={() => document.getElementById('why-choose-scroll')?.scrollBy({ left: 320, behavior: 'smooth' })}
        aria-label="Scroll right"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
      <div
        id="why-choose-scroll"
        className="
          flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide pb-2 -mx-4 px-4
          snap-x snap-mandatory md:snap-none
          scroll-smooth
        "
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          overscrollBehaviorX: 'contain',
        }}
      >
        {[
          { icon: Shield, title: t("whyChoose.quality.title"), desc: t("whyChoose.quality.description") },
          { icon: Users, title: t("whyChoose.expert.title"), desc: t("whyChoose.expert.description") },
          { icon: Clock, title: t("whyChoose.timely.title"), desc: t("whyChoose.timely.description") },
          { icon: Target, title: t("whyChoose.local.title"), desc: t("whyChoose.local.description") },
          { icon: Zap, title: t("whyChoose.modern.title"), desc: t("whyChoose.modern.description") },
          { icon: CheckCircle, title: t("whyChoose.fullService.title"), desc: t("whyChoose.fullService.description") }
        ].map((item, index) => (
          <Card
            key={index}
            className="
              group relative text-center cursor-default rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
              min-w-[80vw] max-w-[80vw] mx-auto md:min-w-0 md:max-w-none flex-shrink-0
              snap-center md:snap-none
            "
            role="presentation"
            aria-disabled="true"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-60 pointer-events-none"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

            <CardHeader className="relative z-10">
              <item.icon className="w-16 h-16 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />
              <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardDescription className="text-base">{item.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Scroll indicator for mobile */}
      <div className="flex md:hidden justify-center mt-4 gap-2">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40"
            id={`why-choose-dot-${i}`}
          />
        ))}
      </div>
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
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">{t("services.residential.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.residential.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(t("services.residential.features", { returnObjects: true }) as string[]).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">{t("services.commercial.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.commercial.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(t("services.commercial.features", { returnObjects: true }) as string[]).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
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
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("projects.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("projects.description")}
            </p>
          </div>

          <div className="relative mb-16">
            {/* Gradient edge fades and buttons for mobile */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() => document.getElementById('projects-scroll')?.scrollBy({ left: -320, behavior: 'smooth' })}
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() => document.getElementById('projects-scroll')?.scrollBy({ left: 320, behavior: 'smooth' })}
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="projects-scroll"
              className="flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide -mx-4 px-4
                         snap-x snap-mandatory md:snap-none scroll-smooth pb-2"
              style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[80vw] max-w-[80vw] md:min-w-0 md:max-w-none snap-center md:snap-none">
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
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[80vw] max-w-[80vw] md:min-w-0 md:max-w-none snap-center md:snap-none">
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
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[80vw] max-w-[80vw] md:min-w-0 md:max-w-none snap-center md:snap-none">
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
      

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">{t("testimonials.title")}</h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("testimonials.description")}</p>
    </div>

    <div className="relative">
      {/* Gradient edges and buttons on mobile */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
        onClick={() => document.getElementById('testimonials-scroll')?.scrollBy({ left: -320, behavior: 'smooth' })}
        aria-label="Scroll left"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
        onClick={() => document.getElementById('testimonials-scroll')?.scrollBy({ left: 320, behavior: 'smooth' })}
        aria-label="Scroll right"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
      <div
        id="testimonials-scroll"
        className="flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory md:snap-none scroll-smooth pb-2"
        style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehaviorX: 'contain' }}
      >
      {[
        {
          name: "Ahmed Hassan",
          project: "Residential Complex Owner",
          content: "Huda Engineering delivered our apartment complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
          rating: 5,
          video: "/videos/testimonial1.mp4" // Example YouTube link
        },
        {
          name: "Meron Tadesse",
          project: "Commercial Building Client",
          content: "The quality of construction and the professionalism of the team was outstanding. They handled every aspect of our office building project perfectly.",
          rating: 5,
          video: "/videos/testimonial1.mp4" // Example no video
        },
        {
          name: "Solomon Bekele",
          project: "Luxury Home Owner",
          content: "From design to completion, Huda Engineering provided exceptional service. Our dream home became reality thanks to their expertise and dedication.",
          rating: 5,
          video: "/videos/testimonial1.mp4" // Example local video file path
        }
      ].map((testimonial, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow min-w-[80vw] max-w-[80vw] md:min-w-0 md:max-w-none snap-center md:snap-none">
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
            <p className="text-muted-foreground italic mb-4">"{testimonial.content}"</p>
            {testimonial.video && (
              (testimonial.video.includes("youtube.com") || testimonial.video.includes("youtu.be")) ? (
                <div className="w-full h-56">
                  <iframe
                    src={testimonial.video}
                    title={`${testimonial.name} video testimonial`}
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <video controls className="w-full rounded-lg">
                  <source src={testimonial.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            )}
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  </div>
</section>


      {/* Call to Action */}
     

      <Footer />
    </div>
  );
};

export default Index;
