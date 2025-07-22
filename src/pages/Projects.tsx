
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

const Projects = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">{t("projectsPage.details.completedBadge")}</Badge>;
      case 'active':
        return <Badge variant="outline">{t("projectsPage.details.activeBadge")}</Badge>;
      case 'upcoming':
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-600';
      case 'active':
        return 'from-blue-500 to-blue-600';
      case 'upcoming':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading projects...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("projectsPage.hero.title")}</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            {t("projectsPage.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("projectsPage.featured.title")}</h2>
            <p className="text-xl text-muted-foreground">{t("projectsPage.featured.description")}</p>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Available</h3>
              <p className="text-muted-foreground">Check back later for our latest projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {projects.slice(0, 2).map((project, index) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-br ${index === 0 ? 'from-primary to-primary/80' : 'from-accent to-accent/80'} h-64 flex items-center justify-center overflow-hidden`}>
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className={`w-20 h-20 ${index === 0 ? 'text-primary-foreground' : 'text-accent-foreground'}`} />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      {index === 0 ? (
                        <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                      ) : (
                        getStatusBadge(project.status)
                      )}
                    </div>
                    <CardDescription className="text-lg">{project.project_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {new Date(project.start_date).getFullYear()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>Budget: {project.budget}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {project.short_description}
                      </p>
                      {project.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {project.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Projects Grid */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("projectsPage.all.title")}</h2>
            <p className="text-xl text-muted-foreground">{t("projectsPage.all.description")}</p>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Available</h3>
              <p className="text-muted-foreground">Our portfolio will be displayed here once projects are added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <div className={`bg-gradient-to-br ${getStatusColor(project.status)} h-48 flex items-center justify-center overflow-hidden`}>
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
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="line-clamp-1">{project.project_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Started: {new Date(project.start_date).getFullYear()}</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{project.budget}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.short_description}
                    </p>
                    {project.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {project.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
