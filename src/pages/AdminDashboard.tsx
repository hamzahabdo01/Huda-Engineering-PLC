import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  XCircle
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
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

interface PropertyBooking {
  id: string;
  property_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
  move_in_date: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  project_type: string;
  status: 'active' | 'completed' | 'upcoming';
  budget: string;
  start_date: string;
  end_date: string;
  image_url: string;
  gallery_urls: string[];
  features: string[];
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
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Dialog states
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    short_description: "",
    location: "",
    project_type: "",
    status: "active" as const,
    budget: "",
    start_date: "",
    end_date: "",
    image_url: "",
    features: [] as string[],
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    short_description: "",
    category: "general",
    image_url: "",
    is_published: false,
  });

  const [featureInput, setFeatureInput] = useState("");

  const fetchData = useCallback(async () => {
    console.log('🔄 Starting data fetch...');
    setDataLoading(true);
    
    try {
      console.log('🔐 Current user:', user?.email);
      console.log('👤 Current profile:', profile);
      
      const [contactsRes, bookingsRes, projectsRes, announcementsRes] = await Promise.all([
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('property_bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      ]);

      console.log('📞 Contacts response:', contactsRes);
      console.log('🏠 Bookings response:', bookingsRes);
      console.log('🏗️ Projects response:', projectsRes);
      console.log('📢 Announcements response:', announcementsRes);

      if (contactsRes.error) {
        console.error('❌ Contacts error:', contactsRes.error);
        toast({
          title: "Error fetching contacts",
          description: contactsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${contactsRes.data?.length || 0} contacts`);
        setContacts(contactsRes.data as ContactSubmission[] || []);
      }

      if (bookingsRes.error) {
        console.error('❌ Bookings error:', bookingsRes.error);
        toast({
          title: "Error fetching bookings",
          description: bookingsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${bookingsRes.data?.length || 0} bookings`);
        setBookings(bookingsRes.data as PropertyBooking[] || []);
      }

      if (projectsRes.error) {
        console.error('❌ Projects error:', projectsRes.error);
        toast({
          title: "Error fetching projects",
          description: projectsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${projectsRes.data?.length || 0} projects`);
        setProjects(projectsRes.data as Project[] || []);
      }

      if (announcementsRes.error) {
        console.error('❌ Announcements error:', announcementsRes.error);
        toast({
          title: "Error fetching announcements",
          description: announcementsRes.error.message,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Setting ${announcementsRes.data?.length || 0} announcements`);
        setAnnouncements(announcementsRes.data as Announcement[] || []);
      }

    } catch (error) {
      console.error('💥 Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
      console.log('✅ Data fetch completed');
    }
  }, [user, profile, toast]);

  const setupRealtimeSubscriptions = useCallback(() => {
    console.log('🔄 Setting up real-time subscriptions...');
    
    // Subscribe to contact submissions
    const contactsSubscription = supabase
      .channel('contact_submissions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          console.log('📞 Contact submission change:', payload);
          if (payload.eventType === 'INSERT') {
            const newContact = payload.new as ContactSubmission;
            setContacts(prev => [newContact, ...prev]);
            toast({
              title: "New Contact Submission",
              description: `New contact from ${newContact.name}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setContacts(prev => prev.map(contact => 
              contact.id === payload.new.id ? payload.new as ContactSubmission : contact
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to property bookings
    const bookingsSubscription = supabase
      .channel('property_bookings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'property_bookings' },
        (payload) => {
          console.log('🏠 Property booking change:', payload);
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as PropertyBooking;
            setBookings(prev => [newBooking, ...prev]);
            toast({
              title: "New Property Booking",
              description: `New booking from ${newBooking.full_name}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => prev.map(booking => 
              booking.id === payload.new.id ? payload.new as PropertyBooking : booking
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to projects
    const projectsSubscription = supabase
      .channel('projects')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('🏗️ Project change:', payload);
          if (payload.eventType === 'INSERT') {
            setProjects(prev => [payload.new as Project, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects(prev => prev.map(project => 
              project.id === payload.new.id ? payload.new as Project : project
            ));
          } else if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(project => project.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to announcements
    const announcementsSubscription = supabase
      .channel('announcements')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('📢 Announcement change:', payload);
          if (payload.eventType === 'INSERT') {
            setAnnouncements(prev => [payload.new as Announcement, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements(prev => prev.map(announcement => 
              announcement.id === payload.new.id ? payload.new as Announcement : announcement
            ));
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements(prev => prev.filter(announcement => announcement.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    console.log('✅ Real-time subscriptions set up');

    // Cleanup subscriptions on component unmount
    return () => {
      console.log('🧹 Cleaning up subscriptions');
      contactsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      projectsSubscription.unsubscribe();
      announcementsSubscription.unsubscribe();
    };
  }, [toast]);

  // Check authentication
  useEffect(() => {
    console.log('🔐 Auth check - Loading:', loading, 'User:', user?.email);
    
    if (!loading) {
      if (!user) {
        console.log('❌ No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('✅ User authenticated, fetching data and setting up subscriptions');
      // If we reach here, user is authenticated
      fetchData();
      setupRealtimeSubscriptions();
    }
  }, [user, loading, navigate, fetchData, setupRealtimeSubscriptions]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact status updated",
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('property_bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking status updated",
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          ...newProject,
          created_by: user?.id,
        }]);

      if (error) throw error;

      setNewProject({
        title: "",
        description: "",
        short_description: "",
        location: "",
        project_type: "",
        status: "active",
        budget: "",
        start_date: "",
        end_date: "",
        image_url: "",
        features: [],
      });
      setIsAddProjectOpen(false);

      toast({
        title: "Success",
        description: "Project added successfully",
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleAddAnnouncement = async () => {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          ...newAnnouncement,
          created_by: user?.id,
        }]);

      if (error) throw error;

      setNewAnnouncement({
        title: "",
        content: "",
        short_description: "",
        category: "general",
        image_url: "",
        is_published: false,
      });
      setIsAddAnnouncementOpen(false);

      toast({
        title: "Success",
        description: "Announcement added successfully",
      });
    } catch (error) {
      console.error('Error adding announcement:', error);
      toast({
        title: "Error",
        description: "Failed to add announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const toggleAnnouncementPublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Announcement ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setNewProject(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => {
                console.log('🧪 Manual test - Current state:');
                console.log('User:', user);
                console.log('Profile:', profile);
                console.log('Loading:', loading);
                console.log('Data Loading:', dataLoading);
                console.log('Contacts:', contacts);
                console.log('Bookings:', bookings);
                console.log('Projects:', projects);
                console.log('Announcements:', announcements);
              }}>
                Debug
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Contact Forms</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">
                  {contacts.filter(c => c.status === 'pending').length} pending
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Property Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-xs text-muted-foreground">
                  {bookings.filter(b => b.status === 'pending').length} pending
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Building className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">
                  {projects.filter(p => p.status === 'active').length} active
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Announcements</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
                <p className="text-xs text-muted-foreground">
                  {announcements.filter(a => a.is_published).length} published
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <p>User: {user?.email}</p>
              <p>Profile: {profile?.full_name} ({profile?.role})</p>
              <p>Loading: {loading.toString()}</p>
              <p>Data Loading: {dataLoading.toString()}</p>
              <p>Contacts: {contacts.length}</p>
              <p>Bookings: {bookings.length}</p>
              <p>Projects: {projects.length}</p>
              <p>Announcements: {announcements.length}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts">Contact Forms ({contacts.length})</TabsTrigger>
            <TabsTrigger value="bookings">Property Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contact Submissions</h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">No contact submissions yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  contacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <CardDescription>{contact.email} • {contact.phone}</CardDescription>
                          </div>
                          <Badge variant={contact.status === 'pending' ? 'destructive' : contact.status === 'contacted' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Project Type:</strong> {contact.project_type} • <strong>Budget:</strong> {contact.budget}
                        </p>
                        <p className="mb-4">{contact.message}</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Submitted: {new Date(contact.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateContactStatus(contact.id, 'contacted')}
                            disabled={contact.status !== 'pending'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark as Contacted
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateContactStatus(contact.id, 'closed')}
                            disabled={contact.status === 'closed'}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Close
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Property Bookings</h2>
            </div>
            {dataLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">No property bookings yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{booking.full_name}</CardTitle>
                            <CardDescription>{booking.email} • {booking.phone}</CardDescription>
                          </div>
                          <Badge variant={booking.status === 'pending' ? 'destructive' : booking.status === 'approved' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Property ID:</strong> {booking.property_id} • <strong>National ID:</strong> {booking.national_id}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Move-in Date:</strong> {booking.move_in_date || 'Not specified'}
                        </p>
                        {booking.notes && <p className="mb-4">{booking.notes}</p>}
                        <p className="text-xs text-muted-foreground mb-4">
                          Submitted: {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'approved')}
                            disabled={booking.status !== 'pending'}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking.id, 'rejected')}
                            disabled={booking.status !== 'pending'}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>Create a new project in your portfolio</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newProject.location}
                          onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="project_type">Project Type</Label>
                        <Input
                          id="project_type"
                          value={newProject.project_type}
                          onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                          id="budget"
                          value={newProject.budget}
                          onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="short_description">Short Description</Label>
                      <Input
                        id="short_description"
                        value={newProject.short_description}
                        onChange={(e) => setNewProject({ ...newProject, short_description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newProject.start_date}
                          onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newProject.end_date}
                          onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        value={newProject.image_url}
                        onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Features</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Enter a feature"
                          onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                        />
                        <Button type="button" onClick={addFeature}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newProject.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                            {feature} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setNewProject({ ...newProject, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddProject} className="w-full">
                      Add Project
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">No projects yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Type:</strong> {project.project_type} • <strong>Status:</strong> {project.status}
                        </p>
                        <p className="text-sm mb-4">{project.short_description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Announcements</h2>
              <Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Announcement</DialogTitle>
                    <DialogDescription>Create a new announcement</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ann_title">Title</Label>
                      <Input
                        id="ann_title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ann_short_description">Short Description</Label>
                      <Input
                        id="ann_short_description"
                        value={newAnnouncement.short_description}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, short_description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ann_content">Content</Label>
                      <Textarea
                        id="ann_content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ann_category">Category</Label>
                        <Input
                          id="ann_category"
                          value={newAnnouncement.category}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ann_image_url">Image URL</Label>
                        <Input
                          id="ann_image_url"
                          value={newAnnouncement.image_url}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ann_published"
                        checked={newAnnouncement.is_published}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_published: e.target.checked })}
                      />
                      <Label htmlFor="ann_published">Publish immediately</Label>
                    </div>
                    <Button onClick={handleAddAnnouncement} className="w-full">
                      Add Announcement
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
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">No announcements yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>Category: {announcement.category}</CardDescription>
                          </div>
                          <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                            {announcement.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{announcement.short_description}</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Created: {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleAnnouncementPublish(announcement.id, announcement.is_published)}
                          >
                            {announcement.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;