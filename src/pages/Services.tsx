import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home,
  Briefcase,
  Layers,
  Wrench,
  PenTool,
  Zap,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
<section className="relative w-full py-20 bg-gradient-to-r from-[#0A5E55] via-[#0F8A7A] to-[#0A5E55] overflow-hidden">

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
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

    {/* Title */}
    <h1 className="relative text-4xl md:text-5xl font-bold leading-tight overflow-visible">
      <span className="text-white animate-fade-slide-up">
        {t("servicesPage.hero.title")}
      </span>
      <span className="absolute inset-0 text-yellow-400 pendulum-mask animate-fade-slide-up">
        {t("servicesPage.hero.title")}
      </span>
    </h1>

    {/* Subtitle */}
    <p className="text-xl text-white/90 max-w-3xl mx-auto mt-4 animate-fade-slide-up">
      {t("servicesPage.hero.subtitle")}
    </p>
  </div>
</section>
<style>
{`@keyframes gradient-x {
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
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-slide-up {
  animation: fade-slide-up 1s ease-out forwards;
}

.pendulum-mask {
  mask-image: linear-gradient(to right, transparent 0%, black 50%, transparent 100%);
  mask-size: 200% 100%;
  animation: pendulum 3s ease-in-out infinite alternate;
}
@keyframes pendulum {
  0% { mask-position: left; }
  100% { mask-position: right; }
}
`}
</style>

      {/* Services Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Home className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.residential.title")}
                </CardTitle>
                <Badge className="w-fit bg-accent text-accent-foreground">
                  {t("servicesPage.residential.badge")}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.residential.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.residential.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Briefcase className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.commercial.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.commercial.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.commercial.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Layers className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.mixedUse.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.mixedUse.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.mixedUse.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Wrench className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.management.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.management.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.management.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <PenTool className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.design.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.design.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.design.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">
                  {t("servicesPage.utility.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.utility.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(
                    t("servicesPage.utility.features", {
                      returnObjects: true,
                    }) as string[]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t("servicesPage.why.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("servicesPage.why.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">
                {t("servicesPage.why.advantages")}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Wrench className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t("servicesPage.why.ownEquipment")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t("servicesPage.why.ownEquipmentDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Home className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t("servicesPage.why.professional")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t("servicesPage.why.professionalDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t("servicesPage.why.zero")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t("servicesPage.why.zeroDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Layers className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t("servicesPage.why.localKnowledge")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t("servicesPage.why.localKnowledgeDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-4">50+</div>
                <p className="text-lg text-muted-foreground">
                  {t("contact.cta.completed")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t("servicesPage.process.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  1
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("servicesPage.process.consultation")}
              </h3>
              <p className="text-muted-foreground">
                {t("servicesPage.process.consultationDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  2
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("servicesPage.process.designEng")}
              </h3>
              <p className="text-muted-foreground">
                {t("servicesPage.process.designEngDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  3
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("servicesPage.process.construction")}
              </h3>
              <p className="text-muted-foreground">
                {t("servicesPage.process.constructionDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">
                  4
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("servicesPage.process.delivery")}
              </h3>
              <p className="text-muted-foreground">
                {t("servicesPage.process.deliveryDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
