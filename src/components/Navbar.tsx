import { memo, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = memo(() => {
  const { t, changeLanguage, languageInfo } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { key: "nav.projects", path: "/projects" },
      { key: "nav.services", path: "/services" },
      { key: "nav.about", path: "/about" },
      { key: "nav.announcements", path: "/announcements" },
      { key: "nav.book", path: "/booking" },
      { key: "nav.contact", path: "/contact" },
      { key: "nav.virtualTour", path: "/virtual-tour" },
    ],
    []
  );

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t("errors.error"),
        description: t("errors.signOutFailed"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("auth.signedOut"),
        description: t("auth.signedOutDesc"),
      });
      navigate("/");
    }
  }, [signOut, toast, t, navigate]);

  const handleLanguageChange = useCallback(
    (lang: string) => {
      changeLanguage(lang);
    },
    [changeLanguage]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Memoized flag components
  const UKFlag = useMemo(
    () => () =>
      (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="16"
          viewBox="0 0 60 30"
        >
          <clipPath id="t">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="s">
            <path d="M30,15 h30 v15 h-30 z v15 h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#t)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path
              d="M0,0 L60,30 M60,0 L0,30"
              stroke="#C8102E"
              strokeWidth="4"
              clipPath="url(#s)"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      ),
    []
  );

  const EthiopiaFlag = useMemo(
    () => () =>
      (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="16"
          viewBox="0 0 6 4"
        >
          <rect width="6" height="4" fill="#078930" />
          <rect width="6" height="2.67" y="1.33" fill="#FCDD09" />
          <rect width="6" height="1.33" y="2.67" fill="#DA121A" />
        </svg>
      ),
    []
  );

  // Memoized navigation items rendering
  const renderNavItems = useCallback(
    () =>
      navItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          className={`transition-all duration-200 text-sm font-medium px-4 py-2 rounded-xl relative overflow-hidden group ${
            location.pathname === item.path
              ? "text-primary font-semibold bg-primary/10"
              : "text-foreground hover:text-primary hover:bg-primary/5"
          }`}
        >
          <span className="relative z-10">{t(item.key)}</span>
          {location.pathname === item.path && (
            <div className="absolute inset-0 bg-primary/10 rounded-xl" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </Link>
      )),
    [navItems, location.pathname, t]
  );

  // Memoized mobile navigation items
  const renderMobileNavItems = useCallback(
    () =>
      navItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          onClick={closeMenu}
          className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
            location.pathname === item.path
              ? "text-primary bg-primary/10 border border-primary/20"
              : "text-foreground hover:text-primary hover:bg-primary/5"
          }`}
        >
          {t(item.key)}
        </Link>
      )),
    [navItems, location.pathname, t, closeMenu]
  );

  return (
    <nav className="bg-background/95 backdrop-blur-sm shadow-lg border-b border-border sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center group">
            <Logo
              size="lg"
              variant="teal"
              className="text-primary transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-foreground hidden sm:block ml-2 group-hover:text-primary transition-colors">
              Huda Engineering PLC
            </span>
            <span className="text-lg font-bold text-foreground sm:hidden ml-2 group-hover:text-primary transition-colors">
              Huda
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {renderNavItems()}
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop language buttons */}
            <div className="hidden md:flex gap-2">
              <button
                title="English"
                onClick={() => handleLanguageChange("en")}
                className={`p-1 rounded border transform transition-transform hover:scale-110 ${
                  languageInfo.current === "en"
                    ? "bg-primary text-white"
                    : "bg-white"
                }`}
              >
                <UKFlag />
              </button>
              <button
                title="Amharic"
                onClick={() => handleLanguageChange("am")}
                className={`p-1 rounded border transform transition-transform hover:scale-110 ${
                  languageInfo.current === "am"
                    ? "bg-primary text-white"
                    : "bg-white"
                }`}
              >
                <EthiopiaFlag />
              </button>
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:block">
                      {profile?.full_name || user.email}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-background border shadow rounded-xl p-3 min-w[200px] z-50"
                  >
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {t("navbar.signedInAs")} <strong>{user.email}</strong>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin-dashboard"
                        className="w-full flex items-center gap-3 px-3 py-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">
                          {t("navbar.dashboard")}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">
                          {t("navbar.signOut")}
                        </span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-md text-foreground hover:text-primary hover:bg-muted"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
              {renderMobileNavItems()}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <button
                  title="English"
                  onClick={() => handleLanguageChange("en")}
                  className={`p-2 rounded-lg border-2 transform transition-all duration-200 hover:scale-105 ${
                    languageInfo.current === "en"
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-300 hover:border-primary/50"
                  }`}
                >
                  <UKFlag />
                </button>
                <button
                  title="Amharic"
                  onClick={() => handleLanguageChange("am")}
                  className={`p-2 rounded-lg border-2 transform transition-all duration-200 hover:scale-105 ${
                    languageInfo.current === "am"
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-300 hover:border-primary/50"
                  }`}
                >
                  <EthiopiaFlag />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
