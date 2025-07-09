
import { Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Building2 className="h-6 w-6 text-accent" />
            <span className="text-lg font-semibold">Huda Engineering PLC</span>
          </div>
          <div className="text-sm">
            © 2024 Huda Engineering PLC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
