
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Briefcase, Layers, Wrench, PenTool, Zap } from "lucide-react";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("servicesPage.hero.title")}
          </h1>
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
                <CardTitle className="text-xl">{t("servicesPage.residential.title")}</CardTitle>
                <Badge className="w-fit bg-accent text-accent-foreground">{t("servicesPage.residential.badge")}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.residential.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.residential.features", { returnObjects: true }).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Briefcase className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("servicesPage.commercial.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.commercial.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.commercial.features", { returnObjects: true }).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Layers className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("servicesPage.mixedUse.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.mixedUse.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.mixedUse.features", { returnObjects: true }).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Wrench className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("servicesPage.management.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.management.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.management.features", { returnObjects: true }).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <PenTool className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("servicesPage.design.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.design.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.design.features", { returnObjects: true }).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{t("servicesPage.utility.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t("servicesPage.utility.description")}
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {t("servicesPage.utility.features", { returnObjects: true }).map((feature, index) => (
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("servicesPage.why.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("servicesPage.why.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">{t("servicesPage.why.advantages")}</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Wrench className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.why.ownEquipment")}</h4>
                    <p className="text-muted-foreground">{t("servicesPage.why.ownEquipmentDesc")}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Home className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.why.professional")}</h4>
                    <p className="text-muted-foreground">{t("servicesPage.why.professionalDesc")}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Badge className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.why.zero")}</h4>
                    <p className="text-muted-foreground">{t("servicesPage.why.zeroDesc")}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Layers className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.why.localKnowledge")}</h4>
                    <p className="text-muted-foreground">{t("servicesPage.why.localKnowledgeDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-4">50+</div>
                <p className="text-lg text-muted-foreground">{t("contact.cta.completed")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">{t("servicesPage.process.title")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.process.consultation")}</h3>
              <p className="text-muted-foreground">{t("servicesPage.process.consultationDesc")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.process.designEng")}</h3>
              <p className="text-muted-foreground">{t("servicesPage.process.designEngDesc")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.process.construction")}</h3>
              <p className="text-muted-foreground">{t("servicesPage.process.constructionDesc")}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("servicesPage.process.delivery")}</h3>
              <p className="text-muted-foreground">{t("servicesPage.process.deliveryDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
