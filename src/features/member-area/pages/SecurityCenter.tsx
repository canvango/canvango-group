import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faClock, faMapMarkerAlt, faGlobe, faShield, faLock, faDatabase, faChartLine, faQuestionCircle, faExclamationTriangle, faCheckCircle, faChevronDown, faChevronUp, faArrowUp, faHome, faInfinity, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import LegalFooter from '../components/layout/LegalFooter';

const SecurityCenter: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Bagaimana cara memastikan website Canvango Group yang asli?",
      answer: "Pastikan URL yang Anda akses adalah www.canvangogroup.com (perhatikan ejaan yang benar). Periksa adanya ikon gembok di address bar browser yang menandakan koneksi aman (HTTPS). Verifikasi kontak resmi kami melalui informasi yang tertera di halaman ini. Jangan mengakses link dari sumber tidak terpercaya."
    },
    {
      question: "Bagaimana cara menghubungi CS resmi Canvango Group?",
      answer: "CS resmi kami dapat dihubungi melalui email support@canvangogroup.com atau nomor WhatsApp +62-896-6965-4782. Jam operasional kami adalah Senin-Minggu, 09:00-21:00 WIB. Kami TIDAK PERNAH menghubungi Anda terlebih dahulu untuk menawarkan produk atau meminta transfer."
    },
    {
      question: "Bagaimana cara transaksi yang aman?",
      answer: "Selalu login dari website resmi www.canvangogroup.com. Gunakan metode pembayaran yang tersedia di halaman Top-Up (QRIS, Virtual Account, E-Wallet). Jangan pernah transfer ke rekening pribadi. Periksa riwayat transaksi Anda secara berkala di dashboard. Logout setelah selesai bertransaksi."
    },
    {
      question: "Apa yang harus dilakukan jika menemukan penipuan?",
      answer: "Segera laporkan ke CS resmi kami melalui email support@canvangogroup.com atau WhatsApp +62-896-6965-4782. Sertakan screenshot atau bukti penipuan. JANGAN transfer uang atau memberikan informasi pribadi kepada pihak yang mencurigakan. Bantu kami dengan menyebarkan informasi ini kepada pengguna lain."
    },
    {
      question: "Apakah data saya aman di Canvango Group?",
      answer: "Ya, kami menggunakan enkripsi SSL/TLS 256-bit untuk melindungi semua data Anda. Server kami dilindungi dengan sistem anti-DDoS dan firewall. Data di-backup secara otomatis setiap hari. Kami mematuhi UU Perlindungan Data Pribadi Indonesia. Password Anda disimpan dalam bentuk hash yang tidak dapat dibalik."
    },
    {
      question: "Bagaimana sistem garansi produk bekerja?",
      answer: "Garansi HANYA berlaku untuk pembelian melalui website resmi www.canvangogroup.com. Periode garansi tertera pada deskripsi masing-masing produk. Klaim dilakukan melalui menu 'Klaim Garansi' dengan menyertakan bukti screenshot. Tim kami akan memproses klaim maksimal 1x24 jam. Garansi tidak berlaku untuk kerusakan akibat kesalahan pengguna."
    },
    {
      question: "Mengapa saya harus logout setelah selesai?",
      answer: "Logout mencegah akses tidak sah ke akun Anda, terutama jika menggunakan perangkat bersama atau publik. Session yang tidak di-logout dapat dimanfaatkan orang lain untuk mengakses akun Anda. Meskipun sistem kami memiliki auto-logout, sebaiknya Anda logout manual untuk keamanan maksimal."
    },
    {
      question: "Bagaimana jika saya lupa password?",
      answer: "Klik tombol 'Lupa Password' di halaman login. Masukkan email yang terdaftar. Kami akan mengirimkan link reset password ke email Anda. Klik link tersebut dan buat password baru yang kuat (minimal 8 karakter, kombinasi huruf besar, kecil, angka, dan simbol). Jangan gunakan password yang sama dengan platform lain."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
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
      <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="relative w-full mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm mb-6">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4" />
              <span className="text-sm">Pusat Keamanan</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Pusat Keamanan Resmi
            </h1>
            <p className="text-base md:text-lg text-red-100 mb-2 leading-relaxed max-w-2xl mx-auto">
              Keamanan Anda Adalah Prioritas Kami. Pelajari cara melindungi akun, mengenali penipuan, dan bertransaksi dengan aman di Canvango Group.
            </p>
            
            {/* Warning Badge */}
            <div className="inline-flex items-center gap-2 bg-red-900 bg-opacity-50 rounded-2xl px-4 py-2 backdrop-blur-sm mt-6">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
              <span className="text-sm font-semibold">Waspada Penipuan - Verifikasi Kontak Resmi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <main>
            {/* Peringatan Penting */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-500 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-red-900 mb-2">PERINGATAN PENTING</h2>
                    <p className="text-sm text-red-800 leading-relaxed">
                      Canvango Group tidak pernah melakukan transaksi di luar website resmi. Jika ada yang mengatasnamakan kami di luar kontak resmi - itu adalah <span className="font-bold text-lg">PENIPUAN</span>.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Kontak Resmi */}
            <section className="mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Kontak & Informasi Resmi</h2>
                    <p className="text-sm text-gray-600">Pastikan Anda menghubungi kontak resmi kami</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: faGlobe, label: 'Website Resmi', value: 'www.canvangogroup.com', link: 'https://www.canvangogroup.com', color: 'blue' },
                    { icon: faEnvelope, label: 'Email Resmi', value: 'support@canvangogroup.com', link: 'mailto:support@canvangogroup.com', color: 'green' },
                    { icon: faPhone, label: 'Nomor CS Resmi', value: '+62-896-6965-4782', link: 'tel:+6289669654782', color: 'purple', note: 'HANYA nomor ini yang resmi' },
                    { icon: faClock, label: 'Jam Operasional CS', value: 'Senin-Minggu', value2: '09:00-21:00 WIB', color: 'yellow' },
                  ].map((item, index) => {
                    const iconProp = item.icon;
                    return (
                      <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border border-${item.color}-200 rounded-2xl p-4`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-${item.color}-500 rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <FontAwesomeIcon icon={iconProp} className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                            {item.link ? (
                              <a href={item.link} target={item.icon === faGlobe ? '_blank' : undefined} rel={item.icon === faGlobe ? 'noopener noreferrer' : undefined} className="text-sm font-semibold text-gray-900 hover:underline">
                                {item.value}
                              </a>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                                {item.value2 && <p className="text-sm text-gray-700">{item.value2}</p>}
                              </>
                            )}
                            {item.note && <p className="text-xs text-red-600 mt-1 font-medium">{item.note}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Alamat Badan Usaha</div>
                      <p className="text-sm font-semibold text-gray-900">
                        Jl Angkasa III 138, DKI Jakarta, Jakarta 10610, Indonesia
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sistem Keamanan */}
            <section className="mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faShield} className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Sistem Keamanan Platform</h2>
                    <p className="text-sm text-gray-600">Teknologi keamanan yang kami gunakan</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: faLock, title: 'Enkripsi SSL/TLS', desc: 'Semua data dienkripsi menggunakan protokol SSL/TLS 256-bit.', color: 'green' },
                    { icon: faShield, title: 'Proteksi DDoS', desc: 'Server dilindungi dengan sistem anti-DDoS 24/7.', color: 'blue' },
                    { icon: faEnvelope, title: 'Verifikasi Email OTP', desc: 'Setiap pendaftaran diverifikasi melalui kode OTP.', color: 'purple' },
                    { icon: faClock, title: 'Session Timeout', desc: 'Sesi login otomatis berakhir setelah tidak aktif.', color: 'yellow' },
                    { icon: faDatabase, title: 'Backup Data Harian', desc: 'Data di-backup otomatis setiap hari.', color: 'indigo' },
                    { icon: faChartLine, title: 'Log Aktivitas', desc: 'Semua aktivitas tercatat di riwayat akun.', color: 'red' },
                  ].map((item, index) => {
                    const iconProp = item.icon;
                    return (
                      <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border border-${item.color}-200 rounded-2xl p-5 hover:shadow-md transition-all`}>
                        <div className={`w-12 h-12 bg-${item.color}-500 rounded-xl flex items-center justify-center mb-4`}>
                          <FontAwesomeIcon icon={iconProp} className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Waspada Penipuan */}
            <section className="mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Waspada Penipuan</h2>
                    <p className="text-sm text-gray-600">Tanda-tanda penipuan yang perlu diwaspadai</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-5">
                  <ul className="space-y-3">
                    {[
                      { title: 'Mengaku Admin dengan Nomor Lain', desc: 'CS resmi HANYA menggunakan nomor resmi. Selain itu adalah PENIPU.' },
                      { title: 'Meminta Transfer ke Rekening Pribadi', desc: 'Pembayaran HANYA melalui sistem otomatis di website.' },
                      { title: 'Menawarkan Harga Lebih Murah', desc: 'Penipu menawarkan harga jauh lebih murah untuk menarik korban.' },
                      { title: 'Meminta Username & Password', desc: 'Kami tidak pernah meminta informasi login Anda.' },
                      { title: 'Link Website Palsu', desc: 'Website resmi HANYA www.canvangogroup.com.' },
                      { title: 'Pembayaran via Pulsa/Gift Card', desc: 'Kami tidak menerima pembayaran melalui pulsa atau gift card.' },
                      { title: 'Chat Duluan Menawarkan Produk', desc: 'Kami tidak pernah menghubungi pelanggan terlebih dahulu.' },
                      { title: 'Menjanjikan Garansi di Luar Website', desc: 'Garansi hanya berlaku untuk pembelian melalui website resmi.' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-red-600 mt-1 flex-shrink-0">⚠️</span>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{item.title}:</span>
                          <span className="text-sm text-gray-700"> {item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faQuestionCircle} className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Pertanyaan Umum (FAQ)</h2>
                    <p className="text-sm text-gray-600">Jawaban untuk pertanyaan keamanan yang sering ditanyakan</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</span>
                        {openFaq === index ? (
                          <FontAwesomeIcon icon={faChevronUp} className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        ) : (
                          <FontAwesomeIcon icon={faChevronDown} className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === index && (
                        <div className="px-5 pb-4 bg-white">
                          <p className="text-sm text-gray-700 leading-relaxed pt-3 border-t border-gray-200">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Laporkan */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24 opacity-10"></div>
                
                <div className="relative">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    Temukan Aktivitas Mencurigakan?
                  </h2>
                  <p className="text-sm text-red-100 leading-relaxed mb-6 max-w-2xl mx-auto">
                    Jika Anda menemukan penipuan yang mengatasnamakan Canvango Group, segera laporkan kepada kami untuk ditindaklanjuti.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="https://wa.me/6289669654782?text=Halo,%20saya%20ingin%20melaporkan%20aktivitas%20mencurigakan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faPhone} className="w-5 h-5 mr-2" />
                      Laporkan via WhatsApp
                    </a>
                    <a
                      href="mailto:support@canvangogroup.com?subject=Laporan%20Aktivitas%20Mencurigakan"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-2" />
                      Laporkan via Email
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
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

export default SecurityCenter;
