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
  const [stockLoading, setStockLoading] = useState(false);
  const [units, setUnits] = useState<Record<string, { size?: string; price?: string }>>({});
  const [planAvailable, setPlanAvailable] = useState<Record<string, number>>({});
  const [availableFloorUnits, setAvailableFloorUnits] = useState<Array<{ key: string; type: string; floor: number; size?: string; price?: string }>>([]);
  const [selectedUnitComposite, setSelectedUnitComposite] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"appointment" | "property">("property");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    floorNumber: "",
    appointmentDate: "",
    notes: "",
    consent: false,
    acceptTnC: false,
  });

  useEffect(() => {
    // Get project ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    supabase.from("projects").select("*").in("status", ["active", "completed"]).then(({ data }) => {
      setProjects(data || []);
      
      // Auto-populate property if project ID is provided
      if (projectId && data) {
        const project = data.find(p => p.id === projectId);
        if (project) {
          setFormData(prev => ({ ...prev, property: projectId }));
        }
      }
      
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!formData.property) return;
    const project = projects.find((p) => p.id === formData.property);
    if (project) {
      // Handle both old units structure and new floor plans structure
      if (project.floor_plans && project.floor_plans.length > 0) {
        // New floor plan structure
        const unitTypes: Record<string, { size?: string; price?: string }> = {};
        const counts: Record<string, number> = {};
        const floorItems: Array<{ key: string; type: string; floor: number; size?: string; price?: string }> = [];
        project.floor_plans.forEach((floor: any) => {
          floor.apartment_types.forEach((apt: any) => {
            if (!apt || !apt.type) return;
            const typeKey = String(apt.type).trim();
            if (!unitTypes[typeKey]) {
              unitTypes[typeKey] = { size: apt.size || undefined, price: apt.price || undefined };
            }
            // Count available entries from floor plans as a fallback
            const isAvailable = (apt.availability === 'available' || !apt.availability);
            if (isAvailable) {
              counts[typeKey] = (counts[typeKey] || 0) + 1;
              const composite = `${typeKey}::floor-${floor.floor_number}`;
              floorItems.push({ key: composite, type: typeKey, floor: floor.floor_number, size: apt.size || undefined, price: apt.price || undefined });
            }
          });
        });
        setUnits(unitTypes);
        setPlanAvailable(counts);
        setAvailableFloorUnits(floorItems);
        setSelectedUnitComposite("");
      } else {
        // Legacy units structure: map to { size }
        const legacyUnits: Record<string, { size?: string; price?: string }> = {};
        const src = (project as any).units || {};
        Object.keys(src).forEach((k) => {
          const key = String(k).trim();
          legacyUnits[key] = { size: src[k] };
        });
        setUnits(legacyUnits);
        setPlanAvailable({});
        setAvailableFloorUnits([]);
        setSelectedUnitComposite("");
      }
      fetchStock(formData.property);
    } else {
      setUnits({});
      setStock({});
      setPlanAvailable({});
      setAvailableFloorUnits([]);
      setSelectedUnitComposite("");
    }
  }, [formData.property, projects]);

  // Ensure selected unit remains valid based on availability
  useEffect(() => {
    if (stockLoading) return;
    const project = projects.find((p) => p.id === formData.property);
    if (project && project.floor_plans && project.floor_plans.length > 0) {
      // For floor plans, ensure there's still at least one available entry for the selected type
      if (formData.unitType) {
        const stillAvailable = availableFloorUnits.some(item => item.type === formData.unitType);
        if (!stillAvailable) {
          setFormData((prev) => ({ ...prev, unitType: "" }));
          setSelectedUnitComposite("");
        }
      }
      return;
    }
    // Legacy / stock-based
    const availableKeys = Object.keys(units).filter((u) => (stock[u] ?? 0) > 0);
    if (formData.unitType && !availableKeys.includes(formData.unitType)) {
      setFormData((prev) => ({ ...prev, unitType: "" }));
    }
  }, [stockLoading, stock, units, availableFloorUnits, projects, formData.property]);

  const fetchStock = async (propertyId: string) => {
    try {
      setStockLoading(true);
      const { data, error } = await supabase
        .from("unit_stock")
        .select("unit_type, total_units, booked_units, property_id")
        .eq("property_id", propertyId);
      if (error) {
        console.error("Stock fetch error:", error);
        return;
      }
      if (data) {
        const stockMap: Record<string, number> = {};
        data.forEach((s: any) => {
          const available = (s.total_units ?? 0) - (s.booked_units ?? 0);
          const key = String(s.unit_type || '').trim();
          if (!key) return;
          stockMap[key] = available;
        });
        setStock(stockMap);
      }
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('unit_stock_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'unit_stock' },
        (payload: any) => {
          const record = payload.new || payload.old;
          if (!record) return;
          if (record.property_id === formData.property) {
            if (payload.eventType === 'DELETE') {
              setStock((prev) => {
                const next = { ...prev } as Record<string, number>;
                const key = String(record.unit_type || '').trim();
                if (key) delete next[key];
                return next;
              });
            } else {
              const available = (record.total_units ?? 0) - (record.booked_units ?? 0);
              setStock((prev) => ({
                ...prev,
                [String(record.unit_type || '').trim()]: available,
              }));
            }
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
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
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

    setIsSubmitting(true);

    let error = null;
    if (type === "property") {
      const { error: insertError } = await supabase.from("property_bookings").insert([
        {
          property_id: formData.property,
          unit_type: formData.unitType,
          floor_number: formData.floorNumber ? Number(formData.floorNumber) : null,
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
      ]);

      if (!insertError) {
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

    if (error) {
      setIsSubmitting(false);
      return toast({ title: "Error", description: (error as any).message, variant: "destructive" });
    }

    toast({ title: "Success", description: type === "property" ? "Property booked successfully" : "Appointment scheduled" });
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
      floorNumber: "",
      appointmentDate: "",
      notes: "",
      consent: false,
      acceptTnC: false,
    });
    setCaptchaToken(null);
    setIsSubmitting(false);
    setSelectedUnitComposite("");
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold">Book Your Appointment or Property</h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2">Secure a viewing or reserve your preferred unit in minutes.</p>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
        <div className="flex justify-center items-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Loading booking form...</p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare everything for you</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  const currentProject = projects.find((p) => p.id === formData.property);
  const hasFloorPlans = !!(currentProject && currentProject.floor_plans && currentProject.floor_plans.length > 0);

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
              {hasFloorPlans ? (
                <Select value={selectedUnitComposite} onValueChange={(v) => {
                  setSelectedUnitComposite(v);
                  const [typeOnly, floorPart] = v.split("::");
                  const floorNum = (floorPart || '').replace('floor-', '');
                  setFormData({ ...formData, unitType: typeOnly || '', floorNumber: floorNum || '' });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select floor & type" /></SelectTrigger>
                  <SelectContent>
                    {availableFloorUnits.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        No units available
                      </SelectItem>
                    ) : (
                      availableFloorUnits.map((item) => {
                        const meta = units[item.type] || {} as { size?: string; price?: string };
                        const detailParts = [meta.size, meta.price].filter(Boolean) as string[];
                        const detail = detailParts.length ? ` (${detailParts.join(' • ')})` : '';
                        return (
                          <SelectItem key={item.key} value={item.key}>
                            {`Floor ${item.floor} — ${item.type}${detail}`}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={formData.unitType} onValueChange={(v) => setFormData({ ...formData, unitType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit type" /></SelectTrigger>
                  <SelectContent>
                    {stockLoading ? (
                      <SelectItem value="__loading__" disabled>
                        Loading availability...
                      </SelectItem>
                    ) : (
                      (() => {
                        const availableKeys = Object.keys(units).filter((unit) => (stock[unit] ?? 0) > 0);
                        if (availableKeys.length === 0) {
                          return (
                            <SelectItem value="__none__" disabled>
                              No units available
                            </SelectItem>
                          );
                        }
                        return availableKeys.map((unit) => {
                          const meta = units[unit] || {} as { size?: string; price?: string };
                          const detailParts = [meta.size, meta.price].filter(Boolean) as string[];
                          const detail = detailParts.length ? ` (${detailParts.join(' • ')})` : '';
                          const count = stock[unit] ?? 0;
                          return (
                            <SelectItem key={unit} value={unit}>
                              {unit}{detail} — {count} available
                            </SelectItem>
                          );
                        });
                      })()
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <InputGroup label="Move In Date" name="moveInDate" type="date" value={formData.moveInDate} onChange={handleChange} />
            <TextareaGroup label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
            <ConsentCheckbox checked={formData.consent} onChange={(v: any) => setFormData({ ...formData, consent: v })} />
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.acceptTnC} onCheckedChange={(v: any) => setFormData({ ...formData, acceptTnC: !!v })} />
              <Label>I have read and agree to <a href="/terms-and-conditions" className="text-primary underline">Terms & Conditions</a>.</Label>
            </div>
            <ReCAPTCHA sitekey={SITE_KEY} onChange={(token) => setCaptchaToken(token)} />
            <Button 
              type="submit" 
              className="w-full bg-primary" 
              disabled={!formData.consent || !formData.acceptTnC || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
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
            <Button 
              type="submit" 
              className="w-full bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
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
        {["WhatsApp","Telegram","Viber","WeChat","Phone","Email"].map((v)=> (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

