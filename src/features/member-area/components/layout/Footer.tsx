import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Mail, Phone, Clock, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ml-0 md:ml-60 bg-gradient-to-br from-gray-50 to-blue-50 border-t border-blue-100 transition-all duration-300">
      <div className="w-full mx-auto px-4 py-8 md:px-6 md:py-12">
        
        {/* Mobile View - Compact & Minimalis */}
        <div className="block lg:hidden">
          {/* Logo & Social Media */}
          <div className="flex items-center justify-between mb-4">
            <img 
              src="/logo.png" 
              alt="Canvango Group" 
              className="h-8 w-auto"
            />
            
            <div className="flex items-center gap-2">
              <a 
                href="https://instagram.com/canvangogroup" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-gray-700" />
              </a>
              <a 
                href="https://facebook.com/canvangogroup" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-100 hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-gray-700" />
              </a>
              <a 
                href="https://wa.me/6289669654782" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-100 hover:bg-green-50 rounded-lg flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button 
              onClick={() => navigate('/akun-bm')} 
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-lg transition-colors"
            >
              Akun BM
            </button>
            <button 
              onClick={() => navigate('/akun-personal')} 
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-lg transition-colors"
            >
              Akun Personal
            </button>
            <button 
              onClick={() => navigate('/hubungi-kami')} 
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-lg transition-colors"
            >
              Kontak
            </button>
            <button 
              onClick={() => navigate('/pusat-keamanan')} 
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-lg transition-colors"
            >
              Keamanan
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Legal Links */}
          <div className="flex items-center justify-center gap-3 mb-3 text-xs text-gray-500">
            <button 
              onClick={() => navigate('/kebijakan-privasi')} 
              className="hover:text-gray-700 transition-colors"
            >
              Privasi
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => navigate('/syarat-ketentuan')} 
              className="hover:text-gray-700 transition-colors"
            >
              Syarat & Ketentuan
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-400">
            © {currentYear} PT Canvango Group. All rights reserved.
          </div>
        </div>

        {/* Desktop View - Modern Minimalist with Blue Accent */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-8 mb-8">
              {/* Column 1 - Brand & Description */}
              <div>
                <div className="mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Canvango Group" 
                    className="h-10 w-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Platform digital terpercaya untuk kebutuhan akun dan layanan media sosial Anda.
                </p>
                
                {/* Social Media Icons - Modern Style */}
                <div className="flex space-x-2">
                  <a 
                    href="https://instagram.com/canvangogroup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-white hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </a>
                  
                  <a 
                    href="https://facebook.com/canvangogroup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-white hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </a>
                  
                  <a 
                    href="https://wa.me/6289669654782" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 bg-white hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>

              {/* Column 2 - Informasi */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Informasi
                </h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-4"></div>
                <ul className="space-y-2.5">
                  <li>
                    <button 
                      onClick={() => navigate('/kebijakan-privasi')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Kebijakan Privasi</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/syarat-ketentuan')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Syarat & Ketentuan</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/pusat-keamanan')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Pusat Keamanan</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/hubungi-kami')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Hubungi Kami</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3 - Produk & Layanan */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Produk & Layanan
                </h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-4"></div>
                <ul className="space-y-2.5">
                  <li>
                    <button 
                      onClick={() => navigate('/akun-personal')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Akun Personal</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/akun-bm')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Akun Business Manager</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/jasa-verified-bm')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Jasa Verified BM</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate('/claim-garansi')} 
                      className="group text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>Klaim Garansi</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4 - Kontak */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Kontak
                </h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-4"></div>
                <ul className="space-y-3">
                  <li className="group">
                    <a 
                      href="mailto:support@canvangogroup.com" 
                      className="flex items-start gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="break-all pt-1">support@canvangogroup.com</span>
                    </a>
                  </li>
                  <li className="group">
                    <a 
                      href="tel:+6289669654782" 
                      className="flex items-start gap-2.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="pt-1">+62-896-6965-4782</span>
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="pt-1">Senin - Minggu<br/>09:00 - 21:00 WIB</span>
                  </li>
                </ul>
              </div>
            </div>

          {/* Bottom Copyright - Minimalist */}
          <div className="pt-6 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                © {currentYear} PT CANVANGO GROUP
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">All rights reserved</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
