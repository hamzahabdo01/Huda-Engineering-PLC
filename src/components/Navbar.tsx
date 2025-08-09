import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Projects", path: "/projects" },
    { name: "Services", path: "/services" },
    { name: "About Us", path: "/about" },
    { name: "Announcements", path: "/announcements" },
    { name: "Booking", path: "/booking" },
    { name: "Contact Us", path: "/contact" },
    { name: "Virtual Tour", path: "/virtual-tour" },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Signed out successfully" });
      navigate("/");
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 60 30">
      <clipPath id="t"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="s"><path d="M30,15 h30 v15 h-30 z v15 h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#t)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );

  const EthiopiaFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 6 4">
      <rect width="6" height="4" fill="#078930"/>
      <rect width="6" height="2.67" y="1.33" fill="#FCDD09"/>
      <rect width="6" height="1.33" y="2.67" fill="#DA121A"/>
    </svg>
  );

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Logo size="lg" variant="teal" className="text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:block">Huda Engineering PLC</span>
            <span className="text-lg font-bold text-foreground sm:hidden">Huda</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path}
                className={`transition-colors text-sm font-medium px-3 py-2 rounded-lg ${location.pathname === item.path ? "text-primary font-semibold bg-primary/10" : "text-foreground hover:text-primary hover:bg-primary/5"}`}>{item.name}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop language buttons */}
            <div className="hidden md:flex gap-2">
              <button title="English" onClick={() => changeLanguage("en")} className={`p-1 rounded border transform transition-transform hover:scale-110 ${i18n.language === "en" ? "bg-primary text-white" : "bg-white"}`}><UKFlag /></button>
              <button title="Amharic" onClick={() => changeLanguage("am")} className={`p-1 rounded border transform transition-transform hover:scale-110 ${i18n.language === "am" ? "bg-primary text-white" : "bg-white"}`}><EthiopiaFlag /></button>
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:block">{profile?.full_name || user.email}</span>
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow rounded-xl p-3 min-w-[200px] z-50">
                    <div className="px-3 py-2 text-sm text-muted-foreground">Signed in as <strong>{user.email}</strong></div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/admin-dashboard" className="w-full flex items-center gap-3 px-3 py-2"><Settings className="h-4 w-4" /><span className="font-medium">Dashboard</span></Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 hover:text-red-600"><LogOut className="h-4 w-4" /><span className="font-medium">Sign Out</span></button></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <button className="md:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"}`}>{item.name}</Link>
              ))}
              <div className="flex gap-2 mt-3">
                <button title="English" onClick={() => changeLanguage("en")} className={`p-1 rounded border transform transition-transform hover:scale-110 ${i18n.language === "en" ? "bg-primary text-white" : "bg-white"}`}><UKFlag /></button>
                <button title="Amharic" onClick={() => changeLanguage("am")} className={`p-1 rounded border transform transition-transform hover:scale-110 ${i18n.language === "am" ? "bg-primary text-white" : "bg-white"}`}><EthiopiaFlag /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
