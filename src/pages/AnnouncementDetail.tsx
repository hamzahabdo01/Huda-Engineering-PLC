import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  created_at: string;
  category: string;
  short_description: string;
  content: string;
  image_url: string;
}

export default function AnnouncementDetail() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setAnnouncement(data as Announcement);
      setLoading(false);
    };
    fetchAnnouncement();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!announcement) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/announcements" className="text-primary underline">Back to Announcements</Link>
        <div className="mt-6 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <img src={announcement.image_url} alt={announcement.title} className="rounded-2xl shadow" />
          </div>
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(announcement.created_at).toLocaleDateString()}
            </div>
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