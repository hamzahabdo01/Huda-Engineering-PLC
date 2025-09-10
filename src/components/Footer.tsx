import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Users,
  Facebook,
  Instagram,
  Youtube,
  TrendingUp,
  Navigation,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const Footer = () => {
  const { t } = useTranslation();

  const companyLocation = {
    lat: 9.005401,
    lng: 38.763611,
    address: "Bole Sub City, Wereda 03, Addis Ababa, Ethiopia",
  };

  const markerIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Logo size="lg" className="text-accent" />
              <div>
                <h3 className="text-xl font-bold">Huda Engineering PLC</h3>
                <p
                  className="text-lg font-semibold bg-gradient-to-r from-yellow-400 to-green-500
            bg-clip-text text-transparent drop-shadow-md animate-pulse 
            transition-all duration-300 hover:scale-105 hover:drop-shadow-xl"
                >
                  Trustworthy Real Estate
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="text-sm">{t("footer.established")}</span>
              </div>
            </div>
            {/* Social Media Icons */}
            <div className="flex space-x-5">
              {/* ...social links unchanged... */}
              <a
                href="https://www.facebook.com/profile.php?id=100085425223137&mibextid=wwXIfr&mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/huda_engineering_plc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@huda.engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                aria-label="TikTok"
              >
                <TrendingUp className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@HudaEngineeringplc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Leaflet Map - Centered and Wide */}
          <div className="bg-white text-foreground p-4 rounded-lg shadow-md lg:col-span-1 min-w-[350px] max-w-full flex flex-col justify-center">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Our Location
            </h4>
            <div className="w-full h-56 rounded-lg overflow-hidden mb-4 shadow">
              <MapContainer
                center={[companyLocation.lat, companyLocation.lng]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={[companyLocation.lat, companyLocation.lng]}
                  icon={markerIcon}
                >
                  <Popup>{companyLocation.address}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Location: Apartment Amnen Building 2nd floor, behind Abyssinia
              Plaza
            </p>
            <div className="flex space-x-3">
              <a
                href="https://maps.app.goo.gl/nmv2qvBH7TpsnVTb6?g_st=it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <MapPin className="w-4 h-4" /> View Map
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center justify-end">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.contactInfo")}
              </h4>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("hero.locationValue")}
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    Apartment Amnen Building 2nd floor, <br />
                    behind Abyssinia Plaza
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <a href="tel:+251940666661" className="text-sm hover:underline">
                  +251 94 066 6661
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent" />
                <a href="tel:+251112345678" className="text-sm hover:underline">
                  +251 94 066 6662
                </a>
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
              © 2026 Huda Engineering PLC. {t("footer.allRights")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
