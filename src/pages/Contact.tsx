
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone || null,
            project_type: formData.projectType || null,
            budget: formData.budget || null,
            message: formData.message,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        projectType: "",
        budget: "",
        message: ""
      });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("contact.form.firstName")} *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={t("contact.form.yourFirstName")} 
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("contact.form.lastName")} *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={t("contact.form.yourLastName")} 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contact.form.email")} *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.yourEmail")} 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.yourPhone")} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectType">{t("contact.form.projectType")}</Label>
                      <Select onValueChange={(value) => handleSelectChange("projectType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("contact.form.selectProject")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">{t("servicesPage.residential.title")}</SelectItem>
                          <SelectItem value="commercial">{t("servicesPage.commercial.title")}</SelectItem>
                          <SelectItem value="mixed-use">{t("servicesPage.mixedUse.title")}</SelectItem>
                          <SelectItem value="renovation">Renovation</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">{t("contact.form.budget")}</Label>
                      <Select onValueChange={(value) => handleSelectChange("budget", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("contact.form.selectBudget")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-5m">Under 5M ETB</SelectItem>
                          <SelectItem value="5m-15m">5M - 15M ETB</SelectItem>
                          <SelectItem value="15m-50m">15M - 50M ETB</SelectItem>
                          <SelectItem value="50m-100m">50M - 100M ETB</SelectItem>
                          <SelectItem value="over-100m">Over 100M ETB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">{t("contact.form.message")} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.messagePlaceholder")}
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : t("contact.form.submit")}
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
