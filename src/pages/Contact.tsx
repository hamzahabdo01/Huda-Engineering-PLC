
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("contact.hero.title")}</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            {t("contact.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <span>{t("contact.form.title")}</span>
                </CardTitle>
                <CardDescription>
                  {t("contact.form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("contact.form.firstName")}</Label>
                      <Input id="firstName" placeholder={t("contact.form.yourFirstName")} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("contact.form.lastName")}</Label>
                      <Input id="lastName" placeholder={t("contact.form.yourLastName")} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contact.form.email")}</Label>
                    <Input id="email" type="email" placeholder={t("contact.form.yourEmail")} />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                    <Input id="phone" placeholder={t("contact.form.yourPhone")} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectType">{t("contact.form.projectType")}</Label>
                      <select className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm">
                        <option value="">{t("contact.form.selectProject")}</option>
                        <option value="residential">{t("servicesPage.residential.title")}</option>
                        <option value="commercial">{t("servicesPage.commercial.title")}</option>
                        <option value="mixed-use">{t("servicesPage.mixedUse.title")}</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="budget">{t("contact.form.budget")}</Label>
                      <select className="w-full border border-input bg-background px-3 py-2 rounded-md text-sm">
                        <option value="">{t("contact.form.selectBudget")}</option>
                        <option value="under-5m">Under 5M ETB</option>
                        <option value="5m-15m">5M - 15M ETB</option>
                        <option value="15m-50m">15M - 50M ETB</option>
                        <option value="over-50m">Over 50M ETB</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">{t("contact.form.message")}</Label>
                    <Textarea
                      id="message"
                      placeholder={t("contact.form.messagePlaceholder")}
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {t("contact.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{t("contact.info.phone")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("contact.info.phoneDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">+251 91 123 4567</p>
                  <p className="text-lg font-medium">+251 11 234 5678</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{t("contact.info.email")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("contact.info.emailDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">info@hudaengineering.com</p>
                  <p className="text-lg font-medium">projects@hudaengineering.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{t("contact.info.location")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("contact.info.locationDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">Addis Ababa, Ethiopia</p>
                  <p className="text-muted-foreground">Bole Sub City, Wereda 03</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{t("contact.info.hours")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-base">{t("contact.info.mondayFriday")}</p>
                  <p className="text-base">{t("contact.info.saturday")}</p>
                  <p className="text-base">{t("contact.info.sunday")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">{t("contact.cta.title")}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t("contact.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 text-lg">
              {t("contact.cta.quote")}
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              {t("contact.cta.consultation")}
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-accent-foreground">50+</span>
            </div>
            <span>{t("contact.cta.completed")}</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
