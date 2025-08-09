import { useState, useEffect } from "react";
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
}

const Projects = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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
}

const [selectedProjectUpdates, setSelectedProjectUpdates] = useState<ProjectUpdate[]>([]);
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

const fetchProjectUpdates = async (projectId: string) => {
  const { data, error } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (!error) setSelectedProjectUpdates(data);
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
          <Badge variant="outline">
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
                  className="hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`bg-gradient-to-br ${getStatusColor(
                      project.status
                    )} h-48 flex items-center justify-center overflow-hidden`}
                  >
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {project.title}
                      </CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="line-clamp-1">
                      {project.project_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>
                          Started: {new Date(project.start_date).getFullYear()}
                        </span>
                      </div>
                    </div>
                    {project.units && (
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Units & Pricing:</strong>
                        <ul className="mt-1 space-y-1">
                          {Object.entries(project.units).map(([type, price]) => (
                            <li key={type}>
                              {type}: {price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {project.Amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.Amenities.map((Amenity, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {Amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-3">
                      {project.short_description}
                    </p>

                    {project.status === "active" && (
  <button
    onClick={() => {
      setActiveProjectId(project.id);
      fetchProjectUpdates(project.id);
    }}
    className="mt-4 text-sm text-blue-600 underline"
  >
    See Progress
  </button>
)}

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Dialog open={!!activeProjectId} onOpenChange={() => setActiveProjectId(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Project Progress Updates</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {selectedProjectUpdates.map((update) => (
        <div key={update.id} className="border p-2 rounded-md">
          {update.update_type === "image" && <img src={update.media_url} className="w-full" />}
          {update.update_type === "video" && (
            <video src={update.media_url} className="w-full" controls />
          )}
          {update.description && <p className="mt-2 text-sm">{update.description}</p>}
        </div>
      ))}
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
