import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReCAPTCHA from "react-google-recaptcha";
import { SITE_RECAPTCHA_KEY } from "@/utils/env";

// Captcha site key is injected via env
const SITE_KEY = SITE_RECAPTCHA_KEY;

export default function Booking() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [units, setUnits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"appointment" | "property">("property");
  

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    secondary_phone: "",
    nationalId: "",
    property: "",
    unitType: "",
    preferredContact: "WhatsApp",
    moveInDate: "",
    appointmentDate: "",
    notes: "",
    consent: false,
    acceptTnC: false,
  });

  useEffect(() => {
    supabase.from("projects").select("*").in("status", ["active", "completed"]).then(({ data }) => {
      setProjects(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!formData.property) return;
    const project = projects.find((p) => p.id === formData.property);
    if (project) {
      setUnits(project.units || {});
      fetchStock(formData.property);
    } else {
      setUnits({});
      setStock({});
    }
  }, [formData.property, projects]);

  const fetchStock = async (propertyId: string) => {
  console.log("Fetching stock for propertyId:", propertyId);
  const { data, error } = await supabase
    .from("unit_stock")
    .select("unit_type, total_units, booked_units, property_id")
    .eq("property_id", propertyId);

  if (error) {
    console.error("Stock fetch error:", error);
    return;
  }

  console.log("Unit stock rows:", data);

  if (data) {
    const stockMap: Record<string, number> = {};
    data.forEach((s) => {
      const available = (s.total_units ?? 0) - (s.booked_units ?? 0);
      stockMap[s.unit_type] = available;
    });
    setStock(stockMap);
  }
  console.log("propertyId used:", propertyId);
console.log("unit stock fetched:", data);

};


  useEffect(() => {
  const channel = supabase
    .channel('unit_stock_changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'unit_stock' },
      (payload) => {
        if (payload.new.property_id === formData.property) {
          const available = (payload.new.total_units ?? 0) - (payload.new.booked_units ?? 0);
          setStock((prev) => ({
            ...prev,
            [payload.new.unit_type]: available,
          }));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [formData.property]);

  

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "fullName") {
      setFormData({ ...formData, [name]: value.replace(/[^a-zA-Z\s]/g, "") });
    } else if (name === "phone" || name === "secondary_phone") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "").slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: any, type: "property" | "appointment") => {
    e.preventDefault();
    if (type === "property" && (!formData.property || !formData.unitType)) {
      return toast({ title: "Missing Data", description: "Select property and unit type", variant: "destructive" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast({ title: "Invalid Email", description: "Enter a valid email", variant: "destructive" });
    }
    if (formData.phone.length !== 10) {
      return toast({ title: "Invalid Phone", description: "Phone must be 10 digits", variant: "destructive" });
    }
    if (!captchaToken) {
      return toast({ title: "Captcha Required", description: "Please verify you are human", variant: "destructive" });
    }
    if (!formData.consent) {
      return toast({ title: "Consent Required", description: "You must agree to be contacted", variant: "destructive" });
    }
    if (type === "property" && !formData.acceptTnC) {
      return toast({ title: "T&C Required", description: "Accept Terms & Conditions", variant: "destructive" });
    }

    let error = null;
    if (type === "property") {
      const { data: insertData, error: insertError } = await supabase.from("property_bookings").insert([
        {
          property_id: formData.property,
          unit_type: formData.unitType,
          preferred_contact: formData.preferredContact,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          secondary_phone: formData.secondary_phone,
          national_id: formData.nationalId,
          move_in_date: formData.moveInDate || null,
          notes: formData.notes || null,
          recaptcha_token: captchaToken,
        },
      ]).select();

      if (!insertError && insertData && insertData.length > 0) {
        // Send booking confirmation email
        try {
          await supabase.rpc('send_booking_confirmation', {
            p_booking_id: insertData[0].id
          });
        } catch (emailError) {
          console.error('Email confirmation failed:', emailError);
          // Don't fail the booking if email fails
        }

        await supabase.rpc("increment_booked_units", {
          property_id: formData.property,
          unit_type: formData.unitType,
        });
        fetchStock(formData.property);
      }
      error = insertError;
    } else {
      const { error: insertError } = await supabase.from("appointments").insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          preferred_contact: formData.preferredContact,
          secondary_phone: formData.secondary_phone,
          appointment_date: formData.appointmentDate,
          notes: formData.notes || null,
          recaptcha_token: captchaToken,
        },
      ]);
      error = insertError;
    }

    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });

    toast({ 
      title: "Success", 
      description: type === "property" 
        ? "Property booking submitted successfully! Check your email for confirmation details." 
        : "Appointment scheduled successfully!" 
    });
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      secondary_phone: "",
      nationalId: "",
      property: "",
      unitType: "",
      preferredContact: "WhatsApp",
      moveInDate: "",
      appointmentDate: "",
      notes: "",
      consent: false,
      acceptTnC: false,
    });
    setCaptchaToken(null);
  };

  if (loading) return <div className="min-h-screen bg-background">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold">Book Your Appointment or Property</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2">Secure a viewing or reserve your preferred unit in minutes.</p>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
        <div className="flex gap-4 mb-8 justify-center">
          <Button variant={bookingType === "appointment" ? "default" : "outline"} onClick={() => setBookingType("appointment")}>Book Appointment</Button>
          <Button variant={bookingType === "property" ? "default" : "outline"} onClick={() => setBookingType("property")}>Book Property</Button>
        </div>

        {bookingType === "property" ? (
          <form onSubmit={(e) => handleSubmit(e, "property")} className="space-y-6 max-w-2xl mx-auto">
            <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputGroup label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            <SelectPreferredContact value={formData.preferredContact} onChange={(v:any)=>setFormData({...formData, preferredContact:v})} />
            <InputGroup label="Secondary Phone" name="secondary_phone" type="tel" value={formData.secondary_phone} onChange={handleChange} required />
            <InputGroup label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} required />
            <SelectProject projects={projects} value={formData.property} onChange={(v: any) => setFormData({ ...formData, property: v })} />

            <div className="space-y-2">
              <Label>Select Unit Type *</Label>
              <Select value={formData.unitType} onValueChange={(v) => setFormData({ ...formData, unitType: v })}>
                <SelectTrigger><SelectValue placeholder="Select unit type" /></SelectTrigger>
                <SelectContent>
  {Object.keys(units).map((unit) => (
  <SelectItem key={unit} value={unit}>
    {unit} - Available: {stock[unit] ?? 0}
  </SelectItem>
))}

</SelectContent>

              </Select>
            </div>

            <InputGroup label="Move In Date" name="moveInDate" type="date" value={formData.moveInDate} onChange={handleChange} />
            <TextareaGroup label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
            <ConsentCheckbox checked={formData.consent} onChange={(v: any) => setFormData({ ...formData, consent: v })} />
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.acceptTnC} onCheckedChange={(v: any) => setFormData({ ...formData, acceptTnC: !!v })} />
              <Label>I have read and agree to <a href="/terms-and-conditions" className="text-primary underline">Terms & Conditions</a>.</Label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">📧 Email Updates</h4>
              <p className="text-sm text-blue-700">
                After submitting your booking, you'll receive:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li><strong>Instant confirmation</strong> with your booking reference number</li>
                <li><strong>Status updates</strong> (approved/under review) within 24-48 hours</li>
                <li><strong>Direct contact</strong> from our sales team if approved</li>
                <li><strong>All communication</strong> via email - no need to visit the website</li>
              </ul>
              <p className="text-sm text-blue-800 font-medium mt-3">
                💡 Keep your booking reference number for easy communication with our team.
              </p>
            </div>
            
            <ReCAPTCHA sitekey={SITE_KEY} onChange={(token) => setCaptchaToken(token)} />
            <Button type="submit" className="w-full bg-primary" disabled={!formData.consent || !formData.acceptTnC}>Submit Booking</Button>
          </form>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, "appointment")} className="space-y-6 max-w-2xl mx-auto">
            <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
            <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <InputGroup label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            <SelectPreferredContact value={formData.preferredContact} onChange={(v:any)=>setFormData({...formData, preferredContact:v})} />
            <InputGroup label="Secondary Phone" name="secondary_phone" type="tel" value={formData.secondary_phone} onChange={handleChange} required />
            <InputGroup label="Preferred Date & Time" name="appointmentDate" type="datetime-local" value={formData.appointmentDate} onChange={handleChange} required />
            <TextareaGroup label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
            <ConsentCheckbox checked={formData.consent} onChange={(v: any) => setFormData({ ...formData, consent: v })} />
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.acceptTnC} onCheckedChange={(v: any) => setFormData({ ...formData, acceptTnC: !!v })} />
              <Label>I have read and agree to <a href="/terms-and-conditions" className="text-primary underline">Terms & Conditions</a>.</Label>
            </div>
            <ReCAPTCHA sitekey={SITE_KEY} onChange={(token) => setCaptchaToken(token)} />
            <Button type="submit" className="w-full bg-primary">Book Appointment</Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

const InputGroup = ({ label, name, value, onChange, type = "text", required = false }: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}{required && " *"}</Label>
    <Input id={name} name={name} type={type} value={value} onChange={onChange} required={required} />
  </div>
);

const TextareaGroup = ({ label, name, value, onChange }: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Textarea id={name} name={name} rows={4} value={value} onChange={onChange} />
  </div>
);

const SelectProject = ({ projects, value, onChange }: any) => (
  <div className="space-y-2">
    <Label htmlFor="property">Select Property *</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
      <SelectContent>
        {projects.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.title} - {p.location}</SelectItem>))}
      </SelectContent>
    </Select>
  </div>
);

const ConsentCheckbox = ({ checked, onChange }: any) => (
  <div className="flex items-center space-x-2">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    <Label>I agree to be contacted.</Label>
  </div>
);

const SelectPreferredContact = ({ value, onChange }: any) => (
  <div className="space-y-2">
    <Label>Preferred Contact Platform</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
      <SelectContent>
        {['WhatsApp','Telegram','Viber','WeChat','Phone','Email'].map((v)=> (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
