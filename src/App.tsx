import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazyLoad } from "@/utils/lazyLoad";
import ScrollToTop from "./components/ScrollToTop";
import BackToHomeButton from "./components/BackToHomeButton";

// Lazy load pages for better performance
const Index = lazyLoad(() => import("./pages/Index"));
const About = lazyLoad(() => import("./pages/About"));
const Services = lazyLoad(() => import("./pages/Services"));
const Projects = lazyLoad(() => import("./pages/Projects"));
const ProjectDetail = lazyLoad(() => import("./pages/ProjectDetail"));
const ApartmentDetail = lazyLoad(() => import("./pages/ApartmentDetail"));
const Contact = lazyLoad(() => import("./pages/Contact"));
const Auth = lazyLoad(() => import("./pages/Auth"));
const AdminDashboard = lazyLoad(() => import("./pages/AdminDashboard"));
const Booking = lazyLoad(() => import("./pages/Booking"));
const Announcements = lazyLoad(() => import("./pages/Announcements"));
const AnnouncementDetail = lazyLoad(() => import("./pages/AnnouncementDetail"));
const Maps = lazyLoad(() => import("./pages/Maps"));
const VirtualTour = lazyLoad(() => import("./pages/VirtualTour"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <BackToHomeButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/apartment/:type" element={<ApartmentDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/virtual-tour" element={<VirtualTour />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
