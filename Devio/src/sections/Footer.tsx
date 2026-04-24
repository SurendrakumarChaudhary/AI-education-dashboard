import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Testimonials', 'FAQ'],
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Support'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="font-serif font-bold text-2xl">Devio</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Empowering developers to ace their interviews with AI-powered learning and personalized preparation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-gray-400 text-sm hover:text-orange-500 transition-colors relative group"
                    >
                      <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">•</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Devio. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Designed with ❤️ for aspiring developers
          </p>
        </div>
      </div>
    </footer>
  );
}
