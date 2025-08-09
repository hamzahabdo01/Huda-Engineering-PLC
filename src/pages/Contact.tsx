import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SITE_KEY = "6LcpLJIrAAAAAHCswRH3bneQHmnsrtktGrL8Fg1F";

export default function Contact() {
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
    if (!captchaToken) return toast({ title: "Captcha required", variant: "destructive" });
    if (!validateName(contact.name)) return toast({ title: "Invalid name", description: "Only letters allowed", variant: "destructive" });
    if (!validateEmail(contact.email)) return toast({ title: "Invalid email", description: "Enter a valid email address", variant: "destructive" });
    if (!validatePhone(contact.phone)) return toast({ title: "Invalid phone", description: "Must be 10 digits", variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert([contact]);
    setLoading(false);
    if (error) return toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    toast({ title: "Submitted", description: "We will contact you soon." });
    setContact({ name: "", email: "", phone: "", message: "" });
    setCaptchaToken(null);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) return toast({ title: "Captcha required", variant: "destructive" });
    if (!feedback.rating) return toast({ title: "Rating required", variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("feedback_submissions").insert([feedback]);
    setLoading(false);
    if (error) return toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    toast({ title: "Feedback submitted" });
    setFeedback({ rating: "", comment: "" });
    setCaptchaToken(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Form */}
        <Card>
          <CardHeader><CardTitle>Contact Us</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div><Label>Name *</Label><Input name="name" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} required /></div>
              <div><Label>Email *</Label><Input type="email" name="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} required /></div>
              <div><Label>Phone *</Label><Input type="tel" name="phone" value={contact.phone} onChange={e=>setContact({...contact,phone:e.target.value})} required /></div>
              <div><Label>Message *</Label><Textarea name="message" value={contact.message} onChange={e=>setContact({...contact,message:e.target.value})} required /></div>
              <ReCAPTCHA sitekey={SITE_KEY} onChange={token => setCaptchaToken(token)} />
              <Button type="submit" disabled={loading}>Submit</Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <Label>Rating *</Label>
                <Select onValueChange={v=>setFeedback({...feedback,rating:v})}>
                  <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(r=>(<SelectItem key={r} value={String(r)}>{r} Star{r>1?"s":""}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Comment</Label><Textarea value={feedback.comment} onChange={e=>setFeedback({...feedback,comment:e.target.value})} /></div>
              <ReCAPTCHA sitekey={SITE_KEY} onChange={token => setCaptchaToken(token)} />
              <Button type="submit" disabled={loading}>Submit Feedback</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
