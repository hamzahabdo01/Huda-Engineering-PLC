import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, ChefHat, Sofa, Bath, Maximize, Play, ArrowLeft, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const VirtualTour = () => {
  const { t } = useTranslation();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [viewAngle, setViewAngle] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTours = async () => {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (!error) setTours(data || []);
      setLoading(false);
    };
    loadTours();
  }, []);

  const roomIconMap: Record<string, any> = {
    bedroom: Bed,
    kitchen: ChefHat,
    livingroom: Sofa,
    bathroom: Bath,
    balcony: Maximize,
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVRMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setViewAngle({
      x: (y - 0.5) * 60, // Vertical rotation
      y: (x - 0.5) * 180 // Horizontal rotation
    });
  };

  const startVRTour = (roomId: string) => {
    setSelectedRoom(roomId);
    setIsVRMode(true);
  };

  const exitVR = () => {
    setIsVRMode(false);
    setSelectedRoom(null);
    setViewAngle({ x: 0, y: 0 });
    setZoom(1);
  };

  const getCurrentTour = () => tours.find(t => t.id === selectedRoom);

  if (isVRMode && selectedRoom) {
    const current = getCurrentTour();
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* VR Controls */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <Button onClick={exitVR} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit VR
          </Button>
          <Button 
            onClick={() => setViewAngle({ x: 0, y: 0 })} 
            variant="secondary" 
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))} 
            variant="secondary" 
            size="sm"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))} 
            variant="secondary" 
            size="sm"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Room Info */}
        <div className="absolute top-4 right-4 z-50">
          <Card className="bg-black/80 text-white border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{current?.title}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* VR Viewport */}
        <div 
          className="w-full h-screen cursor-move"
          onMouseMove={handleMouseMove}
          style={{
            background: current?.thumbnail_url ? `url(${current.thumbnail_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${zoom}) rotateX(${viewAngle.x}deg) rotateY(${viewAngle.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            {current?.video_url && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <video src={current.video_url} controls className="w-full h-auto max-h-full rounded" />
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Badge variant="secondary" className="bg-black/80 text-white">
            Move mouse to look around • Use zoom controls to get closer
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {t("virtualTour.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t("virtualTour.description")}
          </p>
          <Badge className="mb-8">
            <Play className="h-4 w-4 mr-2" />
            Interactive 3D Experience
          </Badge>
        </div>
      </section>

      {/* Tours Selection */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              {t("virtualTour.selectRoom")}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => {
              const IconComponent = roomIconMap[tour.room] || Sofa;
              return (
                <Card 
                  key={tour.id} 
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => startVRTour(tour.id)}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {tour.thumbnail_url ? (
                      <img
                        src={tour.thumbnail_url}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">No thumbnail</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-primary-foreground">
                        <IconComponent className="h-4 w-4 mr-2" />
                        {tour.room}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button className="w-full bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                        <Play className="h-4 w-4 mr-2" />
                        {t("virtualTour.startTour")}
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {tour.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tour.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VirtualTour;