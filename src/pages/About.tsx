import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Award,
  Target,
  Zap,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroVideo from "@/assets/video_2025-09-10_12-35-58.mp4";
import tokomaImg from "@/assets/image.png";
import sysImg from "@/assets/Screenshot 2025-10-14 154905.png";
import hudaImg from "@/assets/Screenshot 2025-10-14 150208.png";
const About = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center overflow-visible">
      <Navbar />

      {/* Hero Section */}
<section className="relative w-full 
  h-[280px]    /* ارتفاع صغير للجوال */
  sm:h-[330px] /* للشاشات الصغيرة */
  md:h-[450px] /* للتابلت */
  lg:h-[400px] /* للديسكتوب */
  flex items-center justify-center text-center overflow-hidden">


  {/* Animated Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0A5E55] via-[#0F8A7A] to-[#0A5E55] animate-gradient-x"></div>

  {/* Light Glow Effect */}
  <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>

  {/* Floating Particles */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-slow left-10 top-10"></div>
    <div className="absolute w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float-reverse right-16 bottom-14"></div>
  </div>

  {/* Content */}
  <div className="relative z-10 px-4 flex flex-col items-center">

    {/* Logo — الآن يظهر فعليًا */}
    <Logo size="lg" className="text-accent w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 animate-scale-up" />

<h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.35] overflow-visible">
  {/* النص الأبيض الأساسي */}
  <span className="text-white animate-fade-slide-up">
    About Huda Engineering
  </span>

  {/* النص الأصفر فوقه */}
  <span className="text-yellow-400 pendulum-mask ml-2 animate-fade-slide-up">
    About Huda Engineering
  </span>
</h1>
<p className="
  text-lg md:text-2xl mt-4 max-w-3xl mx-auto 
  text-white/95
  bg-gradient-to-r from-white/95 via-accent/80 to-white/95 
  bg-clip-text text-transparent
  drop-shadow-[0_2px_8px_rgba(0,200,150,0.35)]
  animate-fade-slide-up
">
  Building Ethiopia's future with quality, integrity, and innovation since 2009 E.C
</p>

  </div>
</section>


{/* Add these animations to your Tailwind CSS */}
<style>
{`
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 8s ease infinite;
  }

  @keyframes float-slow {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-25px); }
  }
  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }

  @keyframes float-reverse {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(20px); }
  }
  .animate-float-reverse {
    animation: float-reverse 7s ease-in-out infinite;
  }

  @keyframes scale-up {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-scale-up {
    animation: scale-up 0.8s ease-out forwards;
  }
    @keyframes fade-slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-slide-up {
  animation: fade-slide-up 1s ease-out forwards;
}
  .pendulum-mask {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 50%,
    transparent 100%
  );
  mask-size: 200% 100%;
  animation: pendulum 3s ease-in-out infinite alternate;
}

@keyframes pendulum {
  0% {
    mask-position: left;
  }
  100% {
    mask-position: right;
  }
}


`}
</style>


      {/* Company Story */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:space-x-36 space-x-4 space-y-4 items-center mb-20">
            <div>
              <Badge className="mb-6 bg-accent text-accent-foreground text-base">
                <Calendar className="w-4 h-4 mr-2" />
                {t("about.story.badge")}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t("about.story.title")}
              </h2>
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
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 lg:h-[600px] w-auto rounded-lg flex items-center justify-center"
            >
              <source src={heroVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">9+</div>
                <CardTitle className="text-lg">
                  {t("about.stats.years")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.stats.yearsDesc")}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <CardTitle className="text-lg">
                  {t("about.stats.projects")}
                </CardTitle>
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
                <CardTitle className="text-lg">
                  {t("about.stats.disputes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("about.stats.disputesDesc")}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t("about.values.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.values.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("about.values.quality.title")}
                </CardTitle>
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
                <CardTitle className="text-xl">
                  {t("about.values.integrity.title")}
                </CardTitle>
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
                <CardTitle className="text-xl">
                  {t("about.values.innovation.title")}
                </CardTitle>
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
                <CardTitle className="text-xl">
                  {t("about.values.teamwork.title")}
                </CardTitle>
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
                <CardTitle className="text-xl">
                  {t("about.values.excellence.title")}
                </CardTitle>
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
                <CardTitle className="text-xl">
                  {t("about.values.sustainability.title")}
                </CardTitle>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t("about.team.title")}
            </h2>
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
              },
              {
                title: t("about.team.architects.title"),
                description: t("about.team.architects.description"),
                icon: Building2,
              },
              {
                title: t("about.team.foremen.title"),
                description: t("about.team.foremen.description"),
                icon: Shield,
              },
              {
                title: t("about.team.safety.title"),
                description: t("about.team.safety.description"),
                icon: CheckCircle,
              },
            ].map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <member.icon className="w-16 h-16 text-primary mx-auto mb-4" />
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

      {/* Why Choose Us Extended */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t("about.advantages.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.advantages.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {t("about.advantages.competitive")}
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: Globe,
                    title: t("about.advantages.local.title"),
                    description: t("about.advantages.local.description"),
                  },
                  {
                    icon: Clock,
                    title: t("about.advantages.proven.title"),
                    description: t("about.advantages.proven.description"),
                  },
                  {
                    icon: Shield,
                    title: t("about.advantages.risk.title"),
                    description: t("about.advantages.risk.description"),
                  },
                  {
                    icon: TrendingUp,
                    title: t("about.advantages.value.title"),
                    description: t("about.advantages.value.description"),
                  },
                ].map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <advantage.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {advantage.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {advantage.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Star className="w-16 h-16 text-accent mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
<section className="py-20 lg:py-32 bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
        Our Portfolio
      </h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        A curated selection of our delivered projects.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          title: "Huda Luxury Apartments",
          location: "Addis Ababa city, Bole sub-city around bole, bolebula",
          tag: "Delivered",
          image: hudaImg, // ✅ صورتك هنا
        },
        {
          title: "MIXED-USE and OFFICE BUILDING",
          location: "Addis Ababa City, Bole sub-city around wereda12",
          tag: "Delivered",
          image: tokomaImg, // ✅ صورتك هنا
        },
        {
          title: " REAL ESTATE",
          location: "Addis Ababa City, Kerkos sub- city around Uerael church ",
          tag: "Delivered",
          image: sysImg, // ✅ صورتك هنا
        },
      ].map((item, idx) => (
        <Card
          key={idx}
          className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* ✅ استبدال الأيقونة بصورة */}
          <div className="w-full aspect-[4/3] overflow-hidden rounded-lg">
  <img
    src={item.image}
    alt={item.title}
    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
  />
</div>


          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <Badge>{item.tag}</Badge>
            </div>
            <CardDescription>{item.location}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>

    <div className="text-center mt-12">
      <Link to="/projects">
        <Button size="lg" variant="outline">
          View All Projects
        </Button>
      </Link>
    </div>
  </div>
</section>


      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Experience the Huda Engineering difference. Let's discuss how we can
            bring your construction vision to life with our proven expertise and
            unwavering commitment to excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg transition-transform hover:scale-105"
              >
                {t("nav.contact")}
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg transition-transform hover:scale-105"
              >
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
