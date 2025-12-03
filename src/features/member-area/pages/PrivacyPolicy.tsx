import React, { useState, useEffect } from 'react';
import { Mail, Phone, Clock, Shield, Database, Lock, Users, FileText, Eye, ArrowUp, Home, Infinity, Facebook, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LegalFooter from '../components/layout/LegalFooter';

const PrivacyPolicy: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => navigate('/akun-bm')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Infinity className="w-4 h-4" />
                <span>Akun BM</span>
              </button>
              <button
                onClick={() => navigate('/akun-personal')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Facebook className="w-4 h-4" />
                <span>Akun Personal</span>
              </button>
              <button
                onClick={() => navigate('/pusat-keamanan')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
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
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="relative w-full mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Kebijakan Resmi</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Kebijakan Privasi
            </h1>
            <p className="text-base md:text-lg text-blue-100 mb-2 leading-relaxed max-w-2xl mx-auto">
              Kami berkomitmen melindungi privasi dan data pribadi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda sesuai dengan UU Perlindungan Data Pribadi Indonesia.
            </p>
            
            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 text-sm text-blue-100 mt-6">
              <Clock className="w-4 h-4" />
              <span>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <main>
              {/* Intro Section */}
              <section id="intro" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Pengantar</h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Kami berkomitmen melindungi privasi dan data pribadi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda sesuai dengan UU Perlindungan Data Pribadi Indonesia.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-2xl p-4 md:p-6 mt-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Catatan Hukum
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Kebijakan Privasi ini berlaku untuk semua layanan yang disediakan oleh PT CANVANGO GROUP melalui website resminya. Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan data sesuai dengan kebijakan ini. Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) dan peraturan terkait lainnya.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Collection Section */}
              <section id="data-collection" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Data yang Kami Kumpulkan</h2>
                      <p className="text-sm text-gray-600">Berikut adalah jenis data yang kami kumpulkan untuk memberikan layanan terbaik</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data Identitas */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Data Identitas</h3>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Nama lengkap</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Alamat email</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Password (dienkripsi)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Data Transaksi */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Data Transaksi</h3>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Riwayat pembelian produk/layanan</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Metode pembayaran yang digunakan</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Jumlah transaksi dan saldo</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Invoice dan bukti pembayaran</span>
                        </li>
                      </ul>
                    </div>

                    {/* Data Teknis */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Data Teknis</h3>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Browser dan versi</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Jenis perangkat</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Waktu akses dan interaksi</span>
                        </li>
                      </ul>
                    </div>

                    {/* Data Klaim Garansi */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Data Klaim Garansi</h3>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Screenshot bukti transaksi</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Detail produk yang diklaim</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Deskripsi masalah</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Usage Section */}
              <section id="data-usage" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Penggunaan Data</h2>
                      <p className="text-sm text-gray-600">Bagaimana kami menggunakan data Anda untuk memberikan layanan terbaik</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Pengelolaan Akun', desc: 'Membuat, mengelola, dan mengamankan akun Anda di platform kami.', color: 'blue' },
                      { title: 'Pemrosesan Transaksi', desc: 'Memproses pembelian, top-up saldo, dan pengiriman produk digital/layanan.', color: 'green' },
                      { title: 'Layanan Pelanggan', desc: 'Merespon pertanyaan, klaim garansi, dan memberikan bantuan teknis.', color: 'purple' },
                      { title: 'Notifikasi Layanan', desc: 'Mengirim informasi penting seputar transaksi dan pembaruan layanan.', color: 'orange' },
                      { title: 'Keamanan', desc: 'Mendeteksi dan mencegah penipuan, penyalahgunaan, atau aktivitas ilegal.', color: 'red' },
                      { title: 'Peningkatan Layanan', desc: 'Menganalisis penggunaan untuk meningkatkan kualitas produk dan layanan.', color: 'indigo' },
                    ].map((item, index) => (
                      <div key={index} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-2xl p-4 hover:shadow-md transition-all`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 bg-${item.color}-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Third Party Section */}
              <section id="third-party" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Pihak Ketiga & Penjualan Data</h2>
                      <p className="text-sm text-gray-600">Komitmen kami dalam melindungi data Anda</p>
                    </div>
                  </div>
                  
                  {/* Komitmen */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          Komitmen Tidak Menjual Data
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold text-green-700 text-base">CANVANGO GROUP TIDAK PERNAH</span> menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran komersial apapun.
                      </p>
                    </div>
                  </div>

                  {/* Pengecualian */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      Pengecualian (Berbagi Data dengan Pihak Ketiga yang Terpercaya)
                    </h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Payment Gateway', desc: 'Memproses pembayaran dengan aman', icon: '💳' },
                        { title: 'Penyedia Hosting / Cloud', desc: 'Menyimpan dan mengamankan data', icon: '☁️' },
                        { title: 'Otoritas Hukum', desc: 'Kepatuhan terhadap perintah pengadilan atau regulasi', icon: '⚖️' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-700">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Perlindungan Data (Keamanan)</h2>
                      <p className="text-sm text-gray-600">Langkah-langkah keamanan yang kami terapkan untuk melindungi data Anda</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: 'Enkripsi SSL/TLS', desc: 'Semua data dienkripsi', icon: Lock, color: 'blue' },
                      { title: 'Password Hashing', desc: 'Password disimpan dalam bentuk hash yang tidak dapat dibalik', icon: Lock, color: 'green' },
                      { title: 'Server Aman', desc: 'Data disimpan di server dengan proteksi firewall dan pemantauan 24 jam', icon: Database, color: 'purple' },
                      { title: 'Backup Berkala', desc: 'Data di-backup secara otomatis untuk mencegah kehilangan data', icon: Database, color: 'yellow' },
                      { title: 'Akses Terbatas', desc: 'Hanya personel berwenang yang dapat mengakses data pengguna', icon: Shield, color: 'red' },
                      { title: 'Kepatuhan Regulasi', desc: 'Mengikuti standar keamanan dan UU Perlindungan Data Pribadi Indonesia', icon: FileText, color: 'indigo' },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border border-${item.color}-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1`}>
                          <div className={`w-12 h-12 bg-${item.color}-500 rounded-xl flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Rights Section */}
              <section id="rights" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Hak-hak Anda</h2>
                      <p className="text-sm text-gray-600">Hak yang Anda miliki terkait data pribadi Anda</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Hak Akses', desc: 'Anda berhak mengakses dan melihat data pribadi yang disimpan tentang Anda.', emoji: '👁️' },
                      { title: 'Hak Koreksi', desc: 'Anda dapat meminta perbaikan data yang tidak akurat atau tidak lengkap.', emoji: '✏️' },
                      { title: 'Hak Penghapusan', desc: 'Anda dapat meminta penghapusan data pribadi Anda.', emoji: '🗑️' },
                      { title: 'Hak Pembatasan', desc: 'Anda dapat meminta pembatasan pemrosesan data dalam situasi tertentu.', emoji: '⛔' },
                      { title: 'Hak Portabilitas', desc: 'Anda berhak menerima salinan data dalam format yang dapat dibaca mesin.', emoji: '📦' },
                      { title: 'Hak Keberatan', desc: 'Anda dapat menolak pemrosesan data untuk tujuan tertentu.', emoji: '🚫' },
                    ].map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{item.emoji}</span>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Storage Section */}
              <section id="storage" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Penyimpanan Data</h2>
                      <p className="text-sm text-gray-600">Periode penyimpanan data berdasarkan jenisnya</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { type: 'Data Akun Aktif', period: 'Selama akun aktif', note: 'Dihapus 30 hari setelah permintaan penghapusan.', icon: '👤' },
                      { type: 'Riwayat Transaksi', period: '7 tahun', note: 'Sesuai dengan peraturan perpajakan Indonesia.', icon: '💰' },
                      { type: 'Log Keamanan', period: '1 tahun', note: 'Untuk tujuan audit jika diperlukan.', icon: '🔒' },
                      { type: 'Data Klaim Garansi', period: 'Setelah diproses', note: '-', icon: '🛡️' },
                    ].map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Jenis Data</div>
                              <div className="text-sm font-semibold text-gray-900">{item.type}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Periode Penyimpanan</div>
                              <div className="text-sm font-semibold text-gray-900">{item.period}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Keterangan</div>
                              <div className="text-sm text-gray-700">{item.note}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Cookies Section */}
              <section id="cookies" className="mb-8 scroll-mt-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Penggunaan Cookies</h2>
                      <p className="text-sm text-gray-600">Jenis cookies yang kami gunakan untuk meningkatkan pengalaman Anda</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: 'Essential Cookies', desc: 'Mengoperasikan fungsi dasar website seperti login dan sesi.', icon: '🔑', color: 'blue' },
                      { title: 'Session Cookies', desc: 'Menyimpan informasi sesi selama Anda menggunakan website.', icon: '⏱️', color: 'green' },
                      { title: 'Security Cookies', desc: 'Membantu mendeteksi aktivitas mencurigakan dan mencegah penipuan.', icon: '🛡️', color: 'red' },
                    ].map((item, index) => (
                      <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border border-${item.color}-200 rounded-2xl p-5 hover:shadow-md transition-all`}>
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="mb-8 scroll-mt-24">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24 opacity-10"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-semibold">
                        Pertanyaan tentang Privasi?
                      </h2>
                    </div>
                    
                    <p className="text-sm text-blue-100 leading-relaxed mb-6">
                      Jika Anda memiliki pertanyaan atau ingin menggunakan hak-hak Anda terkait data pribadi, silakan hubungi kami.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-20 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="text-xs text-blue-100">Email</div>
                        </div>
                        <a href="mailto:support@canvangogroup.com" className="text-sm font-medium hover:underline block">
                          support@canvangogroup.com
                        </a>
                      </div>

                      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-20 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="text-xs text-blue-100">Nomor Kontak</div>
                        </div>
                        <a href="tel:+6289669654782" className="text-sm font-medium hover:underline block">
                          +62-896-6965-4782
                        </a>
                      </div>

                      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-20 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="text-xs text-blue-100">Waktu Respons</div>
                        </div>
                        <div className="text-sm font-medium">Hari kerja</div>
                      </div>
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
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <LegalFooter />
    </div>
  );
};

export default PrivacyPolicy;
