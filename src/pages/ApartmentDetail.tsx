import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface ApartmentType {
  id?: string;
  type: string;
  size?: string;
  availability?: 'available' | 'sold' | 'reserved';
  price?: string;
  image_url?: string;
  description?: string;
  features?: string[];
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
  image_url: string;
  floor_plans?: FloorPlan[];
}

export default function ApartmentDetail() {
  const navigate = useNavigate();
  const { id, type } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
      if (data) setProject(data as unknown as Project);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const aptMeta = useMemo(() => {
    if (!project || !type) return null;
    const lower = decodeURIComponent(type).toLowerCase();
    for (const floor of project.floor_plans || []) {
      for (const apt of floor.apartment_types) {
        if ((apt.type || '').toLowerCase() === lower) {
          return { floor: floor.floor_number, ...apt } as ApartmentType & { floor: number };
        }
      }
    }
    return null;
  }, [project, type]);

  const featurePresets: Record<string, string[]> = {
    '2b': [
      'Spacious living room with natural light',
      'Two bedrooms with built-in closets',
      'Modern kitchen with storage cabinetry',
      'One shared bathroom + en-suite master bath',
    ],
    '3b': [
      'Large open-plan living and dining area',
      'Three bedrooms with master suite',
      'Balcony with city views',
      'Dedicated laundry and storage space',
    ],
    '4b': [
      'Family-sized living space with separate lounge',
      'Four bedrooms with ample storage',
      'Spacious kitchen with pantry',
      'Two balconies and premium finishes',
    ],
  };

  const features = useMemo(() => {
    const key = (type || '').toLowerCase();
    return featurePresets[key] || [
      'Thoughtful layout focused on functionality',
      'Quality finishes and materials',
      'Optimized ventilation and natural light',
    ];
  }, [type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-muted-foreground">Loading apartment details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project || !aptMeta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center text-muted-foreground">Apartment details not found.</div>
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-1"/> Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-14">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <Button variant="outline" className="bg-white/10 text-white border-white/30" onClick={() => navigate(`/projects/${project.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-1"/> Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold">{project.title} — {aptMeta.type}</h1>
          <Badge variant={aptMeta.availability === 'available' ? 'outline' : 'secondary'} className="capitalize ml-2">
            {aptMeta.availability || 'n/a'}
          </Badge>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Apartment Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <img
                src={aptMeta.image_url || project.image_url}
                alt={`${aptMeta.type} representative`}
                className="w-full max-h-[420px] object-cover rounded"
              />
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Floor {('floor' in aptMeta) ? (aptMeta as any).floor : '—'}</div>
              <div className="text-lg">
                <span className="font-medium">Size:</span> {aptMeta.size || '—'}
              </div>
              <div className="text-lg">
                <span className="font-medium">Price:</span> {aptMeta.price || '—'}
              </div>
              {aptMeta.description && (
                <div className="text-muted-foreground whitespace-pre-wrap">{aptMeta.description}</div>
              )}
              <div>
                <div className="font-medium mb-2">Features</div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {(aptMeta.features && aptMeta.features.length > 0 ? aptMeta.features : features).map((f, i) => (<li key={i}>{f}</li>))}
                </ul>
              </div>
              <div className="pt-2">
                <Button onClick={() => navigate(`/booking?project=${project.id}`)}>Book This Property</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

