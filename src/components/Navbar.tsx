
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.booking"), path: "/booking" },
  ];

  const viewItems = [
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.virtualTour"), path: "/virtual-tour" },
    { name: t("nav.announcements"), path: "/announcements" },
    { name: t("nav.maps"), path: "/maps" },
  ];

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Logo size="md" variant="compact" />
            <span className="text-xl font-bold text-foreground hidden sm:block">Huda Engineering PLC</span>
            <span className="text-lg font-bold text-foreground sm:hidden">Huda</span>
          </Link>
          
          {/* Desktop/Tablet Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors text-sm font-medium px-3 py-2 rounded-lg ${
                  location.pathname === item.path
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* View Dropdown - Modern UX Style */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-all duration-300 bg-gradient-to-r from-transparent to-transparent hover:from-primary/5 hover:to-primary/10 px-3 py-2 rounded-lg border border-transparent hover:border-primary/20 hover:shadow-lg backdrop-blur-sm group">
                {t("nav.view")}
                <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-3 min-w-[220px] z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
              >
                <div className="space-y-1">
                  {viewItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        to={item.path}
                        className={`w-full cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:shadow-md flex items-center gap-3 ${
                          location.pathname === item.path 
                            ? "bg-primary/15 text-primary shadow-lg border border-primary/20" 
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book Property */}
            <Link
              to="/booking"
              className={`transition-colors text-sm font-medium px-3 py-2 rounded-lg ${
                location.pathname === "/booking"
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              {t("nav.booking")}
            </Link>

            {/* Contact Link */}
            <Link
              to="/contact"
              className={`transition-all duration-300 text-sm font-medium px-3 py-2 rounded-lg ${
                location.pathname === "/contact"
                  ? "text-white bg-primary shadow-lg"
                  : "text-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20"
              }`}
            >
              {t("nav.contact")}
            </Link>
          </div>

          {/* Language Selector and Mobile Menu */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                if (isMenuOpen) {
                  setIsMobileViewOpen(false);
                }
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navItems.slice(0, 3).map((item) => (
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
              
              {/* Mobile View Dropdown */}
              <div className="pt-2">
                <button
                  onClick={() => setIsMobileViewOpen(!isMobileViewOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                >
                  <span>{t("nav.view")}</span>
                  {isMobileViewOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {/* Collapsible View Items */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  isMobileViewOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pl-4 space-y-1 pt-2">
                    {viewItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          location.pathname === item.path
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:text-primary hover:bg-muted"
                        }`}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsMobileViewOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Booking Link */}
              <Link
                to="/booking"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === "/booking"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.booking")}
              </Link>

              {/* Mobile Contact Link */}
              <Link
                to="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === "/contact"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
