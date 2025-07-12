
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.virtualTour"), path: "/virtual-tour" },
    { name: t("nav.booking"), path: "/booking" },
    { name: t("nav.announcements"), path: "/announcements" },
    { name: t("nav.contact"), path: "/contact" },
    { name: t("nav.maps"), path: "/maps" },
    { name: t("nav.admin"), path: "/admin" },
  ];

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Logo size="md" className="text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:block">Huda Engineering PLC</span>
            <span className="text-lg font-bold text-foreground sm:hidden">Huda</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden xl:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors text-sm ${
                  location.pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Language Selector and Mobile Menu */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            
            {/* Mobile menu button */}
            <button
              className="xl:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
