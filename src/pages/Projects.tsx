import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  project_type: string;
  status: "active" | "completed" | "upcoming" | "previous";
  start_date: string;
  end_date: string;
  image_url: string;
  gallery_urls: string[];
  Amenities: string[];
  units: Record<string, string>; // 1B, 2B, 3B, 4B
  created_at: string;
  progress_updates?: string[];
  floor_plans?: {
    floor_number: number;
    apartment_types: {
      id?: string;
      type: string;
      size?: string;
      availability?: "available" | "sold" | "reserved";
      price?: string;
    }[];
  }[];
}

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPercentages, setProjectPercentages] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    // Initialize tab from URL param, supports: delivered->completed, ongoing->active, previous, upcoming
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    if (tabParam === "delivered" || tabParam === "completed")
      setActiveTab("completed");
    else if (tabParam === "ongoing" || tabParam === "active")
      setActiveTab("active");
    else if (tabParam === "upcoming") setActiveTab("upcoming");
    else if (tabParam === "previous") setActiveTab("previous");
    fetchProjects();
  }, [searchParams]);

  const fetchLatestPercentages = async (projectIds: string[]) => {
    if (!projectIds?.length) return;
    try {
      // fetch all updates for these projects, newest first
      const { data, error } = await supabase
        .from("project_updates")
        .select("project_id, percentage, created_at")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project updates for percentages:", error);
        return;
      }

      const map: Record<string, number> = {};
      // data is ordered newest->oldest; take first percentage per project
      for (const row of data || ([] as any[])) {
        const pid = row.project_id;
        if (
          pid &&
          typeof row.percentage === "number" &&
          map[pid] === undefined
        ) {
          map[pid] = Math.min(100, Math.max(0, row.percentage));
        }
      }
      setProjectPercentages(map);
    } catch (err) {
      console.error("fetchLatestPercentages error:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const normalized = (data || []).map((p) => ({
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
      }));

      setProjects(normalized);

      // PRELOAD latest percentages so progress bars don't jump when user clicks
      const ids = normalized.map((p) => p.id);
      await fetchLatestPercentages(ids);
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

  const [selectedProjectUpdates, setSelectedProjectUpdates] = useState<
    ProjectUpdate[]
  >([]);
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
    const pre = projectPercentages[projectId];
    if (typeof pre === "number") return pre;
    // fallback: check selectedProjectUpdates (dialog list) for any matching update
    const latest = selectedProjectUpdates.find(
      (u) => u.project_id === projectId
    );
    return typeof latest?.percentage === "number"
      ? Math.min(100, Math.max(0, latest.percentage))
      : 0;
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

      {/* Projects Hero Section */}
<section className="relative w-full py-20 overflow-hidden">

  {/* Animated Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0A5E55] via-[#0F8A7A] to-[#0A5E55] animate-gradient-x"></div>

  {/* Light Glow Effect */}
  <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>

  {/* Floating Particles */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-slow left-10 top-10"></div>
    <div className="absolute w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float-reverse right-16 bottom-14"></div>
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

    {/* Title */}
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight lg:leading-[1.1] overflow-visible text-white animate-fade-slide-up pendulum-mask">
      {t("projectsPage.hero.title")}
    </h1>

    {/* Subtitle */}
    <p className="text-xl text-white/90 max-w-3xl mx-auto mt-4 animate-fade-slide-up">
      {t("projectsPage.hero.subtitle")}
    </p>
  </div>
</section>
<style>
{`@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 8s ease infinite;
}

@keyframes float-slow {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-25px); }
}
.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

@keyframes float-reverse {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(20px); }
}
.animate-float-reverse {
  animation: float-reverse 7s ease-in-out infinite;
}

@keyframes scale-up {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scale-up 0.8s ease-out forwards;
}

@keyframes fade-slide-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-slide-up {
  animation: fade-slide-up 1s ease-out forwards;
}

.pendulum-mask {
  mask-image: linear-gradient(to right, transparent 0%, black 50%, transparent 100%);
  mask-size: 200% 100%;
  animation: pendulum 3s ease-in-out infinite alternate;
  mix-blend-mode: screen;
}
@keyframes pendulum {
  0% { mask-position: left; }
  100% { mask-position: right; }
}
`}
</style>

      <section className="py-10 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10">
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
            <Button
              variant={activeTab === "previous" ? "default" : "outline"}
              onClick={() => setActiveTab("previous")}
            >
              Previous
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border bg-white/90 backdrop-blur-sm rounded-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center p-3 md:p-4 gap-4">
                    {/* Left: Thumbnail */}
                    <div className="relative w-full md:w-64 lg:w-80 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      <div
                        className={`bg-gradient-to-br ${getStatusColor(
                          project.status
                        )} w-full h-full flex items-center justify-center overflow-hidden relative`}
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

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Progress overlay */}
                        {project.status === "active" && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/30 backdrop-blur-md rounded-md p-2">
                              <div className="flex justify-between text-xs text-white">
                                <span>Progress</span>
                                <span>{getLatestPercentage(project.id)}%</span>
                              </div>
                              <Progress
                                value={getLatestPercentage(project.id)}
                                className="h-1.5 bg-white/20"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Title + Meta */}
                      <div>
                        <CardHeader className="py-0 px-0">
                          <CardTitle className="text-lg md:text-xl line-clamp-1">
                            {project.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="truncate">
                              {project.project_type}
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="px-0 pt-2 pb-0">
                          <div className="flex flex-col gap-2 text-xs md:text-sm">
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="truncate">
                                {project.location}
                              </span>
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>
                                Start{" "}
                                {new Date(project.start_date).getFullYear()}
                              </span>
                              {project.end_date && (
                                <span className="whitespace-nowrap">
                                  • Target{" "}
                                  {new Date(project.end_date).getFullYear()}
                                </span>
                              )}
                            </div>

                            {/* Units */}
                            {Object.keys(project.units || {}).length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Users className="w-4 h-4 text-primary" />
                                {Object.entries(project.units)
                                  .slice(0, 3)
                                  .map(([type, price]) => (
                                    <Badge
                                      key={type}
                                      variant="secondary"
                                      className="text-[10px] md:text-xs bg-primary/10 text-primary"
                                    >
                                      {type}
                                      {price ? ` • ${price}` : ""}
                                    </Badge>
                                  ))}
                                {Object.entries(project.units).length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] md:text-xs"
                                  >
                                    +{Object.entries(project.units).length - 3}{" "}
                                    more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Amenities */}
                            {project.Amenities &&
                              project.Amenities.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                  {project.Amenities.slice(0, 3).map(
                                    (amenity, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-[10px] md:text-xs bg-primary/10 text-primary"
                                      >
                                        {amenity}
                                      </Badge>
                                    )
                                  )}
                                  {project.Amenities.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] md:text-xs"
                                    >
                                      +{project.Amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2 justify-end md:justify-start">
                        {project.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveProjectId(project.id);
                                fetchProjectUpdates(project.id);
                              }}
                            >
                              <Wrench className="w-3 h-3 mr-1" />
                              Progress
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookNow(project);
                              }}
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Book
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Dialog
            open={!!activeProjectId}
            onOpenChange={() => setActiveProjectId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Project Progress Updates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedProjectUpdates.map((update) => (
                  <div key={update.id} className="border p-2 rounded-md">
                    {update.update_type === "image" && (
                      <img src={update.media_url} className="w-full" />
                    )}
                    {update.update_type === "video" && (
                      <video
                        src={update.media_url}
                        className="w-full"
                        controls
                      />
                    )}
                    {update.description && (
                      <p className="mt-2 text-sm">{update.description}</p>
                    )}
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
