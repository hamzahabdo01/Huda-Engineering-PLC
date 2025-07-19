
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("projectsPage.hero.title")}</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            {t("projectsPage.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("projectsPage.featured.title")}</h2>
            <p className="text-xl text-muted-foreground">{t("projectsPage.featured.description")}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Huda Apartment Building */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary to-primary/80 h-64 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-primary-foreground" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl">{t("projects.hudaApartment.title")}</CardTitle>
                  <Badge className="bg-accent text-accent-foreground">{t("projectsPage.details.flagshipBadge")}</Badge>
                </div>
                <CardDescription className="text-lg">{t("projects.hudaApartment.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{t("projectsPage.details.completed")}: 2023</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{t("projectsPage.details.projectValue")}: 251M ETB</span>
                  </div>
                  <p className="text-muted-foreground">
                    {t("projects.hudaApartment.description")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SYS Luxury Apartments */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-accent to-accent/80 h-64 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-accent-foreground" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-2xl">{t("projects.sysLuxury.title")}</CardTitle>
                  <Badge variant="secondary">{t("projectsPage.details.completedBadge")}</Badge>
                </div>
                <CardDescription className="text-lg">{t("projects.sysLuxury.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{t("projectsPage.details.completed")}: 2022</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>156 {t("projectsPage.details.units")}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {t("projects.sysLuxury.description")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Projects Grid */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("projectsPage.all.title")}</h2>
            <p className="text-xl text-muted-foreground">{t("projectsPage.all.description")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tokoma Office Building */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{t("projects.tokomaOffice.title")}</CardTitle>
                <CardDescription>{t("projects.tokomaOffice.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2021</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {t("projects.tokomaOffice.description")}
                </p>
              </CardContent>
            </Card>

            {/* Additional Project Cards */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Megenagna Commercial Complex</CardTitle>
                <CardDescription>B+G+7 {t("projectsPage.details.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2020</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Mixed-use commercial and residential development in prime location.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Bole Residential Tower</CardTitle>
                <CardDescription>B+G+12 {t("projectsPage.details.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2024</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{t("projectsPage.details.activeBadge")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Luxury residential tower with modern amenities and city views.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Lafto Shopping Mall</CardTitle>
                <CardDescription>B+G+4 {t("projectsPage.details.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2019</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Modern shopping center with retail spaces and entertainment facilities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Gerji Office Complex</CardTitle>
                <CardDescription>B+G+8 {t("projectsPage.details.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2018</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Professional office building with modern facilities and parking.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-red-500 to-red-600 h-48 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Atlas Villa Project</CardTitle>
                <CardDescription>G+2 {t("projectsPage.details.floors")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>Addis Ababa</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>2017</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Luxury villa development with premium finishes and landscaping.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
