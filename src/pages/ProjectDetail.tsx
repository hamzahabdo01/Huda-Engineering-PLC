import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Calendar, CheckCircle, ArrowLeft } from "lucide-react";

interface ApartmentType {
  id?: string;
  type: string;
  size?: string;
  availability?: 'available' | 'sold' | 'reserved';
  price?: string;
}

interface FloorPlan {
  id?: string;
  floor_number: number;
  apartment_types: ApartmentType[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  project_type: string;
  status: 'active' | 'completed' | 'upcoming';
  start_date: string;
  end_date: string;
  image_url: string;
  gallery_urls?: string[];
  Amenities?: string[];
  units?: Record<string, string>;
  floor_plans?: FloorPlan[];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        setProject(data as unknown as Project);
        fetchStock(data.id);
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const fetchStock = async (projectId: string) => {
    const { data, error } = await supabase
      .from('unit_stock')
      .select('unit_type,total_units,booked_units')
      .eq('property_id', projectId);
    if (!error && data) {
      const map: Record<string, number> = {};
      data.forEach((row: any) => {
        map[row.unit_type] = (row.total_units ?? 0) - (row.booked_units ?? 0);
      });
      setStock(map);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-muted-foreground">Loading project...</div>
      </main>
      <Footer />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-muted-foreground">Project not found.</div>
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => navigate('/projects')}><ArrowLeft className="w-4 h-4 mr-1"/> Back to Projects</Button>
        </div>
      </main>
      <Footer />
    </div>
  );

  const statusBadge = (
    <Badge variant={project.status === 'completed' ? 'secondary' : project.status === 'active' ? 'outline' : 'default'}>
      {project.status}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-14">
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/10 text-white border-white/30" onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-1"/> Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
            {statusBadge}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><Building2 className="w-4 h-4"/> {project.project_type}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {project.location}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {new Date(project.start_date).toLocaleDateString()} {project.end_date ? `- ${new Date(project.end_date).toLocaleDateString()}` : ''}</div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="w-full max-h-[420px] object-cover rounded" />
            )}
            <p className="text-muted-foreground">{project.description || project.short_description}</p>
            {project.Amenities && project.Amenities.length > 0 && (
              <div>
                <div className="font-medium mb-2">Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {project.Amenities.map((a, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(project.units && Object.keys(project.units).length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Unit Types (Legacy)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Size/Price</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(project.units).map(([type, sizeOrPrice]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">{type}</TableCell>
                      <TableCell>{String(sizeOrPrice)}</TableCell>
                      <TableCell>{stock[type] ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {project.floor_plans && project.floor_plans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Floor Plans & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.floor_plans
                .slice()
                .sort((a, b) => a.floor_number - b.floor_number)
                .map((floor) => (
                <div key={floor.id || floor.floor_number}>
                  <div className="font-semibold mb-2">Floor {floor.floor_number}</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Apartment Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Units Available</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {floor.apartment_types.map((apt, idx) => (
                        <TableRow key={apt.id || idx}>
                          <TableCell className="font-medium">
                            <button
                              className="text-primary underline underline-offset-2 hover:opacity-80"
                              onClick={() => navigate(`/projects/${project.id}/apartment/${encodeURIComponent(apt.type)}`)}
                            >
                              {apt.type}
                            </button>
                          </TableCell>
                          <TableCell>{apt.size || '—'}</TableCell>
                          <TableCell>{apt.price || '—'}</TableCell>
                          <TableCell>
                            <span className={apt.availability === 'available' ? 'text-green-600' : 'text-muted-foreground'}>
                              {apt.availability || '—'}
                            </span>
                          </TableCell>
                          <TableCell>{stock[apt.type] ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => navigate(`/booking?project=${project.id}`)}>Book This Property</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

