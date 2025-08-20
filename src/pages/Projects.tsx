import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Target,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  gallery_urls: string[];
  Amenities: string[];
  units: Record<string, string>; // 1B, 2B, 3B, 4B
  created_at: string;
  progress_updates?: string[];
  floor_plans?: { floor_number: number; apartment_types: { id?: string; type: string; size?: string; availability?: 'available' | 'sold' | 'reserved'; price?: string }[] }[];
}

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Set up real-time subscription for project updates
  useEffect(() => {
    const channel = supabase
      .channel('projects_progress_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_updates'
        },
        () => {
          // Refresh project updates when any change occurs
          if (activeProjectId) {
            fetchProjectUpdates(activeProjectId);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeProjectId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setProjects(
        (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          short_description: p.short_description,
          location: p.location,
          project_type: p.project_type,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
          image_url: p.image_url,
          gallery_urls: p.gallery_urls || [],
          Amenities: p.Amenities || [],
          units: p.units || {},
          created_at: p.created_at,
          progress_updates: p.progress_updates || [],
          floor_plans: p.floor_plans || [],
        }))
      );
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };
  interface ProjectUpdate {
  id: string;
  project_id: string;
  update_type: "image" | "video" | "text";
  media_url: string;
  description: string;
  created_at: string;
  percentage?: number | null;
}

  const [selectedProjectUpdates, setSelectedProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const handleBookNow = (project: Project) => {
    // Navigate to booking page with project ID as query parameter
    navigate(`/booking?project=${project.id}`);
  };

const fetchProjectUpdates = async (projectId: string) => {
  const { data, error } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (!error) setSelectedProjectUpdates(data as ProjectUpdate[]);
};

const getLatestPercentage = (projectId: string) => {
  const latest = selectedProjectUpdates.find(u => u.project_id === projectId);
  return typeof latest?.percentage === 'number' ? Math.min(100, Math.max(0, latest.percentage)) : 0;
};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary">
            {t("projectsPage.details.completedBadge")}
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            {t("projectsPage.details.activeBadge")}
          </Badge>
        );
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-500 to-green-600";
      case "active":
        return "from-blue-500 to-blue-600";
      case "upcoming":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredProjects = projects.filter(
    (project) => project.status === activeTab
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("projectsPage.hero.title")}
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            {t("projectsPage.hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-10 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-4 mb-10">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
            >
              Ongoing
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              onClick={() => setActiveTab("completed")}
            >
              Delivered
            </Button>
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </Button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Projects Available
              </h3>
              <p className="text-muted-foreground">
                Our portfolio will be displayed here once projects are added.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm"
                >
                  <div className="relative">
                    <div
                      className={`bg-gradient-to-br ${getStatusColor(
                        project.status
                      )} h-56 flex items-center justify-center overflow-hidden relative`}
                    >
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <Building2 className="w-16 h-16 text-white" />
                      )}
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(project.status)}
                      </div>
                      {project.status === "active" && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3">
                            <div className="flex justify-between mb-2 text-xs text-white">
                              <span>Project Progress</span>
                              <span>
                                {getLatestPercentage(project.id)}%
                              </span>
                            </div>
                            <Progress 
                              value={getLatestPercentage(project.id)} 
                              className="h-2 bg-white/20"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl line-clamp-2 mb-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{project.project_type}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>Started: {new Date(project.start_date).getFullYear()}</span>
                        {project.end_date && (
                          <>
                            <span>•</span>
                            <span>Target: {new Date(project.end_date).getFullYear()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {Object.keys(project.units || {}).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Available Units</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(project.units).map(([type, price]) => (
                            <div key={type} className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                              <div className="text-sm font-medium text-primary">{type}</div>
                              <div className="text-xs text-muted-foreground">{price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.floor_plans && project.floor_plans.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span>Floors & Types</span>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Floors: {project.floor_plans.length}</div>
                          <div className="grid grid-cols-2 gap-1">
                            {project.floor_plans.slice(0, 2).map((floor) => (
                              <div key={floor.floor_number} className="bg-secondary/30 rounded p-2">
                                <div className="font-medium text-foreground mb-1">Floor {floor.floor_number}</div>
                                <div className="space-y-1">
                                  {floor.apartment_types.slice(0, 2).map((apt, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span>{apt.type}{apt.size ? ` (${apt.size})` : ''}</span>
                                      <span className={apt.availability === 'available' ? 'text-green-600' : 'text-muted-foreground'}>
                                        {apt.availability || 'n/a'}
                                      </span>
                                    </div>
                                  ))}
                                  {floor.apartment_types.length > 2 && (
                                    <div className="text-center">+{floor.apartment_types.length - 2} more</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {project.Amenities && project.Amenities.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>Key Amenities</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.Amenities.slice(0, 4).map((amenity, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {amenity}
                            </Badge>
                          ))}
                          {project.Amenities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.Amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.short_description}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {project.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveProjectId(project.id);
                            fetchProjectUpdates(project.id);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          View Progress
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleBookNow(project)}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        Book Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Dialog open={!!activeProjectId} onOpenChange={() => setActiveProjectId(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Project Progress Updates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedProjectUpdates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No progress updates yet for this project.</p>
                  </div>
                ) : (
                  selectedProjectUpdates.map((update) => (
                    <Card key={update.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {update.media_url && update.update_type === "image" && (
                          <div className="relative">
                            <img 
                              src={update.media_url} 
                              alt="Progress update" 
                              className="w-full h-48 object-cover"
                            />
                            {update.percentage && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                                {update.percentage}%
                              </div>
                            )}
                          </div>
                        )}
                        {update.media_url && update.update_type === "video" && (
                          <div className="relative">
                            <video 
                              src={update.media_url} 
                              controls 
                              className="w-full h-48 object-cover"
                            />
                            {update.percentage && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                                {update.percentage}%
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          {update.description && (
                            <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Update Type: {update.update_type}</span>
                            <span>{new Date(update.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>


          {selectedProject && (
            <div className="mt-10 p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-bold mb-2">
                {selectedProject.title} - Progress Updates
              </h3>
              {selectedProject.progress_updates?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {selectedProject.progress_updates.map((update, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {update}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No updates yet.</p>
              )}
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
