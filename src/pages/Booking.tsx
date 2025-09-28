import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReCAPTCHA from "react-google-recaptcha";
import { SITE_RECAPTCHA_KEY } from "@/utils/env";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Captcha site key is injected via env
const SITE_KEY = SITE_RECAPTCHA_KEY;

export default function Booking() {
  const { toast } = useToast();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsChoice, setTermsChoice] = useState<"agree" | "disagree" | "">("");
  const [projects, setProjects] = useState<any[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [stockLoading, setStockLoading] = useState(false);
  const [units, setUnits] = useState<
    Record<string, { size?: string; price?: string }>
  >({});
  const [planAvailable, setPlanAvailable] = useState<Record<string, number>>(
    {}
  );
  const [availableFloorUnits, setAvailableFloorUnits] = useState<
    Array<{
      key: string;
      type: string;
      floor: number;
      size?: string;
      price?: string;
      availability?: "available" | "sold" | "reserved";
    }>
  >([]);
  const [selectedUnitComposite, setSelectedUnitComposite] =
    useState<string>("");
  const [selectedAvailability, setSelectedAvailability] = useState<
    "" | "available" | "sold" | "reserved"
  >("");
  const [loading, setLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"appointment" | "property">(
    "property"
  );
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
    const projectId = urlParams.get("project");

    supabase
      .from("projects")
      .select("*")
      .in("status", ["active", "completed"])
      .then(({ data }) => {
        setProjects(data || []);

        // Auto-populate property if project ID is provided
        if (projectId && data) {
          const project = data.find((p) => p.id === projectId);
          if (project) {
            setFormData((prev) => ({ ...prev, property: projectId }));
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
        const floorItems: Array<{
          key: string;
          type: string;
          floor: number;
          size?: string;
          price?: string;
          availability?: "available" | "sold" | "reserved";
        }> = [];
        project.floor_plans.forEach((floor: any) => {
          floor.apartment_types.forEach((apt: any) => {
            if (!apt || !apt.type) return;
            const typeKey = String(apt.type).trim();
            if (!unitTypes[typeKey]) {
              unitTypes[typeKey] = {
                size: apt.size || undefined,
                price: apt.price || undefined,
              };
            }
            const isAvailable =
              apt.availability === "available" || !apt.availability;
            if (isAvailable) {
              counts[typeKey] = (counts[typeKey] || 0) + 1;
            }
            const composite = `${typeKey}::floor-${floor.floor_number}`;
            floorItems.push({
              key: composite,
              type: typeKey,
              floor: floor.floor_number,
              size: apt.size || undefined,
              price: apt.price || undefined,
              availability: apt.availability,
            });
          });
        });
        setUnits(unitTypes);
        setPlanAvailable(counts);
        setAvailableFloorUnits(floorItems);
        setSelectedUnitComposite("");
        setSelectedAvailability("");
      } else {
        // Legacy units structure: map to { size }
        const legacyUnits: Record<string, { size?: string; price?: string }> =
          {};
        const src = (project as any).units || {};
        Object.keys(src).forEach((k) => {
          const key = String(k).trim();
          legacyUnits[key] = { size: src[k] };
        });
        setUnits(legacyUnits);
        setPlanAvailable({});
        setAvailableFloorUnits([]);
        setSelectedUnitComposite("");
        setSelectedAvailability("");
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
        const stillAvailable = availableFloorUnits.some(
          (item) => item.type === formData.unitType
        );
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
  }, [
    stockLoading,
    stock,
    units,
    availableFloorUnits,
    projects,
    formData.property,
    formData.unitType,
  ]);

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
          const key = String(s.unit_type || "").trim();
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
      .channel("unit_stock_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unit_stock" },
        (payload: any) => {
          const record = payload.new || payload.old;
          if (!record) return;
          if (record.property_id === formData.property) {
            if (payload.eventType === "DELETE") {
              setStock((prev) => {
                const next = { ...prev } as Record<string, number>;
                const key = String(record.unit_type || "").trim();
                if (key) delete next[key];
                return next;
              });
            } else {
              const available =
                (record.total_units ?? 0) - (record.booked_units ?? 0);
              setStock((prev) => ({
                ...prev,
                [String(record.unit_type || "").trim()]: available,
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
      setFormData({
        ...formData,
        [name]: value.replace(/\D/g, "").slice(0, 10),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: any, type: "property" | "appointment") => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    if (type === "property" && (!formData.property || !formData.unitType)) {
      return toast({
        title: "Missing Data",
        description: "Select property and unit type",
        variant: "destructive",
      });
    }
    if (
      type === "property" &&
      selectedAvailability &&
      selectedAvailability !== "available"
    ) {
      return toast({
        title: "Not Available",
        description: `This unit is already ${selectedAvailability}.`,
        variant: "destructive",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast({
        title: "Invalid Email",
        description: "Enter a valid email",
        variant: "destructive",
      });
    }
    if (formData.phone.length !== 10) {
      return toast({
        title: "Invalid Phone",
        description: "Phone must be 10 digits",
        variant: "destructive",
      });
    }
    if (!captchaToken) {
      return toast({
        title: "Captcha Required",
        description: "Please verify you are human",
        variant: "destructive",
      });
    }
    if (!formData.consent) {
      return toast({
        title: "Consent Required",
        description: "You must agree to be contacted",
        variant: "destructive",
      });
    }
    if (type === "property" && !formData.acceptTnC) {
      return toast({
        title: "T&C Required",
        description: "Accept Terms & Conditions",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    let error = null;
    if (type === "property") {
      const { error: insertError } = await supabase
        .from("property_bookings")
        .insert([
          {
            property_id: formData.property,
            unit_type: formData.unitType,
            floor_number: formData.floorNumber
              ? Number(formData.floorNumber)
              : null,
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
      const { error: insertError } = await supabase
        .from("appointments")
        .insert([
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
      return toast({
        title: "Error",
        description: (error as any).message,
        variant: "destructive",
      });
    }

    toast({
      title: "Success",
      description:
        type === "property"
          ? "Property booked successfully"
          : "Appointment scheduled",
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

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold">
              Book Your Appointment or Property
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mt-2">
              Secure a viewing or reserve your preferred unit in minutes.
            </p>
          </div>
        </section>
        <main className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
          <div className="flex justify-center items-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">
                Loading booking form...
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait while we prepare everything for you
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );

  const currentProject = projects.find((p) => p.id === formData.property);
  const hasFloorPlans = !!(
    currentProject &&
    currentProject.floor_plans &&
    currentProject.floor_plans.length > 0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold">
            Book Your Appointment or Property
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-2">
            Secure a viewing or reserve your preferred unit in minutes.
          </p>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
        <div className="flex gap-4 mb-8 justify-center">
          <Button
            variant={bookingType === "appointment" ? "default" : "outline"}
            onClick={() => setBookingType("appointment")}
          >
            Book Appointment
          </Button>
          <Button
            variant={bookingType === "property" ? "default" : "outline"}
            onClick={() => setBookingType("property")}
          >
            Book Property
          </Button>
        </div>

        {bookingType === "property" ? (
          <Card className="shadow-lg broder">
            <CardContent className="space-y-8">
              <form onSubmit={(e) => handleSubmit(e, "property")}>
                <div className="grid grid-cols-1 gap-4">
                  <InputGroup
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <InputGroup
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <InputGroup
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <SelectPreferredContact
                    value={formData.preferredContact}
                    onChange={(v: any) =>
                      setFormData({ ...formData, preferredContact: v })
                    }
                  />
                  <InputGroup
                    label="Secondary Phone (Optional)"
                    name="secondary_phone"
                    type="tel"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                  />
                  <InputGroup
                    label="National ID (Optional)"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                  />
                  <div className="w-full">
                    <SelectProject
                      projects={projects}
                      value={formData.property}
                      onChange={(v: any) =>
                        setFormData({ ...formData, property: v })
                      }
                    />
                  </div>

                  <div className="w-full">
                    <Label>Select Unit Type *</Label>
                    {hasFloorPlans ? (
                      <Select
                        value={selectedUnitComposite}
                        onValueChange={(v) => {
                          setSelectedUnitComposite(v);
                          const [typeOnly, floorPart] = v.split("::");
                          const floorNum = (floorPart || "").replace(
                            "floor-",
                            ""
                          );
                          const opt = availableFloorUnits.find(
                            (item) => item.key === v
                          );
                          const avail = (opt?.availability || "available") as
                            | "available"
                            | "sold"
                            | "reserved";
                          setSelectedAvailability(avail);
                          setFormData({
                            ...formData,
                            unitType: typeOnly || "",
                            floorNumber: floorNum || "",
                          });
                        }}
                      >
                        <SelectTrigger className="border border-[#088d92] focus:border-[#088d92] focus:ring-[#088d92]/30">
                          <SelectValue placeholder="Select floor & type" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFloorUnits.length === 0 ? (
                            <SelectItem value="__none__" disabled>
                              No units available
                            </SelectItem>
                          ) : (
                            availableFloorUnits.map((item) => {
                              const meta =
                                units[item.type] ||
                                ({} as { size?: string; price?: string });
                              const detailParts = [
                                meta.size,
                                meta.price,
                              ].filter(Boolean) as string[];
                              const detail = detailParts.length
                                ? ` (${detailParts.join(" • ")})`
                                : "";
                              return (
                                <SelectItem
                                  key={item.key}
                                  value={item.key}
                                >{`Floor ${item.floor} — ${item.type}${detail}`}</SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={formData.unitType}
                        onValueChange={(v) => {
                          const count = stock[v] ?? 0;
                          const avail = count > 0 ? "available" : "sold";
                          setSelectedAvailability(avail);
                          if (avail !== "available") {
                            toast({
                              title: "Not Available",
                              description: `This unit is already ${avail}.`,
                              variant: "destructive",
                            });
                          }
                          setFormData({ ...formData, unitType: v });
                        }}
                      >
                        <SelectTrigger className="border border-[#088d92] focus:border-[#088d92] focus:ring-[#088d92]/30">
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockLoading ? (
                            <SelectItem value="__loading__" disabled>
                              Loading availability...
                            </SelectItem>
                          ) : (
                            (() => {
                              const allKeys = Object.keys(units);
                              if (allKeys.length === 0) {
                                return (
                                  <SelectItem value="__none__" disabled>
                                    No unit types configured
                                  </SelectItem>
                                );
                              }
                              return allKeys.map((unit) => {
                                const meta =
                                  units[unit] ||
                                  ({} as { size?: string; price?: string });
                                const detailParts = [
                                  meta.size,
                                  meta.price,
                                ].filter(Boolean) as string[];
                                const detail = detailParts.length
                                  ? ` (${detailParts.join(" • ")})`
                                  : "";
                                const count = stock[unit] ?? 0;
                                const status = count > 0 ? "Available" : "Sold";
                                const availabilityText =
                                  count > 0 ? `${count} available` : status;
                                return (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                    {detail} — {availabilityText}
                                  </SelectItem>
                                );
                              });
                            })()
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <InputGroup
                    label="Move In Date"
                    name="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={handleChange}
                  />
                  <div>
                    <TextareaGroup
                      label="Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <ConsentCheckbox
                      checked={formData.consent}
                      onChange={(v: any) =>
                        setFormData({ ...formData, consent: v })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.acceptTnC}
                      onCheckedChange={(v: any) =>
                        setFormData({ ...formData, acceptTnC: !!v })
                      }
                    />
                    <Label>
                      I have read and agree to{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen(true)}
                        className="text-primary underline"
                      >
                        Terms & Conditions
                      </button>
                      .
                    </Label>
                  </div>

                  {/* keep ReCAPTCHA commented if you prefer; uncomment to enable */}
                  <div className="pt-2">
                    <ReCAPTCHA
                      sitekey={SITE_KEY}
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-primary"
                      disabled={
                        !formData.consent || !formData.acceptTnC || isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border">
            <CardContent className="space-y-8">
              <form onSubmit={(e) => handleSubmit(e, "appointment")}>
                <div className="grid grid-cols-1 gap-4">
                  <InputGroup
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <InputGroup
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <InputGroup
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <SelectPreferredContact
                    value={formData.preferredContact}
                    onChange={(v: any) =>
                      setFormData({ ...formData, preferredContact: v })
                    }
                  />
                  <InputGroup
                    label="Secondary Phone (Optional)"
                    name="secondary_phone"
                    type="tel"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                  />
                  <InputGroup
                    label="Preferred Date & Time"
                    name="appointmentDate"
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                  />
                  <div>
                    <TextareaGroup
                      label="Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <ConsentCheckbox
                      checked={formData.consent}
                      onChange={(v: any) =>
                        setFormData({ ...formData, consent: v })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.acceptTnC}
                      onCheckedChange={(v: any) =>
                        setFormData({ ...formData, acceptTnC: !!v })
                      }
                    />
                    <Label>
                      I have read and agree to{" "}
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen(true)}
                        className="text-primary underline"
                      >
                        Terms & Conditions
                      </button>
                      .
                    </Label>
                  </div>

                  <div className="pt-2">
                    <ReCAPTCHA
                      sitekey={SITE_KEY}
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>

                  <div>
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
                        "Book Appointment"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <Dialog
        open={isTermsOpen}
        onOpenChange={(open) => {
          setIsTermsOpen(open);
          if (!open) setTermsChoice("");
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm leading-6">
            <section className="space-y-2">
              <p>
                These Terms and Conditions govern your use of the website of
                Huda Engineering PLC. By accessing or using this website, you
                agree to be bound by these Terms. If you do not agree, please do
                not use the Site.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">1. Use of the Site</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  1.1 You may use this Site only for lawful purposes and in
                  accordance with these Terms.
                </li>
                <li>
                  1.2 You agree not to misuse the Site, attempt unauthorized
                  access, or interfere with its operation.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">2. Services</h3>
              <p>2.1 The Site allows users to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>View information about properties and projects.</li>
                <li>Book property viewings and appointments online.</li>
                <li>Submit inquiries.</li>
              </ul>
              <p>
                2.2 All bookings are subject to confirmation by Huda Engineering
                and do not create any binding agreement for purchase, lease, or
                service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">
                3. Booking and Appointments
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  3.1 Provide accurate and complete information when submitting
                  a booking.
                </li>
                <li>
                  3.2 Appointments are confirmed only after you receive
                  confirmation by email, phone, or SMS.
                </li>
                <li>
                  3.3 We may decline, reschedule, or cancel bookings at our
                  discretion.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">4. Cancellations</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  4.1 You may cancel or reschedule by providing at least 24
                  hours’ notice.
                </li>
                <li>
                  4.2 Failure to attend without notice may affect your ability
                  to make future bookings.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">5. Payments</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  5.1 Online bookings are free of charge unless otherwise
                  stated.
                </li>
                <li>
                  5.2 Any purchase, lease, or service agreement is subject to a
                  separate written contract.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">
                6. Intellectual Property
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  6.1 All content on the Site is the property of Huda
                  Engineering PLC.
                </li>
                <li>
                  6.2 You may not copy, modify, distribute, or use any content
                  without prior written consent.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">7. Privacy</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  7.1 Personal information is used only for booking management
                  and communication.
                </li>
                <li>
                  7.2 We handle information according to our Privacy Policy.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">
                8. Limitation of Liability
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  8.1 We strive for accuracy but do not guarantee error-free
                  content.
                </li>
                <li>
                  8.2 We are not responsible for any loss arising from use of
                  the Site.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">9. Termination</h3>
              <p>
                9.1 We may suspend or terminate access if you violate these
                Terms or misuse the platform.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">10. Governing Law</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  10.1 Governed by the laws of the Federal Democratic Republic
                  of Ethiopia.
                </li>
                <li>10.2 Disputes are subject to the courts of Ethiopia.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">11. Changes to Terms</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>11.1 We may update or modify these Terms at any time.</li>
                <li>11.2 Changes are effective once posted on this page.</li>
              </ul>
            </section>

            <section className="space-y-1">
              <h3 className="text-base font-semibold">12. Contact Us</h3>
              <p>Tel: +251940666661/62</p>
              <p>Tel: +251993864242</p>
              <p>Email: hudaconstructionoffice@gmail.com</p>
              <p>Location: Amnen Building 2nd floor, behind Abyssinia Plaza</p>
              <p>Web: www.hudaengineering.com</p>
              <p>Huda Engineering - Trustworthy real estate</p>
            </section>

            <div className="pt-2 border-t">
              <Label className="mb-2 block">Please confirm your choice:</Label>
              <RadioGroup
                value={termsChoice}
                onValueChange={(v: any) => setTermsChoice(v)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agree" id="tnc_agree" />
                  <Label htmlFor="tnc_agree">I have read and I agree</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disagree" id="tnc_disagree" />
                  <Label htmlFor="tnc_disagree">I do not agree</Label>
                </div>
              </RadioGroup>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTermsOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (termsChoice === "agree") {
                      setFormData((prev: any) => ({
                        ...prev,
                        acceptTnC: true,
                      }));
                      setIsTermsOpen(false);
                    }
                  }}
                  disabled={termsChoice !== "agree"}
                >
                  Accept & Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}

const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>
      {label}
      {required && " *"}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className={`bg-transparent placeholder:text-muted-foreground text-foreground border border-[#088d92] focus:border-[#088d92] focus:ring-[#088d92]/30 ${className}`}
    />
  </div>
);

const TextareaGroup = ({
  label,
  name,
  value,
  onChange,
  className = "",
}: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Textarea
      id={name}
      name={name}
      rows={4}
      value={value}
      onChange={onChange}
      className={`bg-transparent placeholder:text-muted-foreground text-foreground border border-[#088d92] focus:border-[#088d92] focus:ring-[#088d92]/30 ${className}`}
    />
  </div>
);

const SelectProject = ({ projects, value, onChange }: any) => (
  <div className="space-y-2">
    <Label htmlFor="property">Select Property *</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border border-[#088d92] focus:border-[#088d92] focus:ring-[#088d92]/30">
        <SelectValue placeholder="Select property" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p: any) => (
          <SelectItem key={p.id} value={p.id}>
            {p.title} - {p.location}
          </SelectItem>
        ))}
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
      <SelectTrigger>
        <SelectValue placeholder="Select platform" />
      </SelectTrigger>
      <SelectContent>
        {["WhatsApp", "Telegram", "Phone", "Email"].map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
