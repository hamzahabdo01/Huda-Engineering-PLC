
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const primaryNavItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
  ];

  const servicesDropdown = [
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.virtualTour"), path: "/virtual-tour" },
  ];

  const businessDropdown = [
    { name: t("nav.booking"), path: "/booking" },
    { name: t("nav.announcements"), path: "/announcements" },
    { name: t("nav.maps"), path: "/maps" },
  ];

  const contactNavItems = [
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isDropdownActive = (items: { path: string }[]) => 
    items.some(item => location.pathname === item.path);

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
          <div className="hidden lg:flex items-center space-x-6">
            {primaryNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors text-sm font-medium ${
                  isActive(item.path)
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium ${
                    isDropdownActive(servicesDropdown)
                      ? "text-primary font-semibold"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {t("nav.services")} <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {servicesDropdown.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link 
                      to={item.path}
                      className={`w-full ${
                        isActive(item.path) ? "text-primary font-semibold" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Business Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium ${
                    isDropdownActive(businessDropdown)
                      ? "text-primary font-semibold"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {t("nav.business")} <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {businessDropdown.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link 
                      to={item.path}
                      className={`w-full ${
                        isActive(item.path) ? "text-primary font-semibold" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {contactNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors text-sm font-medium ${
                  isActive(item.path)
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
              className="lg:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Services Section */}
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("nav.services")}
                </div>
                <div className="mt-1 space-y-1">
                  {servicesDropdown.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
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

              {/* Mobile Business Section */}
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("nav.business")}
                </div>
                <div className="mt-1 space-y-1">
                  {businessDropdown.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
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

              {contactNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
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
