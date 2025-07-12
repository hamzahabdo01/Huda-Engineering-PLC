
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainNavItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const servicesDropdown = [
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.virtualTour"), path: "/virtual-tour" },
  ];

  const resourcesDropdown = [
    { name: t("nav.booking"), path: "/booking" },
    { name: t("nav.announcements"), path: "/announcements" },
    { name: t("nav.maps"), path: "/maps" },
  ];

  const isActiveDropdown = (items: { path: string }[]) => {
    return items.some(item => location.pathname === item.path);
  };

  const DropdownComponent = ({ 
    title, 
    items, 
    isActive 
  }: { 
    title: string; 
    items: { name: string; path: string }[]; 
    isActive: boolean 
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-1 hover:text-primary ${
            isActive ? "text-primary font-semibold" : "text-foreground"
          }`}
        >
          {title}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link 
              to={item.path}
              className={`cursor-pointer ${
                location.pathname === item.path ? "bg-accent" : ""
              }`}
            >
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
          <div className="hidden lg:flex items-center space-x-8">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors ${
                  location.pathname === item.path
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <DropdownComponent
              title={t("nav.servicesDropdown")}
              items={servicesDropdown}
              isActive={isActiveDropdown(servicesDropdown)}
            />
            
            <DropdownComponent
              title={t("nav.resourcesDropdown")}
              items={resourcesDropdown}
              isActive={isActiveDropdown(resourcesDropdown)}
            />
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
              {/* Main Navigation */}
              {mainNavItems.map((item) => (
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
              
              {/* Services Section */}
              <div className="pt-2 border-t border-border">
                <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("nav.servicesDropdown")}
                </h3>
                {servicesDropdown.map((item) => (
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
              
              {/* Resources Section */}
              <div className="pt-2 border-t border-border">
                <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("nav.resourcesDropdown")}
                </h3>
                {resourcesDropdown.map((item) => (
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
