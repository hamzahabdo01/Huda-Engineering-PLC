
import { Phone, Mail, MapPin, Calendar, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo size="lg" variant="icon" />
              <div>
                <h3 className="text-xl font-bold">Huda Engineering PLC</h3>
                <p className="text-primary-foreground/80">{t("footer.tagline")}</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md">
              {t("footer.companyDesc")}
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="text-sm">{t("footer.established")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-accent" />
                <span className="text-sm">{t("footer.projectsCompleted")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm">{t("footer.zeroDisputes")}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors">{t("footer.home")}</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/services" className="text-primary-foreground/80 hover:text-accent transition-colors">{t("footer.ourServices")}</Link></li>
              <li><Link to="/projects" className="text-primary-foreground/80 hover:text-accent transition-colors">{t("nav.projects")}</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer.contactInfo")}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("hero.locationValue")}</p>
                  <p className="text-xs text-primary-foreground/70">{t("footer.servingEthiopia")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-sm">+251-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-sm">info@hudaengineering.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-primary-foreground/80 mb-4 md:mb-0">
              © 2024 Huda Engineering PLC. {t("footer.allRights")}
            </div>
            <div className="text-sm text-primary-foreground/80">
              {t("footer.values")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
