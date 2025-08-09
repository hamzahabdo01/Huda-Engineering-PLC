import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // أيقونة منزل اختيارية

const BackToHomeButton = () => {
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHome || !showButton) return null;

  return (
    <button
      onClick={() => navigate("/")}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2
                 bg-primary/70 text-white rounded-full shadow-md
                 backdrop-blur-md hover:bg-primary hover:shadow-lg
                 transition-all duration-300"
    >
      <Home className="w-4 h-4" />
      <span className="text-sm font-medium">Back to Home</span>
    </button>
  );
};

export default BackToHomeButton;
