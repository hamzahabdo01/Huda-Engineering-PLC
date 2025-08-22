import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: string;
  title: string;
  created_at: string;
  category: string;
  short_description: string;
  content: string;
  image_url?: string | null;
}

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setAnnouncement(data as Announcement);
          setImgSrc(data.image_url || "/placeholder.svg");
        } else {
          setAnnouncement(null);
          setImgSrc("/placeholder.svg");
        }
      } catch (err) {
        console.error("Failed to fetch announcement:", err);
        setAnnouncement(null);
        setImgSrc("/placeholder.svg");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAnnouncement();
    else {
      setLoading(false);
      setImgSrc("/placeholder.svg");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-6">Announcement not found.</p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/announcements")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Announcements
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/announcements")}
              className="flex items-center gap-2 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Announcements</span>
            </Button>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{announcement.category}</span>
          </div>
        </div>

        <div className="mt-2 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={announcement.title}
                className="rounded-2xl shadow w-full object-cover max-h-[560px]"
                onError={() => {
                  if (imgSrc !== "/placeholder.svg") setImgSrc("/placeholder.svg");
                }}
              />
            ) : (
              <div className="rounded-2xl shadow w-full h-64 bg-gray-100 flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-3">{announcement.title}</h1>
            <p className="text-muted-foreground mb-6">{announcement.short_description}</p>
            <div className="prose max-w-none whitespace-pre-line">{announcement.content}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}