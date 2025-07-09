
import { Phone, Mail, MapPin, Calendar, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo size="lg" className="text-accent" />
              <div>
                <h3 className="text-xl font-bold">Huda Engineering PLC</h3>
                <p className="text-primary-foreground/80">Building Ethiopia's Modern Future</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md">
              We are a leading construction and real estate development company based in Addis Ababa, 
              dedicated to delivering high-quality residential, commercial, and mixed-use buildings 
              with zero litigation history.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="text-sm">Established 2009 E.C (2017 G.C)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-accent" />
                <span className="text-sm">50+ Projects Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm">Zero Legal Disputes</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-primary-foreground/80 hover:text-accent transition-colors">Our Services</Link></li>
              <li><Link to="/projects" className="text-primary-foreground/80 hover:text-accent transition-colors">Projects</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Addis Ababa, Ethiopia</p>
                  <p className="text-xs text-primary-foreground/70">Serving all of Ethiopia</p>
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
              © 2024 Huda Engineering PLC. All rights reserved.
            </div>
            <div className="text-sm text-primary-foreground/80">
              Quality • Safety • Integrity • Excellence
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
