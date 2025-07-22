
import { useState, useEffect } from "react";
import { Calendar, MapPin, Home, DollarSign, Clock, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

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

const Booking = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    property: "",
    moveInDate: "",
    notes: ""
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['active', 'completed']) // Only show active and completed projects for booking
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableProjects = projects.filter(p => p.status === 'active' || p.status === 'completed');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('property_bookings')
        .insert([
          {
            property_id: formData.property,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            national_id: formData.nationalId,
            move_in_date: formData.moveInDate || null,
            notes: formData.notes || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: t("booking.toast.title"),
        description: t("booking.toast.description"),
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        nationalId: "",
        property: "",
        moveInDate: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading available properties...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("booking.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("booking.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Property Listings */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("booking.available")}</h2>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Properties Available</h3>
                <p className="text-muted-foreground">Check back later for available properties to book.</p>
              </div>
            ) : (
              <div className="space-y-6">
                                 {projects.map((project) => (
                  <Card key={project.id} className={`transition-all duration-300 hover:shadow-lg ${
                    project.status === "upcoming" ? "opacity-60" : ""
                  }`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          />
                        ) : (
                          <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                            <Building2 className="w-16 h-16 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                          <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'outline'}>
                            {project.status === 'active' ? 'Available' : project.status === 'completed' ? 'Completed' : 'Upcoming'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {project.project_type}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {project.budget}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.short_description}
                        </p>

                        {project.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.features.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {project.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-primary">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="text-sm">Started: {new Date(project.start_date).getFullYear()}</span>
                          </div>
                          <Button 
                            size="sm" 
                            disabled={project.status === "upcoming"}
                            onClick={() => setFormData({...formData, property: project.id})}
                          >
                            {project.status !== "upcoming" ? "Select" : "Coming Soon"}
                          </Button>
                        </div>
                      </div>
                    </div>
                                  </Card>
                ))}
                </div>
              )}
            </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t("booking.form.title")}</CardTitle>
                <CardDescription>
                  {t("booking.form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("booking.form.fullName")} *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("booking.form.email")} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("booking.form.phone")} *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">{t("booking.form.nationalId")} *</Label>
                    <Input
                      id="nationalId"
                      name="nationalId"
                      type="text"
                      required
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      placeholder={t("booking.form.nationalIdPlaceholder")}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property">{t("booking.form.property")} *</Label>
                    <Select 
                      value={formData.property} 
                      onValueChange={(value) => setFormData({...formData, property: value})}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder={t("booking.form.propertyPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {availableProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title} - {project.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">{t("booking.form.moveInDate")}</Label>
                    <Input
                      id="moveInDate"
                      name="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={handleInputChange}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("booking.form.notes")}</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={t("booking.form.notesPlaceholder")}
                      className="bg-background border-input"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("booking.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
