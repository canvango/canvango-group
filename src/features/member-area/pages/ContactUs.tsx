import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faClock, faMapMarkerAlt, faComments, faPaperPlane, faArrowUp, faHome, faInfinity, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import LegalFooter from '../components/layout/LegalFooter';

const ContactUs: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/dashboard')} className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Canvango Group" 
                className="h-10 w-auto"
              />
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => navigate('/akun-bm')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <FontAwesomeIcon icon={faInfinity} className="w-4 h-4" />
                <span>Akun BM</span>
              </button>
              <button
                onClick={() => navigate('/akun-personal')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
                <span>Akun Personal</span>
              </button>
              <button
                onClick={() => navigate('/pusat-keamanan')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4" />
                <span>Keamanan</span>
              </button>
            </nav>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Masuk
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="relative w-full mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm mb-6">
              <FontAwesomeIcon icon={faComments} className="w-4 h-4" />
              <span className="text-sm">Layanan Pelanggan</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Hubungi Kami
            </h1>
            <p className="text-base md:text-lg text-green-100 mb-2 leading-relaxed max-w-2xl mx-auto">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui saluran komunikasi resmi berikut.
            </p>
            
            {/* Response Time Badge */}
            <div className="inline-flex items-center gap-2 bg-green-900 bg-opacity-50 rounded-2xl px-4 py-2 backdrop-blur-sm mt-6">
              <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
              <span className="text-sm font-semibold">Respon Maksimal 1x24 Jam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <main>
            {/* Contact Cards */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faEnvelope} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Resmi</h3>
                  <p className="text-sm text-gray-600 mb-4">Kirim pertanyaan atau keluhan Anda melalui email</p>
                  <a 
                    href="mailto:support@canvangogroup.com" 
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group"
                  >
                    <span>support@canvangogroup.com</span>
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Respon dalam 1x24 jam kerja</p>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faPhone} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp CS</h3>
                  <p className="text-sm text-gray-600 mb-4">Hubungi customer service kami via WhatsApp</p>
                  <a 
                    href="https://wa.me/6289669654782" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm group"
                  >
                    <span>+62-896-6965-4782</span>
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Chat langsung dengan CS kami</p>
                  </div>
                </div>

                {/* Working Hours Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-lg border border-yellow-200 p-6 md:p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Jam Operasional</h3>
                  <p className="text-sm text-gray-600 mb-4">Waktu layanan customer service</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Senin - Minggu</span>
                      <span className="text-sm text-gray-700">09:00 - 21:00 WIB</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="text-xs text-gray-600">Di luar jam operasional, pesan Anda akan dibalas pada hari kerja berikutnya</p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg border border-purple-200 p-6 md:p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Alamat Kantor</h3>
                  <p className="text-sm text-gray-600 mb-4">Lokasi badan usaha kami</p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    Jl WR Supratman 37<br />
                    Jakarta Pusat, DKI Jakarta 15412<br />
                    Indonesia
                  </p>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-xs text-gray-600">Untuk keperluan korespondensi resmi</p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Quick Links */}
            <section className="mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Pertanyaan Umum</h2>
                <p className="text-sm text-gray-600 mb-6">Sebelum menghubungi kami, cek apakah pertanyaan Anda sudah terjawab di sini</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Cara Top-Up Saldo', desc: 'Panduan lengkap top-up saldo', link: '/tutorials' },
                    { title: 'Klaim Garansi', desc: 'Proses klaim garansi produk', link: '/claim-warranty' },
                    { title: 'Kebijakan Privasi', desc: 'Perlindungan data pribadi', link: '/privacy-policy' },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(item.link)}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24 opacity-10"></div>
                
                <div className="relative">
                  <FontAwesomeIcon icon={faComments} className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    Butuh Bantuan Segera?
                  </h2>
                  <p className="text-sm text-green-100 leading-relaxed mb-6 max-w-2xl mx-auto">
                    Tim customer service kami siap membantu Anda. Hubungi kami melalui WhatsApp untuk respon yang lebih cepat.
                  </p>
                  <a
                    href="https://wa.me/6289669654782?text=Halo,%20saya%20butuh%20bantuan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 text-sm font-medium rounded-xl hover:bg-green-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPhone} className="w-5 h-5 mr-2" />
                    Chat via WhatsApp
                  </a>
                </div>
              </div>
            </section>

            {/* Important Note */}
            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Catatan Penting</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Pastikan Anda menghubungi kontak resmi yang tertera di halaman ini</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Kami tidak pernah meminta transfer ke rekening pribadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Waspada penipuan yang mengatasnamakan Canvango Group</span>
                  </li>
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <LegalFooter />
    </div>
  );
};

export default ContactUs;
