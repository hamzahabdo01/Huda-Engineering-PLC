import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BookingManagement from "@/components/BookingManagement";
import DatabaseConnectionTest from "@/components/DatabaseConnectionTest";
import {
  Users,
  Calendar,
  MessageSquare,
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Home,
  Briefcase,
  Layers,
  BarChart3,
  TrendingUp,
  UserCheck,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Define interfaces
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

interface PropertyBooking {
  id: string;
  property_id: string;
  unit_type: string;
  full_name: string;
  email: string;
  phone: string;
  secondary_phone: string;
  national_id: string;
  move_in_date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  preferred_contact: string;
  projects?: {
    title: string;
    location: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  project_type: string;
  status: 'planning' | 'active' | 'completed' | 'upcoming' | 'on-hold';
  start_date: string;
  end_date: string;
  image_url: string;
  gallery_urls: string[];
  Amenities: string[];
  units: Record<string, string>;
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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [propertyBookings, setPropertyBookings] = useState<PropertyBooking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dialog states
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Project | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Form states
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    short_description: "",
    location: "",
    project_type: "residential",
    status: "planning" as const,
    start_date: "",
    end_date: "",
    image_url: "",
    Amenities: [] as string[],
    units: {} as Record<string, string>,
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    short_description: "",
    category: "general",
    image_url: "",
    is_published: false,
  });

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    if (user.email !== "hudaengineeringrealestate@gmail.com") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchData();
  }, [user, navigate, toast]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data with individual error handling
      const [contactsRes, bookingsRes, projectsRes, announcementsRes] = await Promise.all([
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("property_bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      ]);

      // Handle each response with error checking
      if (contactsRes.error) {
        console.error("Contacts error:", contactsRes.error);
        toast({
          title: "Warning",
          description: "Failed to load contact submissions",
          variant: "destructive",
        });
      } else if (contactsRes.data) {
        setContactSubmissions(contactsRes.data);
      }

      if (bookingsRes.error) {
        console.error("Bookings error:", bookingsRes.error);
        // Try fallback without join
        const fallbackBookings = await supabase
          .from("property_bookings")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (fallbackBookings.data) {
          setPropertyBookings(fallbackBookings.data);
        }
        toast({
          title: "Warning", 
          description: "Loaded bookings without property details",
        });
      } else if (bookingsRes.data) {
        setPropertyBookings(bookingsRes.data);
      }

      if (projectsRes.error) {
        console.error("Projects error:", projectsRes.error);
        toast({
          title: "Warning",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } else if (projectsRes.data) {
        setProjects(projectsRes.data);
      }

      if (announcementsRes.error) {
        console.error("Announcements error:", announcementsRes.error);
        toast({
          title: "Warning",
          description: "Failed to load announcements",
          variant: "destructive",
        });
      } else if (announcementsRes.data) {
        setAnnouncements(announcementsRes.data);
      }

    } catch (error) {
      console.error("General error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // These functions are now handled by the BookingManagement component

  // Add new property
  const addProperty = async () => {
    try {
      const { error } = await supabase.from("projects").insert([newProperty]);
      if (error) throw error;

      toast({ title: "Success", description: "Property added successfully" });
      setIsAddPropertyOpen(false);
      setNewProperty({
        title: "",
        description: "",
        short_description: "",
        location: "",
        project_type: "residential",
        status: "planning",
        start_date: "",
        end_date: "",
        image_url: "",
        Amenities: [],
        units: {},
      });
      fetchData();
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
    }
  };

  // Delete property
  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Property deleted successfully" });
      fetchData();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  // Add new announcement
  const addAnnouncement = async () => {
    try {
      const { error } = await supabase.from("announcements").insert([newAnnouncement]);
      if (error) throw error;

      toast({ title: "Success", description: "Announcement added successfully" });
      setIsAddAnnouncementOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        short_description: "",
        category: "general",
        image_url: "",
        is_published: false,
      });
      fetchData();
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast({
        title: "Error",
        description: "Failed to add announcement",
        variant: "destructive",
      });
    }
  };

  // Delete contact submission
  const deleteContactSubmission = async (id: string) => {
    try {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Contact submission deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact submission",
        variant: "destructive",
      });
    }
  };

  // Delete property booking
  const deletePropertyBooking = async (id: string) => {
    try {
      const { error } = await supabase.from("property_bookings").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Success", description: "Property booking deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete property booking",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
              <p className="text-primary-foreground/80">Welcome back, {user?.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <LogOut className="h-4 w-4 mr-2" />
              {t("navbar.signOut")}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("admin.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("admin.bookings")}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("admin.announcements")}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t("admin.contacts")}
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("admin.properties")}
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {projects.filter(p => p.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("admin.newContacts")}</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactSubmissions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {contactSubmissions.filter(c => c.status === 'pending').length} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Property Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{propertyBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {propertyBookings.filter(b => b.status === 'pending').length} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("admin.publishedAnnouncements")}</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcements.filter(a => a.is_published).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {announcements.filter(a => !a.is_published).length} drafts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Contact Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contactSubmissions.slice(0, 3).map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                        <Badge variant={contact.status === 'pending' ? 'default' : 'secondary'}>
                          {contact.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Property Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{booking.full_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.unit_type}</p>
                        </div>
                        <Badge variant={booking.status === 'pending' ? 'default' : booking.status === 'approved' ? 'secondary' : 'destructive'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Property Bookings Management */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingManagement />
          </TabsContent>

          {/* Announcements Management */}
          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t("admin.announcements")}</CardTitle>
                    <CardDescription>{t("admin.createAndManage")}</CardDescription>
                  </div>
                  <Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Announcement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="short_description">Short Description</Label>
                          <Input
                            id="short_description"
                            value={newAnnouncement.short_description}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, short_description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={newAnnouncement.category} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="new-project">New Project</SelectItem>
                              <SelectItem value="construction">Construction Update</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            value={newAnnouncement.image_url}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, image_url: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_published"
                            checked={newAnnouncement.is_published}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, is_published: e.target.checked})}
                          />
                          <Label htmlFor="is_published">Publish immediately</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addAnnouncement}>Add Announcement</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">{announcement.title}</TableCell>
                        <TableCell>{announcement.category}</TableCell>
                        <TableCell>
                          <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                            {announcement.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(announcement.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Submissions */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.contacts")}</CardTitle>
                <CardDescription>{t("admin.viewAndRespond")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.name")}</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>{t("common.message")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactSubmissions.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                        <TableCell>
                          <Badge variant={contact.status === 'pending' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this contact submission?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteContactSubmission(contact.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Management */}
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t("admin.properties")}</CardTitle>
                    <CardDescription>Manage your property portfolio</CardDescription>
                  </div>
                  <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.addProperty")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t("admin.addProperty")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newProperty.title}
                            onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newProperty.location}
                            onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="project_type">Project Type</Label>
                          <Select value={newProperty.project_type} onValueChange={(value) => setNewProperty({...newProperty, project_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="mixed-use">Mixed Use</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={newProperty.status} onValueChange={(value: any) => setNewProperty({...newProperty, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">Planning</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newProperty.description}
                            onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="short_description">Short Description</Label>
                          <Input
                            id="short_description"
                            value={newProperty.short_description}
                            onChange={(e) => setNewProperty({...newProperty, short_description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            value={newProperty.image_url}
                            onChange={(e) => setNewProperty({...newProperty, image_url: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="start_date">Start Date</Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={newProperty.start_date}
                            onChange={(e) => setNewProperty({...newProperty, start_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={newProperty.end_date}
                            onChange={(e) => setNewProperty({...newProperty, end_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addProperty}>Add Property</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.location}</TableCell>
                        <TableCell>{project.project_type}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this property?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProperty(project.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug" className="space-y-6">
            <DatabaseConnectionTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;