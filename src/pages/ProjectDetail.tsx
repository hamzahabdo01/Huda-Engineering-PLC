import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface ApartmentType {
  id?: string;
  type: string;
  size?: string;
  availability?: "available" | "sold" | "reserved";
  price?: string;
}

interface FloorPlan {
  id?: string;
  floor_number: number;
  floor_url?: string;
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
  gallery_urls?: string[];
  Amenities?: string[];
  units?: Record<string, string>;
  floor_plans?: FloorPlan[];
  latitude?: number | null;
  longitude?: number | null;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        setProject(data as unknown as Project);
        fetchStock(data.id);
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  const fetchStock = async (projectId: string) => {
    const { data, error } = await supabase
      .from("unit_stock")
      .select("unit_type,total_units,booked_units")
      .eq("property_id", projectId);
    if (!error && data) {
      const map: Record<string, number> = {};
      data.forEach((row: any) => {
        map[row.unit_type] = (row.total_units ?? 0) - (row.booked_units ?? 0);
      });
      setStock(map);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-muted-foreground">
            Loading project...
          </div>
        </main>
        <Footer />
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-muted-foreground">
            Project not found.
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => navigate("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );

  const statusBadge = (
    <Badge
      variant={
        project.status === "completed"
          ? "secondary"
          : project.status === "active"
          ? "default"
          : "outline"
      }
      className={project.status === "active" ? "bg-green-600 text-white" : ""}
    >
      {project.status}
    </Badge>
  );

  // navigate to dedicated apartment page
  const handleNavigateApartment = (type: string) => {
    navigate(`/projects/${project?.id}/apartment/${encodeURIComponent(type)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-14">
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/30"
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
            {statusBadge}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {project.project_type}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {project.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />{" "}
              {new Date(project.start_date).toLocaleDateString()}{" "}
              {project.end_date
                ? `- ${new Date(project.end_date).toLocaleDateString()}`
                : ""}
            </div>
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
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full max-h-[420px] object-cover rounded"
              />
            )}
            <p className="text-muted-foreground">
              {project.description || project.short_description}
            </p>
            {project.Amenities && project.Amenities.length > 0 && (
              <div>
                <div className="font-medium mb-2">Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {project.Amenities.map((a, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {project.units && Object.keys(project.units).length > 0 && (
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
                      <TableCell>{stock[type] ?? "—"}</TableCell>
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
    <CardTitle>Apartment Types</CardTitle>
  </CardHeader>
  <CardContent>
    {(() => {
      const typeMap: Record<
        string,
        { sizes: Set<string>; image?: string }
      > = {};

      project.floor_plans?.forEach((floor) => {
        floor.apartment_types.forEach((apt) => {
          const key = apt.type;
          if (!typeMap[key]) {
            typeMap[key] = { sizes: new Set<string>(), image: apt.image_url || floor.floor_url };
          }
          if (apt.size) typeMap[key].sizes.add(apt.size);
          if (apt.image_url) typeMap[key].image = apt.image_url;
        });
      });

      const entries = Object.entries(typeMap);
      if (entries.length === 0)
        return (
          <div className="text-muted-foreground">
            No apartment types available.
          </div>
        );

      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(([type, { sizes, image }]) => (
              <div
                key={type}
                role="button"
                tabIndex={0}
                onClick={() => handleNavigateApartment(type)}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNavigateApartment(type);
                  }
                }}
                className="border rounded-lg p-4 aspect-square flex flex-col items-center justify-between text-center cursor-pointer hover:shadow-md transition"
                aria-label={`View ${type} overview`}
              >
                <div className="text-lg font-semibold mb-2">{type}</div>
                {image ? (
                  <img
                    src={image}
                    alt={type}
                    className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                      setIsGalleryOpen(true);
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-muted-foreground cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    No Image
                  </div>
                )}
                <div className="flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
                  {Array.from(sizes).map((s) => (
                    <span
                      key={s}
                      className="inline-block px-2 py-1 bg-yellow-400 text-black font-medium rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" />
              </div>
            ))}
          </div>

          {/* Lightbox dialog for image preview */}
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Apartment Image Preview</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Apartment preview"
                    className="max-h-[70vh] rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">No image available.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    })()}
  </CardContent>
</Card>


        {project.latitude != null && project.longitude != null && (
          <Card>
            <CardHeader>
              <CardTitle>Project Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-video rounded overflow-hidden border">
                <iframe
                  title="Project Map"
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${project.latitude},${project.longitude}&z=16&output=embed`}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Removed project-level gallery dialog; apartment types now navigate to dedicated page */}

      <Footer />
    </div>
  );
}
