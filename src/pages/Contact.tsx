import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SITE_RECAPTCHA_KEY } from "@/utils/env";

const SITE_KEY = SITE_RECAPTCHA_KEY;

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [feedback, setFeedback] = useState({ rating: "", comment: "" });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) return toast({ title: t("errors.captchaRequired"), variant: "destructive" });
    if (!validateName(contact.name)) return toast({ title: t("contact.validation.invalidName.title"), description: t("contact.validation.invalidName.desc"), variant: "destructive" });
    if (!validateEmail(contact.email)) return toast({ title: t("contact.validation.invalidEmail.title"), description: t("contact.validation.invalidEmail.desc"), variant: "destructive" });
    if (!validatePhone(contact.phone)) return toast({ title: t("contact.validation.invalidPhone.title"), description: t("contact.validation.invalidPhone.desc"), variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert([contact]);
    setLoading(false);
    if (error) return toast({ title: t("errors.error"), description: t("contact.submitFailed"), variant: "destructive" });
    toast({ title: t("contact.submitted"), description: t("contact.weWillContact") });
    setContact({ name: "", email: "", phone: "", message: "" });
    setCaptchaToken(null);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) return toast({ title: t("errors.captchaRequired"), variant: "destructive" });
    if (!feedback.rating) return toast({ title: t("contact.validation.ratingRequired"), variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("feedback_submissions").insert([feedback]);
    setLoading(false);
    if (error) return toast({ title: t("errors.error"), description: t("contact.feedbackFailed"), variant: "destructive" });
    toast({ title: t("contact.feedbackSubmitted") });
    setFeedback({ rating: "", comment: "" });
    setCaptchaToken(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold">{t("contact.hero.title")}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">{t("contact.hero.subtitle")}</p>
        </div>

        {/* Contact Form */}
        <Card className="shadow-lg border animate-slide-up">
          <CardHeader><CardTitle>{t("contact.form.title")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("contact.form.firstName")}</Label>
                <Input name="name" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>{t("contact.form.email")}</Label>
                <Input type="email" name="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>{t("contact.form.phone")}</Label>
                <Input type="tel" name="phone" value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>{t("contact.form.message")}</Label>
                <Textarea name="message" value={contact.message} onChange={e=>setContact({...contact,message:e.target.value})} required rows={6} />
              </div>
              <div className="pt-2">
                <ReCAPTCHA sitekey={SITE_KEY} onChange={token => setCaptchaToken(token)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">{t("contact.form.submit")}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
