import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Shield,
  Clock,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Globe,
  Wrench,
  Play,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroVideo from "@/assets/video_2025-09-10_11-26-19.mp4";
import heroImage from "@/assets/Screenshot 2025-09-23 152611.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCardItem {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  project: string;
  content: string;
  rating: number;
  video_url?: string | null;
}

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [previousProjects, setPreviousProjects] = useState<ProjectCardItem[]>(
    []
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[] | null>(
    null
  );

  useEffect(() => {
    const fetchPrevious = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,title,short_description,image_url,status,created_at")
        .in("status", ["previous"])
        .order("created_at", { ascending: false })
        .limit(6);
      const normalized = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        short_description: p.short_description,
        image_url: p.image_url,
      }));
      setPreviousProjects(normalized);
    };
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id,name,project,content,rating,video_url,created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (!error && data) {
        setTestimonials(data as unknown as TestimonialItem[]);
      } else {
        setTestimonials(null);
      }
    };
    fetchPrevious();
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
<section className="relative min-h-screen flex flex-col items-center justify-center text-center">
  {/* Background Video */}
  <div className="absolute inset-0">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      // poster={heroImage}
    >
      <source src={heroVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div className="absolute inset-0 bg-black/40" />
  </div>
  
  {/* Hero Content Container */}
  <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
    {/* Hero Text + Logo */}
    <div className="text-white space-y-4 sm:space-y-6 md:space-y-8 flex flex-col items-center max-w-4xl mx-auto">
      {/* Logo above text - responsive sizing */}
      <Logo 
        variant="wy" 
        className="w-48 h-auto sm:w-56 md:w-64 lg:w-72 xl:w-80 transition-all duration-300" 
      /> 

      <p className="text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide font-medium">
        Trustworthy Real Estate
      </p>
      
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
        HUDA ENGINEERING
      </h1>
    </div>

    {/* CTA Buttons */}
    <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
      <Button
        className="bg-white text-[#00555b] hover:bg-white/90 font-semibold shadow-lg px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base"
        asChild
      >
        <Link to="/booking">
          {t("Book Now")}
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </Button>

      <Button
        variant="outline"
        className="bg-white/20 hover:bg-white text-white border-white/30 font-semibold shadow-lg px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base"
        asChild
      >
        <Link to="/virtual-tour" className="flex items-center gap-2">
          <Play className="h-4 w-4 sm:h-5 sm:w-5" />
          {t("nav.virtualTour")}
        </Link>
      </Button>
    </div>
  </div>
</section>


      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("whyChoose.title")}
            </h2>
          </div>
          <div className="relative">
            {/* Gradient edge fades (mobile only) */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
            {/* Scroll buttons (mobile only) */}
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("why-choose-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("why-choose-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="why-choose-scroll"
              className="
          flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide pb-2 -mx-4 px-4
          snap-x snap-mandatory md:snap-none
        "
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehaviorX: "contain",
              }}
            >
              {[
                {
                  icon: Shield,
                  title: t("whyChoose.quality.title"),
                  desc: t("whyChoose.quality.description"),
                },
                {
                  icon: Users,
                  title: t("whyChoose.expert.title"),
                  desc: t("whyChoose.expert.description"),
                },
                {
                  icon: Clock,
                  title: t("whyChoose.timely.title"),
                  desc: t("whyChoose.timely.description"),
                },
                {
                  icon: Target,
                  title: t("whyChoose.local.title"),
                  desc: t("whyChoose.local.description"),
                },
                {
                  icon: Zap,
                  title: t("whyChoose.modern.title"),
                  desc: t("whyChoose.modern.description"),
                },
                {
                  icon: CheckCircle,
                  title: t("whyChoose.fullService.title"),
                  desc: t("whyChoose.fullService.description"),
                },
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
                    <CardTitle className="text-xl font-semibold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base">
                      {item.desc}
                    </CardDescription>
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
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("services.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("services.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <CardHeader>
                <Building2 className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">
                  {t("services.residential.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.residential.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(
                    t("services.residential.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4 transition-transform group-hover:scale-110" />
                <CardTitle className="text-2xl">
                  {t("services.commercial.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {t("services.commercial.description")}
                </CardDescription>
                <ul className="text-sm space-y-2">
                  {(
                    t("services.commercial.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/services">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
              >
                {t("services.viewAll")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Previous Projects (from backend) */}
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Previous Projects
            </h2>
          </div>

          <div className="relative mb-16">
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("projects-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("projects-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="projects-scroll"
              className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide px-4 snap-x snap-mandatory md:snap-none scroll-smooth pb-2 items-stretch"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehaviorX: "contain",
              }}
            >
              {previousProjects.map((proj) => (
                <Card
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  role="link"
                  tabIndex={0}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-w-[85vw] max-w-[85vw] mx-auto md:min-w-0 md:max-w-none snap-center md:snap-none cursor-pointer"
                >
                  <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                    {proj.image_url ? (
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-primary" />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{proj.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{proj.short_description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link to="/projects?tab=delivered">
              <Button size="lg" variant="outline" className="px-8 py-4">
                See more
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process */}

      {/* Testimonials (video from backend) */}
      <section className="py-20 lg:py-32 bg-background overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("testimonials.description")}
            </p>
          </div>

          <div className="relative">
            {/* Gradient edges and buttons on mobile */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 md:hidden" />
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("testimonials-scroll")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-full p-1 shadow md:hidden"
              onClick={() =>
                document
                  .getElementById("testimonials-scroll")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div
              id="testimonials-scroll"
              className="flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 scrollbar-hide px-4 snap-x snap-mandatory md:snap-none scroll-smooth pb-2 items-stretch"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                overscrollBehavior: "contain",
              }}
            >
              {(
                testimonials ?? [
                  {
                    id: "fallback-1",
                    name: "Ahmed Hassan",
                    project: "Residential Complex Owner",
                    content:
                      "Huda Engineering delivered our apartment complex on time and within budget. Their attention to detail and professional approach exceeded our expectations.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                  {
                    id: "fallback-2",
                    name: "Meron Tadesse",
                    project: "Commercial Building Client",
                    content:
                      "The quality of construction and the professionalism of the team was outstanding. They handled every aspect of our office building project perfectly.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                  {
                    id: "fallback-3",
                    name: "Solomon Bekele",
                    project: "Luxury Home Owner",
                    content:
                      "From design to completion, Huda Engineering provided exceptional service. Our dream home became reality thanks to their expertise and dedication.",
                    rating: 5,
                    video_url: "/videos/testimonial1.mp4",
                  },
                ]
              ).map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="hover:shadow-lg transition-shadow min-w-[85vw] max-w-[85vw] mx-auto md:min-w-0 md:max-w-none snap-center md:snap-none"
                >
                  <CardHeader>
                    <div className="flex mb-4">
                      {[
                        ...Array(
                          Math.max(0, Math.min(5, testimonial.rating || 0))
                        ),
                      ].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <CardTitle className="text-lg">
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className="text-primary">
                      {testimonial.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic mb-4">
                      "{testimonial.content}"
                    </p>
                    {testimonial.video_url &&
                      (testimonial.video_url.includes("youtube.com") ||
                      testimonial.video_url.includes("youtu.be") ? (
                        <div className="w-full h-56">
                          <iframe
                            src={testimonial.video_url}
                            title={`${testimonial.name} video testimonial`}
                            allowFullScreen
                            className="w-full h-full rounded-lg"
                          ></iframe>
                        </div>
                      ) : (
                        <video controls className="w-full rounded-lg">
                          <source
                            src={testimonial.video_url}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ))}
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
