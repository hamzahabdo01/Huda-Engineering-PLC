import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MessageSquare,
  Calendar,
  Building,
  LogOut,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
  Target,
  Play,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  budget: string;
  message: string;
  status: "pending" | "contacted" | "closed";
  created_at: string;
}

interface PropertyBooking {
  id: string;
  property_id: string;
  property_name?: string;
  full_name: string;
  email: string;
  phone: string;
  unit_type: string;
  preferred_contact?: string;
  secondary_phone?: string;
  floor_number?: number | null;
  national_id: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
}

interface ApartmentType {
  id: string;
  type: string; // e.g., "2B", "3B"
  size: string; // e.g., "120 m2"
  availability: "available" | "sold" | "reserved";
  price?: string;
  image_url?: string;
  gallery_urls?: string[];
  description?: string;
  features?: string[];
}

interface FloorPlan {
  id: string;
  floor_number: number;
  floor_url: string;
  apartment_types: ApartmentType[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  project_type: string;
  status: "active" | "completed" | "upcoming";
  start_date: string;
  end_date: string;
  image_url: string;
  floor_url: string;
  gallery_urls?: string[];
  Amenities: string[];
  floor_plans: FloorPlan[];
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  short_description: string;
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_contact: string;
  secondary_phone: string;
  appointment_date: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

const AdminDashboard = () => {
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null
  );
  const [isConfirmingRejection, setIsConfirmingRejection] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [virtualTours, setVirtualTours] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [assetUploading, setAssetUploading] = useState(false);

  // Dialog states
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);

  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [update, setUpdate] = useState({
    project_id: "",
    description: "",
    media_url: "",
    percentage: "",
  });
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [isVtDialogOpen, setIsVtDialogOpen] = useState(false);
  const [editingVtId, setEditingVtId] = useState<string | null>(null);

  const [vtTitle, setVtTitle] = useState("");
  const [vtDescription, setVtDescription] = useState("");
  const [vtIsPublished, setVtIsPublished] = useState(true);
  const [vtVideoUrl, setVtVideoUrl] = useState("");
  const [vtThumbUrl, setVtThumbUrl] = useState("");
  const [vtUploading, setVtUploading] = useState(false);
  const [vtRoom, setVtRoom] = useState("bedroom"); // default

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    short_description: "",
    location: "",
    project_type: "",
    status: "active" as const,
    start_date: "",
    end_date: "",
    image_url: "",
    floor_url: "",
    gallery_urls: [] as string[],
    floor_plans: [] as FloorPlan[],
    Amenities: [] as string[],
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    short_description: "",
    category: "general",
    image_url: "",
    scheduled_for: "",
    is_published: false,
  });
  // Testimonials form state
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<
    string | null
  >(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    project: "",
    content: "",
    rating: 5 as number,
    video_url: "",
  });
  // Floor plan management state
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [currentFloorNumber, setCurrentFloorNumber] = useState(1);
  // Virtual tours form state
  const [isAddVirtualTourOpen, setIsAddVirtualTourOpen] = useState(false);
  const [editingVirtualTourId, setEditingVirtualTourId] = useState<
    string | null
  >(null);
  const [newVirtualTour, setNewVirtualTour] = useState({
    title: "",
    description: "",
    room: "livingroom" as
      | "bedroom"
      | "kitchen"
      | "livingroom"
      | "bathroom"
      | "balcony",
    thumbnail_url: "",
    video_url: "",
    is_published: true as boolean,
  });

  const [AmenityInput, setAmenityInput] = useState("");

  // Upload helpers (Supabase Storage)
  const uploadFileToBucket = async (
    bucket: string,
    file: File
  ): Promise<string | null> => {
    try {
      setAssetUploading(true);
      const toastHandle = toast({
        title: "Uploading to Supabase Storage...",
        description: `Bucket: ${bucket}`,
      });
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false });
      if (error) {
        toastHandle.update({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        } as any);
        toastHandle.dismiss();
        setAssetUploading(false);
        return null;
      }
      toastHandle.update({
        title: "Processing...",
        description: "Preparing public URL",
      } as any);
      const { data: pub } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      const url = pub.publicUrl;
      toastHandle.update({
        title: "Uploaded",
        description: "Loaded from Supabase into the form.",
      } as any);
      setAssetUploading(false);
      return url;
    } catch (e: any) {
      toast({
        title: "Upload error",
        description: e.message,
        variant: "destructive",
      });
      setAssetUploading(false);
      return null;
    }
  };
  const addAmenity = () => {
    if (!AmenityInput.trim()) return;
    setNewProject((prev) => ({
      ...prev,
      Amenities: [...prev.Amenities, AmenityInput.trim()],
    }));
    setAmenityInput("");
  };
  const removeAmenity = (index: number) => {
    setNewProject((prev) => ({
      ...prev,
      Amenities: prev.Amenities.filter((_, i) => i !== index),
    }));
  };

  // Floor plan management functions
  const addFloorPlan = () => {
    const newFloorPlan: FloorPlan = {
      id: `floor-${Date.now()}`,
      floor_number: currentFloorNumber,
      floor_url: "",
      apartment_types: [],
    };
    setFloorPlans((prev) => [...prev, newFloorPlan]);
    setCurrentFloorNumber((prev) => prev + 1);
  };

  const duplicateFloorPlan = () => {
    if (floorPlans.length === 0) return;
    const lastFloor = floorPlans[floorPlans.length - 1];
    const newFloorPlan: FloorPlan = {
      id: `floor-${Date.now()}`,
      floor_number: currentFloorNumber,
      floor_url: lastFloor.floor_url,
      apartment_types: lastFloor.apartment_types.map((apt) => ({
        ...apt,
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
    setFloorPlans((prev) => [...prev, newFloorPlan]);
    setCurrentFloorNumber((prev) => prev + 1);
  };

  const removeFloorPlan = (floorId: string) => {
    setFloorPlans((prev) => prev.filter((floor) => floor.id !== floorId));
    // Reorder floor numbers
    setFloorPlans((prev) =>
      prev.map((floor, index) => ({
        ...floor,
        floor_number: index + 1,
      }))
    );
    setCurrentFloorNumber(floorPlans.length);
  };

  const addApartmentType = (floorId: string) => {
    const newApartmentType: ApartmentType = {
      id: `apt-${Date.now()}`,
      type: "",
      size: "",
      availability: "available",
      price: "",
      image_url: "",
      gallery_urls: [],
      description: "",
      features: [],
    };

    setFloorPlans((prev) =>
      prev.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              apartment_types: [...floor.apartment_types, newApartmentType],
            }
          : floor
      )
    );
  };

  const removeApartmentType = (floorId: string, apartmentId: string) => {
    setFloorPlans((prev) =>
      prev.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              apartment_types: floor.apartment_types.filter(
                (apt) => apt.id !== apartmentId
              ),
            }
          : floor
      )
    );
  };

  const updateApartmentType = (
    floorId: string,
    apartmentId: string,
    field: keyof ApartmentType,
    value: any
  ) => {
    setFloorPlans((prev) =>
      prev.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              apartment_types: floor.apartment_types.map((apt) =>
                apt.id === apartmentId ? { ...apt, [field]: value } : apt
              ),
            }
          : floor
      )
    );
  };

  const updateFloorPlan = (
    floorId: string,
    field: keyof FloorPlan,
    value: any
  ) => {
    setFloorPlans((prev) =>
      prev.map((floor) =>
        floor.id === floorId ? { ...floor, [field]: value } : floor
      )
    );
  };

  const [AmenitiesInput, setAmenitiesInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "contacts"
    | "bookings"
    | "projects"
    | "announcements"
    | "appointments"
    | "testimonials"
    | "virtual-tours"
  >("contacts");
  const [deletingContact, setDeletingContact] = useState<string | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<string | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(
    null
  );

  // Rejection reason dialog state
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingRejection, setPendingRejection] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log("🔄 Starting data fetch...");
    setDataLoading(true);

    try {
      console.log("🔐 Current user:", user?.email);
      console.log("👤 Current profile:", profile);

      const [
        contactsRes,
        projectsRes,
        announcementsRes,
        appointmentsRes,
        testimonialsRes,
        virtualToursRes,
      ] = await Promise.all([
        supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("virtual_tours")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      // Fetch bookings with property names
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("property_bookings")
        .select(
          `
          *,
          projects!inner(title)
        `
        )
        .order("created_at", { ascending: false });

      const { data: tours, error: toursError } = await supabase
        .from("virtual_tours")
        .select("*")
        .order("created_at", { ascending: false });

      if (toursError) {
        console.error("Error fetching virtual tours:", toursError);
      } else {
        setVirtualTours(tours || []);
      }

      const bookingsRes = { data: bookingsData, error: bookingsError };

      console.log("📞 Contacts response:", contactsRes);
      console.log("🏠 Bookings response:", bookingsRes);
      console.log("🏗️ Projects response:", projectsRes);
      console.log("📢 Announcements response:", announcementsRes);
      console.log("📅 Appointments response:", appointmentsRes);
      console.log("🎬 Testimonials response:", testimonialsRes);
      console.log("🎥 Virtual Tours response:", virtualToursRes);

      if (contactsRes.error) {
        console.error("❌ Contacts error:", contactsRes.error);
        toast({
          title: "Error fetching contacts",
          description: contactsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${contactsRes.data?.length || 0} contacts`);
        setContacts((contactsRes.data as ContactSubmission[]) || []);
      }

      if (bookingsRes.error) {
        console.error("❌ Bookings error:", bookingsRes.error);
        toast({
          title: "Error fetching bookings",
          description: bookingsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${bookingsRes.data?.length || 0} bookings`);
        // Process bookings to extract property names from the joined data
        const processedBookings =
          bookingsRes.data?.map((booking: any) => ({
            ...booking,
            property_name: booking.projects?.title || "Unknown Property",
          })) || [];
        setBookings(processedBookings);
      }

      if (projectsRes.error) {
        console.error("❌ Projects error:", projectsRes.error);
        toast({
          title: "Error fetching projects",
          description: projectsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${projectsRes.data?.length || 0} projects`);
        setProjects((projectsRes.data as unknown as Project[]) || []);
      }

      if (announcementsRes.error) {
        console.error("❌ Announcements error:", announcementsRes.error);
        toast({
          title: "Error fetching announcements",
          description: announcementsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(
          `✅ Setting ${announcementsRes.data?.length || 0} announcements`
        );
        setAnnouncements((announcementsRes.data as Announcement[]) || []);
      }

      if (testimonialsRes.error) {
        console.error("❌ Testimonials error:", testimonialsRes.error);
      } else {
        setTestimonials(testimonialsRes.data || []);
      }

      if (virtualToursRes.error) {
        console.error("❌ Virtual tours error:", virtualToursRes.error);
      } else {
        setVirtualTours(virtualToursRes.data || []);
      }

      if (appointmentsRes.error) {
        console.error("❌ Appointments error:", appointmentsRes.error);
        toast({
          title: "Error fetching appointments",
          description: appointmentsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(
          `✅ Setting ${appointmentsRes.data?.length || 0} appointments`
        );
        setAppointments((appointmentsRes.data as Appointment[]) || []);
      }
    } catch (error) {
      console.error("💥 Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
      console.log("✅ Data fetch completed");
    }
  }, [user, profile, toast]);

  const setupRealtimeSubscriptions = useCallback(() => {
    console.log("🔄 Setting up real-time subscriptions...");

    // Subscribe to contact submissions
    const contactsSubscription = supabase
      .channel("contact_submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_submissions" },
        (payload) => {
          console.log("📞 Contact submission change:", payload);
          if (payload.eventType === "INSERT") {
            const newContact = payload.new as ContactSubmission;
            setContacts((prev) => [newContact, ...prev]);
            toast({
              title: "New Contact Submission",
              description: `New contact from ${newContact.name}`,
            });
          } else if (payload.eventType === "UPDATE") {
            setContacts((prev) =>
              prev.map((contact) =>
                contact.id === payload.new.id
                  ? (payload.new as ContactSubmission)
                  : contact
              )
            );
          } else if (payload.eventType === "DELETE") {
            setContacts((prev) =>
              prev.filter((contact) => contact.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to property bookings
    const bookingsSubscription = supabase
      .channel("property_bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "property_bookings" },
        (payload) => {
          console.log("🏠 Property booking change:", payload);
          // Refetch bookings to get updated data with property names
          fetchData();
          if (payload.eventType === "INSERT") {
            toast({
              title: "New Property Booking",
              description: `New booking received`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to projects
    const projectsSubscription = supabase
      .channel("projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          console.log("🏗️ Project change:", payload);
          if (payload.eventType === "INSERT") {
            setProjects((prev) => [payload.new as Project, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProjects((prev) =>
              prev.map((project) =>
                project.id === payload.new.id
                  ? (payload.new as Project)
                  : project
              )
            );
            // Refetch bookings when project titles change to update property names
            fetchData();
          } else if (payload.eventType === "DELETE") {
            setProjects((prev) =>
              prev.filter((project) => project.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to announcements
    const announcementsSubscription = supabase
      .channel("announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        (payload) => {
          console.log("📢 Announcement change:", payload);
          if (payload.eventType === "INSERT") {
            setAnnouncements((prev) => [payload.new as Announcement, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAnnouncements((prev) =>
              prev.map((announcement) =>
                announcement.id === payload.new.id
                  ? (payload.new as Announcement)
                  : announcement
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAnnouncements((prev) =>
              prev.filter((announcement) => announcement.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to virtual tours
    const virtualToursSubscription = supabase
      .channel("virtual_tours")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "virtual_tours" },
        (payload) => {
          console.log("🎥 Virtual tour change:", payload);
          if (payload.eventType === "INSERT") {
            setVirtualTours((prev) => [payload.new as any, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setVirtualTours((prev) =>
              prev.map((v) =>
                v.id === payload.new.id ? (payload.new as any) : v
              )
            );
          } else if (payload.eventType === "DELETE") {
            setVirtualTours((prev) =>
              prev.filter((v) => v.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to appointments
    const appointmentsSubscription = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        (payload) => {
          console.log("📅 Appointment change:", payload);
          if (payload.eventType === "INSERT") {
            const newAppointment = payload.new as Appointment;
            setAppointments((prev) => [newAppointment, ...prev]);
            toast({
              title: "New Appointment",
              description: `New appointment from ${newAppointment.full_name}`,
            });
          } else if (payload.eventType === "UPDATE") {
            setAppointments((prev) =>
              prev.map((appointment) =>
                appointment.id === payload.new.id
                  ? (payload.new as Appointment)
                  : appointment
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAppointments((prev) =>
              prev.filter((appointment) => appointment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    console.log("✅ Real-time subscriptions set up");

    // Cleanup subscriptions on component unmount
    return () => {
      console.log("🧹 Cleaning up subscriptions");
      contactsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      projectsSubscription.unsubscribe();
      announcementsSubscription.unsubscribe();
      virtualToursSubscription.unsubscribe();
      appointmentsSubscription.unsubscribe();
    };
  }, [toast]);

  // Check authentication and admin access
  useEffect(() => {
    console.log("🔐 Auth check - Loading:", loading, "User:", user?.email);

    if (!loading) {
      if (!user) {
        console.log("❌ No user found, redirecting to auth");
        navigate("/auth");
        return;
      }

      // Check if user is the authorized admin
      if (user.email !== "hudaengineeringrealestate@gmail.com") {
        console.log("❌ Unauthorized user, redirecting to auth");
        toast({
          title: "Access Denied",
          description: "You are not authorized to access this dashboard.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      console.log(
        "✅ Admin user authenticated, fetching data and setting up subscriptions"
      );
      // If we reach here, user is the authorized admin
      fetchData();
      setupRealtimeSubscriptions();
    }
  }, [user, loading, navigate, fetchData, setupRealtimeSubscriptions, toast]);
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/");
    }
  };

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact status updated",
      });
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (
    id: string,
    status: string,
    rejectionReason?: string
  ) => {
    try {
      // First, get the booking details for email notification
      const { data: booking, error: fetchError } = await supabase
        .from("property_bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Get the property name from the projects table
      const { data: property, error: propertyError } = await supabase
        .from("projects")
        .select("title")
        .eq("id", booking.property_id)
        .single();

      if (propertyError) {
        console.warn("Could not fetch property name:", propertyError);
      }

      const propertyName = property?.title || "Unknown Property";

      // Prepare update data
      const updateData: any = { status };
      if (status === "rejected" && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      // Update the booking status
      const { error } = await supabase
        .from("property_bookings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Send email notification if status is approved or rejected
      if (status === "approved" || status === "rejected") {
        try {
          console.log("📧 Sending email notification...");
          console.log("Booking data:", booking);

          const emailPayload = {
            booking_id: id,
            status,
            recipient_email: booking.email,
            full_name: booking.full_name,
            property_id: booking.property_id,
            property_name: propertyName,
            unit_type: booking.unit_type || "Standard",
            rejection_reason: rejectionReason || "",
          };

          console.log("Email payload:", emailPayload);

          const { data, error: emailError } = await supabase.functions.invoke(
            "send-booking-notification",
            {
              body: emailPayload,
            }
          );

          if (emailError) {
            console.error("❌ Email notification error:", emailError);
            console.error(
              "Error details:",
              JSON.stringify(emailError, null, 2)
            );
            // Don't fail the status update if email fails
            toast({
              title: "Status Updated",
              description: `Booking ${status} successfully, but email notification failed to send. Error: ${
                emailError.message || "Unknown error"
              }`,
              variant: "default",
            });
          } else {
            console.log("✅ Email notification sent successfully!");
            console.log("Response data:", data);
            toast({
              title: "Success",
              description: `Booking ${status} successfully! 📧 Notification email sent to ${booking.email}`,
              duration: 6000,
            });
          }
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          toast({
            title: "Status Updated",
            description: `Booking ${status} successfully, but email notification failed to send.`,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Booking status updated",
        });
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithReason = (bookingId: string) => {
    setPendingRejection(bookingId);
    setIsRejectionDialogOpen(true);
  };

  const confirmRejection = async () => {
    if (!pendingRejection || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    await updateBookingStatus(
      pendingRejection,
      "rejected",
      rejectionReason.trim()
    );

    // Reset dialog state
    setIsRejectionDialogOpen(false);
    setRejectionReason("");
    setPendingRejection(null);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment status updated",
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      setDeletingContact(id);
      console.log("🗑️ Deleting contact with ID:", id);

      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        throw error;
      }

      console.log("✅ Contact deleted from database");

      // Immediately update local state
      setContacts((prev) => prev.filter((contact) => contact.id !== id));

      // Refresh data to ensure consistency
      await fetchData();

      toast({
        title: "Success",
        description: "Contact submission deleted successfully",
      });
    } catch (error) {
      console.error("💥 Error deleting contact:", error);
      toast({
        title: "Error",
        description: `Failed to delete contact submission: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingContact(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      setDeletingBooking(id);
      console.log("🗑️ Deleting booking with ID:", id);

      const { error } = await supabase
        .from("property_bookings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        throw error;
      }

      console.log("✅ Booking deleted from database");

      // Immediately update local state
      setBookings((prev) => prev.filter((booking) => booking.id !== id));

      // Refresh data to ensure consistency
      await fetchData();

      toast({
        title: "Success",
        description: "Property booking deleted successfully",
      });
    } catch (error) {
      console.error("💥 Error deleting booking:", error);
      toast({
        title: "Error",
        description: `Failed to delete property booking: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingBooking(null);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      setDeletingAppointment(id);
      console.log("🗑️ Deleting appointment with ID:", id);

      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        throw error;
      }

      console.log("✅ Appointment deleted from database");

      // Immediately update local state
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== id)
      );

      // Refresh data to ensure consistency
      await fetchData();

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error("💥 Error deleting appointment:", error);
      toast({
        title: "Error",
        description: `Failed to delete appointment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingAppointment(null);
    }
  };

  const handleAddProject = async () => {
    try {
      // Validate floor plans before saving
      if (floorPlans.length === 0) {
        toast({
          title: "Validation Error",
          description:
            "Please add at least one floor plan before saving the project",
          variant: "destructive",
        });
        return;
      }

      // Check if each floor has at least one apartment type
      const invalidFloors = floorPlans.filter(
        (floor) => floor.apartment_types.length === 0
      );
      if (invalidFloors.length > 0) {
        toast({
          title: "Validation Error",
          description: `Floor ${invalidFloors[0].floor_number} has no apartment types. Please add at least one apartment type to each floor.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("projects").insert([
        {
          ...newProject,
          floor_plans: floorPlans,
          Amenities: newProject.Amenities,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      setFloorPlans([]);
      setCurrentFloorNumber(1);
      setIsAddProjectOpen(false);

      toast({
        title: "Success",
        description: "Project added successfully",
      });

      // Refresh data after successful operation
      fetchData();
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      // Refresh data after successful operation
      fetchData();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // When edit is clicked
  const handleEditClick = (project: any) => {
    setEditingProjectId(project.id);
    setNewProject({
      title: project.title,
      location: project.location,
      project_type: project.project_type,
      short_description: project.short_description,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      image_url: project.image_url,
      floor_url: project.floor_url || "",
      gallery_urls: project.gallery_urls || [],
      status: project.status,
      Amenities: project.Amenities || [],
      floor_plans: project.floor_plans || [],
    });
    setFloorPlans(project.floor_plans || []);
    setCurrentFloorNumber((project.floor_plans?.length || 0) + 1);
    setIsAddProjectOpen(true);
  };

  // Save changes
  const handleSaveProject = async () => {
    try {
      // Validate floor plans before saving
      if (floorPlans.length === 0) {
        toast({
          title: "Validation Error",
          description:
            "Please add at least one floor plan before saving the project",
          variant: "destructive",
        });
        return;
      }

      // Check if each floor has at least one apartment type
      const invalidFloors = floorPlans.filter(
        (floor) => floor.apartment_types.length === 0
      );
      if (invalidFloors.length > 0) {
        toast({
          title: "Validation Error",
          description: `Floor ${
            invalidFloors.length > 1 ? "s" : ""
          } ${invalidFloors
            .map((f) => f.floor_number)
            .join(
              ", "
            )} have no apartment types. Please add at least one apartment type to each floor.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update({
          ...newProject,
          floor_plans: floorPlans,
        })
        .eq("id", editingProjectId);

      if (!error) {
        toast({ title: "Project Updated", description: "Changes saved." });
        setIsAddProjectOpen(false);
        setEditingProjectId(null);

        // Refresh data after successful operation
        fetchData();
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnouncement = async () => {
    try {
      const { error } = await supabase.from("announcements").insert([
        {
          ...newAnnouncement,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      // setNewAnnouncement({
      //   title: "",
      //   content: "",
      //   short_description: "",
      //   category: "general",
      //   image_url: "",
      //   is_published: false,
      // });
      setIsAddAnnouncementOpen(false);

      toast({
        title: "Success",
        description: "Announcement added successfully",
      });
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Error",
        description: "Failed to add announcement",
        variant: "destructive",
      });
    }
  };
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(
    null
  );
  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      ...announcement,
      scheduled_for: announcement.scheduled_for || "",
    });
    setIsAddAnnouncementOpen(true);
  };

  // save changes
  const handleSaveAnnouncement = async () => {
    const data = {
      ...newAnnouncement,
      scheduled_for: newAnnouncement.scheduled_for
        ? new Date(newAnnouncement.scheduled_for).toISOString()
        : null,
    };

    if (editingAnnouncement) {
      const { error } = await supabase
        .from("announcements")
        .update(data)
        .eq("id", editingAnnouncement.id);
      if (!error)
        toast({ title: "Updated", description: "Announcement updated" });
    } else {
      const { error } = await supabase.from("announcements").insert([data]);
      if (!error) toast({ title: "Added", description: "Announcement added" });
    }
    setIsAddAnnouncementOpen(false);
    setEditingAnnouncement(null);
  };
  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setNewAnnouncement({
      title: "",
      short_description: "",
      content: "",
      category: "",
      image_url: "",
      is_published: false,
      scheduled_for: "",
    });
    setIsAddAnnouncementOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const toggleAnnouncementPublish = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Announcement ${
          !currentStatus ? "published" : "unpublished"
        } successfully`,
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };
  const handleAddUpdate = async () => {
    setIsAddingUpdate(true);

    try {
      let update_type = "text";
      if (update.media_url) {
        update_type = update.media_url.includes("video") ? "video" : "image";
      }

      const payload: any = {
        project_id: update.project_id,
        description: update.description,
        media_url: update.media_url || null,
        update_type,
        percentage: update.percentage
          ? parseInt(update.percentage as any, 10)
          : null,
      };

      if (editingUpdateId) {
        // Update existing update
        const { error: updateError } = await supabase
          .from("project_updates")
          .update(payload)
          .eq("id", editingUpdateId);

        if (updateError) {
          console.error("Update Error:", updateError);
          toast({
            title: "Error",
            description: `Failed to update progress: ${updateError.message}`,
            variant: "destructive",
          });
        } else {
          toast({ title: "Updated", description: "Progress update saved." });
          setIsAddUpdateOpen(false);
          setUpdate({
            project_id: "",
            description: "",
            media_url: "",
            percentage: "",
          });
          setEditingUpdateId(null);
          // Refresh list
          // reuse the fetch from the earlier useEffect by calling it here:
          const { data } = await supabase
            .from("project_updates")
            .select("*, projects(title)")
            .order("created_at", { ascending: false });
          const formatted = (data || []).map((u: any) => ({
            ...u,
            project_title: u.projects?.title || "Untitled",
          }));
          setUpdates(formatted);
        }
      } else {
        // Insert new update
        const { error: insertError } = await supabase
          .from("project_updates")
          .insert([payload]);

        if (insertError) {
          console.error("Insert Error:", insertError);
          toast({
            title: "Error",
            description: `Failed to add update: ${insertError.message}`,
            variant: "destructive",
          });
        } else {
          toast({ title: "Added", description: "Update added!" });
          setIsAddUpdateOpen(false);
          setUpdate({
            project_id: "",
            description: "",
            media_url: "",
            percentage: "",
          });

          // Refresh list
          const { data } = await supabase
            .from("project_updates")
            .select("*, projects(title)")
            .order("created_at", { ascending: false });
          const formatted = (data || []).map((u: any) => ({
            ...u,
            project_title: u.projects?.title || "Untitled",
          }));
          setUpdates(formatted);
        }
      }
    } catch (err) {
      console.error("HandleAddUpdate error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the update.",
        variant: "destructive",
      });
    } finally {
      setIsAddingUpdate(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title")
        .eq("status", "active");
      setOngoingProjects(data || []);
    };

    const fetchProjectUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from("project_updates")
          .select("*, projects(title)")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching project updates:", error);
          return;
        }

        const formatted = (data || []).map((u: any) => ({
          ...u,
          project_title: u.projects?.title || "Untitled",
        }));

        setUpdates(formatted);
      } catch (err) {
        console.error("Fetch project updates failed:", err);
      }
    };

    fetchProjects();
    fetchProjectUpdates();

    // expose the updates fetch so other handlers can call it
    // (we're not returning it — handlers below will call fetchProjectUpdates directly by re-declaring/duplicating if needed;
    // if you prefer, pull fetchProjectUpdates to component scope)
  }, []);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return;

    const { error } = await supabase
      .from("project_updates")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Delete failed");
      console.error(error);
    } else {
      alert("Deleted!");
      // Refresh updates list
      const { data } = await supabase
        .from("project_updates")
        .select("*, projects(title)")
        .order("created_at", { ascending: false });
      const formatted = (data || []).map((u: any) => ({
        ...u,
        project_title: u.projects?.title || "Untitled",
      }));
      setUpdates(formatted);
    }
  };

  const handleEdit = (updateItem: any) => {
    setEditingUpdateId(updateItem.id);
    setUpdate({
      project_id: updateItem.project_id,
      description: updateItem.description,
      media_url: updateItem.media_url || "",
      percentage: updateItem.percentage ? String(updateItem.percentage) : "",
    });
    setIsAddUpdateOpen(true);
  };

  const addAmenities = () => {
    if (AmenitiesInput.trim()) {
      setNewProject((prev) => ({
        ...prev,
        Amenities: [...prev.Amenities, AmenitiesInput.trim()],
      }));
      setAmenitiesInput("");
    }
  };

  const removeAmenities = (index: number) => {
    setNewProject((prev) => ({
      ...prev,
      Amenities: prev.Amenities.filter((_, i) => i !== index),
    }));
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-3 sm:py-4 gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, Administrator
              </p>
              <p className="text-xs text-muted-foreground">
                Secure admin portal - {user?.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={fetchData}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("🧪 Manual test - Current state:");
                  console.log("User:", user);
                  console.log("Profile:", profile);
                  console.log("Loading:", loading);
                  console.log("Data Loading:", dataLoading);
                  console.log("Contacts:", contacts);
                  console.log("Bookings:", bookings);
                  console.log("Projects:", projects);
                  console.log("Announcements:", announcements);
                  console.log("Appointments:", appointments);
                }}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <span>Debug</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("contacts")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Contact Forms
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {contacts.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {contacts.filter((c) => c.status === "pending").length}{" "}
                  pending
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("bookings")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Property Bookings
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {bookings.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {bookings.filter((b) => b.status === "pending").length}{" "}
                  pending
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("projects")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Building className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Projects
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {projects.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {projects.filter((p) => p.status === "active").length} active
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("announcements")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Announcements
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {announcements.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {announcements.filter((a) => a.is_published).length} published
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("appointments")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Appointments
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {appointments.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {appointments.filter((a) => a.status === "pending").length}{" "}
                  pending
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("testimonials")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Play className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-indigo-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Testimonials
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {testimonials.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Manage video testimonials
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab("virtual-tours")}
          >
            <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
              <Play className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Virtual Tours
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  {virtualTours.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Manage virtual tour videos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsContent value="contacts" className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">
                Contact Submissions
              </h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {contacts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No contact submissions yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  contacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg truncate">
                              {contact.name}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="truncate">
                                  {contact.email}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{contact.phone}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              contact.status === "pending"
                                ? "destructive"
                                : contact.status === "contacted"
                                ? "default"
                                : "secondary"
                            }
                            className="self-start"
                          >
                            {contact.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>Project Type:</strong>{" "}
                              {contact.project_type}
                            </div>
                            <div>
                              <strong>Budget:</strong> {contact.budget}
                            </div>
                          </div>
                          <p className="text-sm sm:text-base">
                            {contact.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted:{" "}
                            {new Date(contact.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateContactStatus(contact.id, "contacted")
                              }
                              disabled={contact.status === "contacted"}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">
                                {contact.status === "contacted"
                                  ? "Already Contacted"
                                  : "Mark as Contacted"}
                              </span>
                              <span className="sm:hidden">
                                {contact.status === "contacted"
                                  ? "Contacted"
                                  : "Contact"}
                              </span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteContact(contact.id)}
                              disabled={deletingContact === contact.id}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              {deletingContact === contact.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              )}
                              {deletingContact === contact.id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">
                Property Bookings
              </h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No property bookings yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg truncate">
                              {booking.full_name}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="truncate">
                                  {booking.email}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{booking.phone}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              booking.status === "pending"
                                ? "destructive"
                                : booking.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                            className="self-start"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>Property:</strong>{" "}
                              {booking.property_name || "Unknown Property"}
                            </div>
                            <div>
                              <strong>Unit Type:</strong>{" "}
                              {booking.unit_type || "—"}
                            </div>
                            {typeof booking.floor_number === "number" && (
                              <div>
                                <strong>Floor:</strong> {booking.floor_number}
                              </div>
                            )}
                            <div>
                              <strong>Preferred Contact:</strong>{" "}
                              {booking.preferred_contact || "—"}
                            </div>
                            {booking.secondary_phone && (
                              <div>
                                <strong>Secondary Phone:</strong>{" "}
                                {booking.secondary_phone}
                              </div>
                            )}
                            <div>
                              <strong>National ID:</strong>{" "}
                              {booking.national_id}
                            </div>
                          </div>
                          {booking.notes && (
                            <p className="text-sm sm:text-base">
                              {booking.notes}
                            </p>
                          )}
                          {booking.rejection_reason && (
                            <div className="text-sm">
                              <div className="font-semibold text-red-600 mb-1">
                                Rejection Reason:
                              </div>
                              <div className="bg-red-50 border-l-4 border-red-400 p-3 text-red-700">
                                {booking.rejection_reason}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Submitted:{" "}
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                setUpdatingBookingId(booking.id);
                                try {
                                  await updateBookingStatus(
                                    booking.id,
                                    "approved"
                                  );
                                } finally {
                                  setUpdatingBookingId(null);
                                }
                              }}
                              disabled={
                                booking.status !== "pending" ||
                                updatingBookingId === booking.id
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              {updatingBookingId === booking.id ? (
                                <>
                                  <span className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></span>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectWithReason(booking.id)}
                              disabled={
                                booking.status !== "pending" ||
                                updatingBookingId === booking.id
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBooking === booking.id}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              {deletingBooking === booking.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              )}
                              {deletingBooking === booking.id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">Appointments</h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {appointments.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No appointments yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg truncate">
                              {appointment.full_name}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="truncate">
                                  {appointment.email}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>{appointment.phone}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              appointment.status === "pending"
                                ? "destructive"
                                : appointment.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                            className="self-start"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>Appointment Date:</strong>{" "}
                              {new Date(
                                appointment.appointment_date
                              ).toLocaleString()}
                            </div>
                            <div>
                              <strong>Preferred Contact:</strong>{" "}
                              {appointment.preferred_contact}
                            </div>
                            {appointment.secondary_phone && (
                              <div>
                                <strong>Secondary Phone:</strong>{" "}
                                {appointment.secondary_phone}
                              </div>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm sm:text-base">
                              {appointment.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Submitted:{" "}
                            {new Date(
                              appointment.created_at
                            ).toLocaleDateString()}
                          </p>
                          <div className="flex sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "confirmed"
                                )
                              }
                              disabled={appointment.status !== "pending"}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "completed"
                                )
                              }
                              disabled={appointment.status !== "confirmed"}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "cancelled"
                                )
                              }
                              disabled={
                                appointment.status === "cancelled" ||
                                appointment.status === "completed"
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteAppointment(appointment.id)
                              }
                              disabled={deletingAppointment === appointment.id}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              {deletingAppointment === appointment.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></div>
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">Testimonials</h2>
              <Dialog
                open={isAddTestimonialOpen}
                onOpenChange={setIsAddTestimonialOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingTestimonialId(null);
                      setNewTestimonial({
                        name: "",
                        project: "",
                        content: "",
                        rating: 5,
                        video_url: "",
                      });
                    }}
                  >
                    Add Testimonial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTestimonialId
                        ? "Edit Testimonial"
                        : "Add Testimonial"}
                    </DialogTitle>
                    <DialogDescription>
                      Manage client testimonial videos here. These will appear
                      on the homepage.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newTestimonial.name}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Project</Label>
                      <Input
                        value={newTestimonial.project}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            project: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        rows={3}
                        value={newTestimonial.content}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            content: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Rating (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={newTestimonial.rating}
                        onChange={(e) =>
                          setNewTestimonial({
                            ...newTestimonial,
                            rating: Math.max(
                              1,
                              Math.min(5, Number(e.target.value) || 0)
                            ),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Video (YouTube or MP4)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newTestimonial.video_url}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              video_url: e.target.value,
                            })
                          }
                          placeholder="Paste link or upload MP4"
                        />
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadFileToBucket(
                              "testimonial-videos",
                              file
                            );
                            if (url)
                              setNewTestimonial((p) => ({
                                ...p,
                                video_url: url,
                              }));
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!newTestimonial.name || !newTestimonial.content) {
                          toast({
                            title: "Missing fields",
                            description: "Name and content are required",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (editingTestimonialId) {
                          const { error } = await supabase
                            .from("testimonials")
                            .update(newTestimonial)
                            .eq("id", editingTestimonialId);
                          if (error)
                            return toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            });
                        } else {
                          const { error } = await supabase
                            .from("testimonials")
                            .insert([newTestimonial]);
                          if (error)
                            return toast({
                              title: "Error",
                              description: error.message,
                              variant: "destructive",
                            });
                        }
                        setIsAddTestimonialOpen(false);
                        setEditingTestimonialId(null);
                        fetchData();
                      }}
                      className="w-full"
                      disabled={assetUploading}
                    >
                      {editingTestimonialId
                        ? "Save Changes"
                        : "Add Testimonial"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {testimonials.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No testimonials yet
                  </CardContent>
                </Card>
              ) : (
                testimonials.map((t) => (
                  <Card key={t.id} className="hover:shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {t.project}
                          </CardDescription>
                        </div>
                        <Badge>{t.rating}/5</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t.content}
                      </p>
                      {t.video_url &&
                        (String(t.video_url).includes("youtube.com") ||
                        String(t.video_url).includes("youtu.be") ? (
                          <div className="w-full aspect-video">
                            <iframe
                              src={t.video_url}
                              className="w-full h-full rounded"
                              allowFullScreen
                              title={`Testimonial of ${t.name}`}
                            ></iframe>
                          </div>
                        ) : (
                          <video
                            src={t.video_url}
                            controls
                            className="w-full rounded"
                          />
                        ))}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTestimonialId(t.id);
                            setNewTestimonial({
                              name: t.name,
                              project: t.project,
                              content: t.content,
                              rating: t.rating,
                              video_url: t.video_url || "",
                            });
                            setIsAddTestimonialOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("testimonials")
                              .delete()
                              .eq("id", t.id);
                            if (error)
                              return toast({
                                title: "Error",
                                description: error.message,
                                variant: "destructive",
                              });
                            fetchData();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Projects</h2>
              <Dialog
                open={isAddProjectOpen}
                onOpenChange={setIsAddProjectOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setEditingProjectId(null); // <-- ensure we are adding, not editing
                      setNewProject({
                        title: "",
                        location: "",
                        project_type: "",
                        short_description: "",
                        description: "",
                        start_date: "",
                        end_date: "",
                        image_url: "",
                        floor_url: "",
                        gallery_urls: [],
                        status: "active",
                        Amenities: [],
                        floor_plans: [],
                      });
                      setFloorPlans([]); // reset floor plans
                      setCurrentFloorNumber(1); // reset floor number
                      setAmenityInput(""); // clear input field
                    }}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Add Project</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUpdateId ? "Edit Update" : "Add Project Update"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProjectId
                        ? "Update the project details"
                        : "Create a new project in your portfolio"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newProject.location}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="project_type">Project Type</Label>
                        <Input
                          id="project_type"
                          value={newProject.project_type}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              project_type: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newProject.start_date}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newProject.end_date}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="short_description">
                        Short Description
                      </Label>
                      <Input
                        id="short_description"
                        value={newProject.short_description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            short_description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        placeholder="Enter project details with line breaks as needed..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="image_url">Project Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image_url"
                          placeholder="Or paste URL"
                          value={newProject.image_url}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              image_url: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadFileToBucket(
                              "project-images",
                              file
                            );
                            if (url)
                              setNewProject((p) => ({ ...p, image_url: url }));
                          }}
                        />
                      </div>
                    </div>
                    {/* 
                    <div>
                      <Label>Gallery Images</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Paste image URL and press Add (optional)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (!value) return;
                              setNewProject((prev) => ({
                                ...prev,
                                gallery_urls: [...(prev.gallery_urls || []), value],
                              }));
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement)!
                            const value = input.value.trim();
                            if (!value) return;
                            setNewProject((prev) => ({
                              ...prev,
                              gallery_urls: [...(prev.gallery_urls || []), value],
                            }));
                            input.value = "";
                          }}
                        >
                          Add
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            const uploaded: string[] = [];
                            for (const f of files) {
                              const url = await uploadFileToBucket("project-images", f);
                              if (url) uploaded.push(url);
                            }
                            if (uploaded.length > 0) {
                              setNewProject((prev) => ({
                                ...prev,
                                gallery_urls: [...(prev.gallery_urls || []), ...uploaded],
                              }));
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </div>
                      {(newProject.gallery_urls || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(newProject.gallery_urls || []).map((url, idx) => (
                            <div key={idx} className="relative">
                              <img src={url} alt={`gallery-${idx}`} className="h-16 w-24 object-cover rounded" />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() =>
                                  setNewProject((prev) => ({
                                    ...prev,
                                    gallery_urls: (prev.gallery_urls || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                title="Remove"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div> */}

                    {/* Floor Plan Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-lg font-semibold">
                            Floor Plans
                          </Label>
                          {floorPlans.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {floorPlans.length} floor
                              {floorPlans.length !== 1 ? "s" : ""} •{" "}
                              {floorPlans.reduce(
                                (total, floor) =>
                                  total + floor.apartment_types.length,
                                0
                              )}{" "}
                              apartment type
                              {floorPlans.reduce(
                                (total, floor) =>
                                  total + floor.apartment_types.length,
                                0
                              ) !== 1
                                ? "s"
                                : ""}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={duplicateFloorPlan}
                            disabled={floorPlans.length === 0}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate Floor Plan
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFloorPlan}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Floor Plan
                          </Button>
                        </div>
                      </div>

                      {floorPlans.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>No floor plans added yet</p>
                          <p className="text-sm">
                            Click "Add Floor Plan" to get started
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {floorPlans.map((floor, floorIndex) => (
                            <div
                              key={floor.id}
                              className="border rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-lg">
                                  Floor {floor.floor_number}
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addApartmentType(floor.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Apartment Type
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeFloorPlan(floor.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="mb-3">
                                <Label className="text-xs font-medium">
                                  Floor URL
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={floor.floor_url || ""}
                                    onChange={(e) =>
                                      updateFloorPlan(
                                        floor.id,
                                        "floor_url",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Or paste image URL"
                                    className="text-sm"
                                  />
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="text-sm"
                                    onChange={async (e) => {
                                      console.log(
                                        "Floor plan file selected:",
                                        e.target.files?.[0]
                                      );
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      console.log(
                                        "Uploading floor plan image..."
                                      );
                                      const url = await uploadFileToBucket(
                                        "project-images",
                                        file
                                      );
                                      console.log("Upload result URL:", url);
                                      if (url) {
                                        console.log(
                                          "Updating floor plan with URL:",
                                          url
                                        );
                                        updateFloorPlan(
                                          floor.id,
                                          "floor_url",
                                          url
                                        );
                                        console.log("Floor plan updated");
                                      } else {
                                        console.log(
                                          "Upload failed, no URL returned"
                                        );
                                      }
                                      // Reset the input value to allow re-uploading the same file
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </div>
                                {floor.floor_url && (
                                  <img
                                    src={floor.floor_url}
                                    alt="floor"
                                    className="mt-2 h-20 w-full object-cover rounded"
                                  />
                                )}
                              </div>

                              {floor.apartment_types.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                  <p>No apartment types added yet</p>
                                  <p className="text-sm">
                                    Click "Add Apartment Type" to add units
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {floor.apartment_types.map(
                                    (apartment, aptIndex) => (
                                      <div
                                        key={apartment.id}
                                        className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-3 bg-white rounded border"
                                      >
                                        <div>
                                          <Label className="text-xs font-medium">
                                            Type
                                          </Label>
                                          <Input
                                            value={apartment.type}
                                            onChange={(e) =>
                                              updateApartmentType(
                                                floor.id,
                                                apartment.id,
                                                "type",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., 2B"
                                            className="text-sm"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">
                                            Size
                                          </Label>
                                          <Input
                                            value={apartment.size}
                                            onChange={(e) =>
                                              updateApartmentType(
                                                floor.id,
                                                apartment.id,
                                                "size",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., 120 m²"
                                            className="text-sm"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">
                                            Availability
                                          </Label>
                                          <Select
                                            value={apartment.availability}
                                            onValueChange={(value) =>
                                              updateApartmentType(
                                                floor.id,
                                                apartment.id,
                                                "availability",
                                                value
                                              )
                                            }
                                          >
                                            <SelectTrigger className="text-sm">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="available">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                  Available
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="sold">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                  Sold
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="reserved">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                  Reserved
                                                </div>
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">
                                            Price (Optional)
                                          </Label>
                                          <Input
                                            value={apartment.price || ""}
                                            onChange={(e) =>
                                              updateApartmentType(
                                                floor.id,
                                                apartment.id,
                                                "price",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., 8.5M ETB"
                                            className="text-sm"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">
                                            Apartment Image
                                          </Label>
                                          <div className="flex gap-2">
                                            <Input
                                              value={apartment.image_url || ""}
                                              onChange={(e) =>
                                                updateApartmentType(
                                                  floor.id,
                                                  apartment.id,
                                                  "image_url",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Or paste image URL"
                                              className="text-sm"
                                            />
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              className="text-sm"
                                              onChange={async (e) => {
                                                const file =
                                                  e.target.files?.[0];
                                                if (!file) return;
                                                const url =
                                                  await uploadFileToBucket(
                                                    "apartment-images",
                                                    file
                                                  );
                                                if (url) {
                                                  updateApartmentType(
                                                    floor.id,
                                                    apartment.id,
                                                    "image_url",
                                                    url
                                                  );
                                                }
                                              }}
                                            />
                                          </div>
                                          {apartment.image_url && (
                                            <img
                                              src={apartment.image_url}
                                              alt="apartment"
                                              className="mt-2 h-20 w-full object-cover rounded"
                                            />
                                          )}
                                        </div>
                                        <div className="col-span-2 lg:col-span-6">
                                          <Label className="text-xs font-medium">
                                            Gallery Images
                                          </Label>
                                          <div className="flex gap-2 mb-2">
                                            <Input
                                              placeholder="Paste image URL and press Add (optional)"
                                              className="text-sm"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  const value = (
                                                    e.target as HTMLInputElement
                                                  ).value.trim();
                                                  if (!value) return;
                                                  const next = [
                                                    ...((apartment.gallery_urls as
                                                      | string[]
                                                      | undefined) || []),
                                                    value,
                                                  ];
                                                  updateApartmentType(
                                                    floor.id,
                                                    apartment.id,
                                                    "gallery_urls",
                                                    next
                                                  );
                                                  (
                                                    e.target as HTMLInputElement
                                                  ).value = "";
                                                }
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              size="sm"
                                              onClick={(e) => {
                                                const input =
                                                  (e.currentTarget.parentElement?.querySelector(
                                                    "input"
                                                  ) as HTMLInputElement)!;
                                                const value =
                                                  input.value.trim();
                                                if (!value) return;
                                                const next = [
                                                  ...((apartment.gallery_urls as
                                                    | string[]
                                                    | undefined) || []),
                                                  value,
                                                ];
                                                updateApartmentType(
                                                  floor.id,
                                                  apartment.id,
                                                  "gallery_urls",
                                                  next
                                                );
                                                input.value = "";
                                              }}
                                            >
                                              Add
                                            </Button>
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              multiple
                                              className="text-sm"
                                              onChange={async (e) => {
                                                const files = Array.from(
                                                  e.target.files || []
                                                );
                                                if (files.length === 0) return;
                                                const uploaded: string[] = [];
                                                for (const f of files) {
                                                  const url =
                                                    await uploadFileToBucket(
                                                      "apartment-images",
                                                      f
                                                    );
                                                  if (url) uploaded.push(url);
                                                }
                                                const next = [
                                                  ...((apartment.gallery_urls as
                                                    | string[]
                                                    | undefined) || []),
                                                  ...uploaded,
                                                ];
                                                updateApartmentType(
                                                  floor.id,
                                                  apartment.id,
                                                  "gallery_urls",
                                                  next
                                                );
                                                e.currentTarget.value = "";
                                              }}
                                            />
                                          </div>
                                          {apartment.gallery_urls &&
                                            apartment.gallery_urls.length >
                                              0 && (
                                              <div className="flex flex-wrap gap-2">
                                                {(
                                                  apartment.gallery_urls || []
                                                ).map((url, gidx) => (
                                                  <div
                                                    key={gidx}
                                                    className="relative"
                                                  >
                                                    <img
                                                      src={url}
                                                      alt={`g-${gidx}`}
                                                      className="h-16 w-24 object-cover rounded"
                                                    />
                                                    <Button
                                                      type="button"
                                                      size="icon"
                                                      variant="destructive"
                                                      className="absolute -top-2 -right-2 h-6 w-6"
                                                      onClick={() => {
                                                        const next = (
                                                          apartment.gallery_urls ||
                                                          []
                                                        ).filter(
                                                          (_, i) => i !== gidx
                                                        );
                                                        updateApartmentType(
                                                          floor.id,
                                                          apartment.id,
                                                          "gallery_urls",
                                                          next
                                                        );
                                                      }}
                                                      title="Remove"
                                                    >
                                                      ×
                                                    </Button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 lg:col-span-6">
                                          <Label className="text-xs font-medium">
                                            Description
                                          </Label>
                                          <Textarea
                                            value={apartment.description || ""}
                                            onChange={(e) =>
                                              updateApartmentType(
                                                floor.id,
                                                apartment.id,
                                                "description",
                                                e.target.value
                                              )
                                            }
                                            rows={3}
                                            className="text-sm"
                                            placeholder="Layout, features, pricing details..."
                                          />
                                        </div>
                                        <div className="col-span-2 lg:col-span-6">
                                          <Label className="text-xs font-medium">
                                            Features
                                          </Label>
                                          <div className="flex flex-wrap gap-2 mb-2">
                                            {(apartment.features || []).map(
                                              (feat, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="cursor-pointer"
                                                  onClick={() => {
                                                    const next = (
                                                      apartment.features || []
                                                    ).filter(
                                                      (_, i) => i !== idx
                                                    );
                                                    updateApartmentType(
                                                      floor.id,
                                                      apartment.id,
                                                      "features",
                                                      next
                                                    );
                                                  }}
                                                >
                                                  {feat} ×
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Input
                                              placeholder="Add a feature and press Add"
                                              className="text-sm"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  const val = (
                                                    e.target as HTMLInputElement
                                                  ).value.trim();
                                                  if (!val) return;
                                                  const next = [
                                                    ...(apartment.features ||
                                                      []),
                                                    val,
                                                  ];
                                                  updateApartmentType(
                                                    floor.id,
                                                    apartment.id,
                                                    "features",
                                                    next
                                                  );
                                                  (
                                                    e.target as HTMLInputElement
                                                  ).value = "";
                                                }
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              size="sm"
                                              onClick={(e) => {
                                                const input =
                                                  e.currentTarget.parentElement?.querySelector(
                                                    "input"
                                                  ) as HTMLInputElement;
                                                if (!input) return;
                                                const val = input.value.trim();
                                                if (!val) return;
                                                const next = [
                                                  ...(apartment.features || []),
                                                  val,
                                                ];
                                                updateApartmentType(
                                                  floor.id,
                                                  apartment.id,
                                                  "features",
                                                  next
                                                );
                                                input.value = "";
                                              }}
                                            >
                                              Add
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                removeApartmentType(
                                                  floor.id,
                                                  apartment.id
                                                )
                                              }
                                              title="Remove apartment type"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    <div>
                      <Label>Amenities</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={AmenityInput}
                          onChange={(e) => setAmenityInput(e.target.value)}
                          placeholder="Enter an Amenity"
                          onKeyPress={(e) => e.key === "Enter" && addAmenity()}
                        />
                        <Button type="button" onClick={addAmenity}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newProject.Amenities.map((Amenity, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAmenity(index)}
                          >
                            {Amenity} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value) =>
                          setNewProject({ ...newProject, status: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="previous">Previous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={
                        editingProjectId ? handleSaveProject : handleAddProject
                      }
                      className="w-full"
                    >
                      {editingProjectId ? "Save Changes" : "Add Project"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {projects.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No projects yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20"
                    >
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg line-clamp-2 mb-2">
                              {project.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{project.location}</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              project.status === "active"
                                ? "default"
                                : project.status === "completed"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      {(project.gallery_urls &&
                        project.gallery_urls.length > 0) ||
                      project.image_url ? (
                        <div className="px-6 pb-4">
                          <div className="flex gap-2 overflow-x-auto">
                            <img
                              src={
                                project.gallery_urls &&
                                project.gallery_urls.length > 0
                                  ? project.gallery_urls[0]
                                  : project.image_url
                              }
                              alt={project.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {project.gallery_urls &&
                              project.gallery_urls
                                .slice(1)
                                .map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`${project.title}-${idx + 2}`}
                                    className="h-32 w-48 object-cover rounded-lg"
                                  />
                                ))}
                          </div>
                        </div>
                      ) : null}
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3 text-primary" />
                                <span className="text-muted-foreground">
                                  Type:
                                </span>
                                <span className="font-medium">
                                  {project.project_type}
                                </span>
                              </div>
                              {project.start_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-primary" />
                                  <span className="text-muted-foreground">
                                    Started:
                                  </span>
                                  <span className="font-medium">
                                    {new Date(
                                      project.start_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {project.end_date && (
                                <div className="flex items-center gap-2">
                                  <Target className="w-3 h-3 text-primary" />
                                  <span className="text-muted-foreground">
                                    Target:
                                  </span>
                                  <span className="font-medium">
                                    {new Date(
                                      project.end_date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {project.floor_plans &&
                            project.floor_plans.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <Building2 className="w-3 h-3 text-primary" />
                                  <span className="text-muted-foreground font-medium">
                                    Floor Plans:
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {project.floor_plans
                                    .slice(0, 2)
                                    .map((floor, floorIndex) => (
                                      <div
                                        key={floor.id}
                                        className="bg-secondary/50 p-2 rounded-md text-xs"
                                      >
                                        <div className="font-medium mb-1 flex items-center justify-between">
                                          <span>
                                            Floor {floor.floor_number}
                                          </span>
                                          <span className="text-muted-foreground text-xs">
                                            {floor.apartment_types.length} unit
                                            {floor.apartment_types.length !== 1
                                              ? "s"
                                              : ""}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {floor.apartment_types
                                            .slice(0, 2)
                                            .map((apt, aptIndex) => (
                                              <div
                                                key={apt.id}
                                                className="flex items-center justify-between text-xs"
                                              >
                                                <span className="font-medium">
                                                  {apt.type}
                                                </span>
                                                <span className="text-muted-foreground">
                                                  {apt.size}
                                                </span>
                                                <Badge
                                                  variant={
                                                    apt.availability ===
                                                    "available"
                                                      ? "default"
                                                      : apt.availability ===
                                                        "sold"
                                                      ? "destructive"
                                                      : "secondary"
                                                  }
                                                  className="text-xs px-1 py-0 h-4"
                                                >
                                                  {apt.availability}
                                                </Badge>
                                              </div>
                                            ))}
                                          {floor.apartment_types.length > 2 && (
                                            <div className="text-center text-xs text-muted-foreground pt-1 border-t border-gray-200">
                                              +
                                              {floor.apartment_types.length - 2}{" "}
                                              more units
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  {project.floor_plans.length > 2 && (
                                    <div className="text-center text-xs text-muted-foreground">
                                      +{project.floor_plans.length - 2} more
                                      floors
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {project.Amenities &&
                            project.Amenities.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <CheckCircle className="w-3 h-3 text-primary" />
                                  <span className="text-muted-foreground font-medium">
                                    Amenities:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {project.Amenities.slice(0, 3).map(
                                    (amenity, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {amenity}
                                      </Badge>
                                    )
                                  )}
                                  {project.Amenities.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{project.Amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                          <p className="text-xs sm:text-sm line-clamp-2 text-muted-foreground bg-secondary/30 p-3 rounded-md">
                            {project.short_description}
                          </p>

                          <div className="flex sm:flex-row gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(project)}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProject(project.id)}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
            <Tabs value="progress-updates" className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Progress Updates
                </h2>

                <Dialog
                  open={isAddUpdateOpen}
                  onOpenChange={setIsAddUpdateOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setIsAddUpdateOpen(true)}>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="text-xs sm:text-sm">Add Update</span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      {/* <DialogTitle>{update.id ? "Edit Update" : "Add Project Update"}</DialogTitle> */}
                      <DialogDescription>
                        Attach a photo/video or description
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="update_project">Project</Label>
                        <select
                          id="update_project"
                          className="w-full border rounded p-2"
                          value={update.project_id}
                          onChange={(e) =>
                            setUpdate({ ...update, project_id: e.target.value })
                          }
                        >
                          <option value="">-- Select Project --</option>
                          {ongoingProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={update.description}
                          onChange={(e) =>
                            setUpdate({
                              ...update,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Media URL</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Or paste image/video URL"
                              value={update.media_url}
                              onChange={(e) =>
                                setUpdate({
                                  ...update,
                                  media_url: e.target.value,
                                })
                              }
                            />
                            <Input
                              type="file"
                              accept="image/*,video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const isVideo = file.type.startsWith("video/");
                                const bucket = isVideo
                                  ? "project-update-videos"
                                  : "project-update-images";
                                const url = await uploadFileToBucket(
                                  bucket,
                                  file
                                );
                                if (url)
                                  setUpdate((prev) => ({
                                    ...prev,
                                    media_url: url,
                                  }));
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Progress Percentage</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={update.percentage}
                            onChange={(e) =>
                              setUpdate({
                                ...update,
                                percentage: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleAddUpdate}
                        disabled={isAddingUpdate || assetUploading}
                        className="w-full"
                      >
                        {isAddingUpdate || assetUploading
                          ? editingUpdateId
                            ? "Saving..."
                            : "Submitting..."
                          : editingUpdateId
                          ? "Save Changes"
                          : "Submit Update"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="progress-updates" className="space-y-4">
                {updates.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      No updates yet
                    </CardContent>
                  </Card>
                ) : (
                  updates.map((update) => (
                    <Card key={update.id}>
                      <CardHeader>
                        <CardTitle>{update.project_title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {update.media_url && update.update_type === "image" && (
                          <img
                            src={update.media_url}
                            className="rounded"
                            alt="Update image"
                          />
                        )}
                        {update.media_url && update.update_type === "video" && (
                          <video
                            src={update.media_url}
                            controls
                            className="w-full rounded"
                          />
                        )}
                        <p>{update.description}</p>
                        {update.percentage && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Progress:
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {update.percentage}%
                            </span>
                          </div>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {new Date(update.created_at).toLocaleString()}
                        </p>

                        {/* Edit/Delete Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUpdateId(update.id); // <-- mark editing mode
                              setUpdate({
                                project_id: update.project_id,
                                description: update.description,
                                media_url: update.media_url || "",
                                percentage:
                                  update.percentage != null
                                    ? String(update.percentage)
                                    : "",
                              });
                              setIsAddUpdateOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(update.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Announcements
              </h2>
              <Dialog
                open={isAddAnnouncementOpen}
                onOpenChange={setIsAddAnnouncementOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleOpenAddAnnouncement}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Add Announcement</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Announcement</DialogTitle>
                    <DialogDescription>
                      Create a new announcement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ann_title">Title</Label>
                      <Input
                        id="ann_title"
                        value={newAnnouncement.title}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="ann_short_description">
                        Short Description
                      </Label>
                      <Input
                        id="ann_short_description"
                        value={newAnnouncement.short_description}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            short_description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="ann_content">Content</Label>
                      <Textarea
                        id="ann_content"
                        value={newAnnouncement.content}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            content: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ann_scheduled_for">Schedule For</Label>
                      <Input
                        id="ann_scheduled_for"
                        type="datetime-local"
                        value={newAnnouncement.scheduled_for}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            scheduled_for: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ann_category">Category</Label>
                        <Input
                          id="ann_category"
                          value={newAnnouncement.category}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              category: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="ann_image_url">
                          Announcement Image
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="ann_image_url"
                            placeholder="Or paste image URL"
                            value={newAnnouncement.image_url}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                image_url: e.target.value,
                              })
                            }
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadFileToBucket(
                                "announcement-images",
                                file
                              );
                              if (url)
                                setNewAnnouncement((p) => ({
                                  ...p,
                                  image_url: url,
                                }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ann_published"
                        checked={newAnnouncement.is_published}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            is_published: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="ann_published">Publish immediately</Label>
                    </div>
                    <Button
                      onClick={handleSaveAnnouncement}
                      className="w-full"
                      disabled={assetUploading}
                    >
                      {editingAnnouncement
                        ? "Save Changes"
                        : "Add Announcement"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {announcements.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-6 sm:py-8">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No announcements yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg line-clamp-2">
                              {announcement.title}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Category: {announcement.category}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              announcement.is_published
                                ? "default"
                                : "secondary"
                            }
                            className="self-start"
                          >
                            {announcement.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          <p className="text-xs sm:text-sm line-clamp-3">
                            {announcement.short_description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(
                              announcement.created_at
                            ).toLocaleDateString()}
                          </p>
                          <div className="flex sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleAnnouncementPublish(
                                  announcement.id,
                                  announcement.is_published
                                )
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              {announcement.is_published
                                ? "Unpublish"
                                : "Publish"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEditAnnouncement(announcement)
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteAnnouncement(announcement.id)
                              }
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="virtual-tours" className="space-y-3 sm:space-y-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Virtual Tours
                </h2>
                <Dialog open={isVtDialogOpen} onOpenChange={setIsVtDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingVtId(null);
                        setVtTitle("");
                        setVtDescription("");
                        setVtIsPublished(true);
                        setVtVideoUrl("");
                        setVtThumbUrl("");
                        setVtRoom("bedroom"); // default
                      }}
                    >
                      Add Virtual Tour
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingVtId ? "Edit Virtual Tour" : "Add Virtual Tour"}
                      </DialogTitle>
                      <DialogDescription>
                        Manage your project’s virtual tours here. These will
                        appear on the website.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={vtTitle}
                          onChange={(e) => setVtTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={vtDescription}
                          onChange={(e) => setVtDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Room</Label>
                        <select
                          value={vtRoom}
                          onChange={(e) => setVtRoom(e.target.value)}
                          className="w-full border rounded p-2"
                        >
                          <option value="bedroom">Bedroom</option>
                          <option value="kitchen">Kitchen</option>
                          <option value="livingroom">Living Room</option>
                          <option value="bathroom">Bathroom</option>
                          <option value="balcony">Balcony</option>
                        </select>
                      </div>
                      <div>
                        <Label>Video</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={vtVideoUrl}
                            onChange={(e) => setVtVideoUrl(e.target.value)}
                            placeholder="Or paste video URL"
                          />
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadFileToBucket(
                                "virtual-tour-videos",
                                file
                              );
                              if (url) setVtVideoUrl(url);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Thumbnail (optional)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={vtThumbUrl}
                            onChange={(e) => setVtThumbUrl(e.target.value)}
                            placeholder="Or paste image URL"
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadFileToBucket(
                                "virtual-tour-thumbnails",
                                file
                              );
                              if (url) setVtThumbUrl(url);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={vtIsPublished}
                          onChange={(e) => setVtIsPublished(e.target.checked)}
                        />
                        <Label>Published</Label>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!vtTitle || !vtVideoUrl) {
                            toast({
                              title: "Missing fields",
                              description: "Title and video URL are required",
                              variant: "destructive",
                            });
                            return;
                          }

                          setVtUploading(true);

                          try {
                            if (assetUploading) {
                              toast({
                                title: "Please wait",
                                description: "Finishing file upload...",
                              });
                              return;
                            }
                            if (editingVtId) {
                              const { error } = await supabase
                                .from("virtual_tours")
                                .update({
                                  title: vtTitle,
                                  description: vtDescription,
                                  video_url: vtVideoUrl,
                                  thumbnail_url: vtThumbUrl,
                                  room: vtRoom, // required
                                  is_published: vtIsPublished,
                                })
                                .eq("id", editingVtId);

                              if (error) throw error;
                              toast({
                                title: "Updated",
                                description:
                                  "Virtual tour updated successfully.",
                              });
                            } else {
                              const { error } = await supabase
                                .from("virtual_tours")
                                .insert([
                                  {
                                    title: vtTitle,
                                    description: vtDescription,
                                    video_url: vtVideoUrl,
                                    thumbnail_url: vtThumbUrl,
                                    room: vtRoom, // required
                                    is_published: vtIsPublished,
                                  },
                                ]);

                              if (error) throw error;
                              toast({
                                title: "Added",
                                description: "Virtual tour added successfully.",
                              });
                            }

                            setIsVtDialogOpen(false);
                            fetchData();
                          } catch (err: any) {
                            console.error(err);
                            toast({
                              title: "Error",
                              description:
                                err.message || "Failed to save virtual tour",
                              variant: "destructive",
                            });
                          } finally {
                            setVtUploading(false);
                          }
                        }}
                        disabled={vtUploading || assetUploading}
                        className="w-full"
                      >
                        {vtUploading || assetUploading
                          ? "Saving..."
                          : editingVtId
                          ? "Save Changes"
                          : "Add Virtual Tour"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {dataLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {virtualTours.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No virtual tours yet
                      </CardContent>
                    </Card>
                  ) : (
                    virtualTours.map((tour) => (
                      <Card key={tour.id} className="hover:shadow-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {tour.title}
                              </CardTitle>
                              <CardDescription>
                                {tour.description}
                              </CardDescription>
                              <p className="text-xs text-muted-foreground mt-1">
                                Room: {tour.room}
                              </p>
                            </div>
                            <Badge>
                              {tour.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {tour.thumbnail_url && (
                            <img
                              src={tour.thumbnail_url}
                              alt={tour.title}
                              className="w-full rounded mb-2"
                            />
                          )}
                          {tour.video_url && (
                            <video
                              src={tour.video_url}
                              controls
                              className="w-full rounded"
                            />
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVtId(tour.id);
                                setVtTitle(tour.title);
                                setVtDescription(tour.description);
                                setVtVideoUrl(tour.video_url);
                                setVtThumbUrl(tour.thumbnail_url || "");
                                setVtRoom(tour.room);
                                setVtIsPublished(tour.is_published);
                                setIsVtDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                const { error } = await supabase
                                  .from("virtual_tours")
                                  .delete()
                                  .eq("id", tour.id);
                                if (error)
                                  return toast({
                                    title: "Error",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                fetchData();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog
        open={isRejectionDialogOpen}
        onOpenChange={setIsRejectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. This will be
              included in the email notification to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectionDialogOpen(false);
                  setRejectionReason("");
                  setPendingRejection(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setIsConfirmingRejection(true);
                  try {
                    await confirmRejection();
                  } finally {
                    setIsConfirmingRejection(false);
                  }
                }}
                disabled={isConfirmingRejection}
              >
                {isConfirmingRejection ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                    Confirming...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
