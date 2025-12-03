import React, { useState, useEffect } from 'react';
import { Mail, Phone, Clock, Shield, FileText, AlertCircle, CheckCircle, XCircle, ArrowUp, Home, Infinity, Facebook, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LegalFooter from '../components/layout/LegalFooter';

const TermsOfService: React.FC = () => {
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
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="relative w-full mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Ketentuan Layanan</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Syarat & Ketentuan
            </h1>
            <p className="text-base md:text-lg text-indigo-100 mb-2 leading-relaxed max-w-2xl mx-auto">
              Dokumen ini mengatur penggunaan layanan PT CANVANGO GROUP. Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut.
            </p>
            
            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-100 mt-6">
              <Clock className="w-4 h-4" />
              <span>Terakhir diperbarui: 29 November 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <main>
            {/* 1. Definisi */}
            <section id="definitions" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Definisi</h2>
                    <p className="text-sm text-gray-600">Istilah-istilah penting yang digunakan dalam dokumen ini</p>
                  </div>
                </div>
                
                <dl className="space-y-4">
                  {[
                    { term: 'Platform', desc: 'Website resmi Canvango Group beserta seluruh fitur dan layanan yang tersedia di dalamnya.' },
                    { term: 'Pengguna', desc: 'Setiap orang yang mengakses, mendaftar atau menggunakan layanan Platform.' },
                    { term: 'Akun', desc: 'Identitas Pengguna yang terdaftar di Platform, terdiri dari username, email, dan password.' },
                    { term: 'Produk Digital', desc: 'Produk yang dijual melalui Platform berupa akun Facebook Business Manager (BM), akun Facebook Personal, dan layanan terkait lainnya.' },
                    { term: 'Saldo', desc: 'Dana yang tersimpan di Akun Pengguna yang dapat digunakan untuk melakukan transaksi pembelian Produk Digital.' },
                    { term: 'Garansi', desc: 'Jaminan yang diberikan untuk Produk Digital dengan periode dan ketentuan tertentu sesuai yang tertera pada deskripsi produk.' },
                    { term: 'Jasa Verified BM', desc: 'Layanan untuk memverifikasi Business Manager Facebook milik Pengguna.' },
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4">
                      <dt className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">{index + 1}</span>
                        "{item.term}"
                      </dt>
                      <dd className="text-sm text-gray-700 leading-relaxed ml-8">{item.desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* 2. Ketentuan Akun */}
            <section id="account" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Ketentuan Akun</h2>
                    <p className="text-sm text-gray-600">Persyaratan dan aturan penggunaan akun</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Persyaratan Pendaftaran */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Persyaratan Pendaftaran
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Pengguna harus berusia minimal 18 tahun atau sudah memiliki KTP.',
                        'Menggunakan alamat email yang valid dan aktif.',
                        'Memberikan informasi yang benar dan akurat saat pendaftaran.',
                        'Satu orang hanya diperbolehkan memiliki satu akun.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keamanan Akun */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Keamanan Akun
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Pengguna bertanggung jawab penuh atas keamanan akun masing-masing.',
                        'Jangan membagikan password kepada siapapun.',
                        'Segera laporkan jika ada aktivitas mencurigakan pada akun.',
                        'Platform tidak bertanggung jawab atas kerugian akibat kelalaian Pengguna.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Larangan Penggunaan */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Larangan Penggunaan
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Menggunakan Platform untuk kegiatan penipuan atau ilegal.',
                        'Menjual kembali produk yang dibeli untuk tujuan penipuan.',
                        'Membuat akun ganda atau akun palsu.',
                        'Menyalahgunakan sistem garansi atau klaim.',
                        'Melakukan tindakan yang merugikan Platform atau Pengguna lain.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Produk & Layanan */}
            <section id="products" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Produk & Layanan</h2>
                    <p className="text-sm text-gray-600">Jenis produk dan layanan yang kami tawarkan</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Akun Business Manager (BM)', desc: 'Akun Facebook Business Manager untuk keperluan beriklan di platform Meta (Facebook & Instagram).', emoji: '💼' },
                    { title: 'Akun Personal Facebook', desc: 'Akun Facebook personal dengan berbagai spesifikasi untuk kebutuhan beriklan atau keperluan lainnya.', emoji: '👤' },
                    { title: 'Jasa Verified BM', desc: 'Layanan untuk membantu proses verifikasi Business Manager Facebook.', emoji: '✅' },
                  ].map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="text-3xl mb-3">{item.emoji}</div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Harga & Pembayaran */}
            <section id="payment" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Harga & Pembayaran</h2>
                    <p className="text-sm text-gray-600">Sistem pembayaran dan metode yang tersedia</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Sistem Saldo', items: ['Semua transaksi pembelian menggunakan sistem saldo.', 'Pengguna harus melakukan top-up saldo terlebih dahulu sebelum dapat membeli produk.'], color: 'blue' },
                    { title: 'Mata Uang', items: ['Semua harga dan transaksi menggunakan mata uang Rupiah Indonesia (IDR).', 'Harga sudah termasuk biaya layanan.'], color: 'green' },
                    { title: 'Metode Pembayaran', items: ['Top-up saldo dapat dilakukan melalui berbagai metode pembayaran yang tersedia (QRIS, Transfer Bank/VA, E-Wallet OVO, DANA, GoPay, dll).'], color: 'purple' },
                    { title: 'Konfirmasi Otomatis', items: ['Pembayaran terkonfirmasi secara otomatis oleh sistem.', 'Saldo akan masuk ke akun Anda segera setelah pembayaran berhasil diverifikasi.'], color: 'orange' },
                  ].map((item, index) => (
                    <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border border-${item.color}-200 rounded-2xl p-5`}>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <ul className="space-y-2">
                        {item.items.map((text, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className={`text-${item.color}-500 mt-1`}>•</span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Kebijakan Garansi */}
            <section id="warranty" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Kebijakan Garansi</h2>
                    <p className="text-sm text-gray-600">Ketentuan garansi produk dan proses klaim</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Cakupan Garansi */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Cakupan Garansi
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">Garansi mencakup:</p>
                    <ul className="space-y-2">
                      {[
                        'Akun tidak bisa login.',
                        'Akun terkena restrict/disable dalam periode garansi (bukan karena kesalahan pengguna).',
                        'Masalah teknis dan sistem produk.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pengecualian Garansi */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Pengecualian Garansi (Garansi Tidak Berlaku)
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Kerusakan akibat kesalahan atau kelalaian Pengguna.',
                        'Akun yang digunakan untuk kegiatan melanggar kebijakan Facebook/Meta.',
                        'Klaim yang diajukan setelah periode garansi berakhir.',
                        'Akun yang sudah diubah password atau email pemulihannya oleh Pengguna.',
                        'Kerusakan akibat force majeure atau kebijakan baru dari pihak Facebook/Meta.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Proses Klaim */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Proses Klaim</h3>
                    <ul className="space-y-2">
                      {[
                        'Klaim garansi dilakukan melalui menu "Klaim Garansi" di website dengan menyertakan bukti screenshot.',
                        'Tim akan memverifikasi dan memproses klaim maksimal 1x24 jam.',
                        'Jika klaim disetujui, Pengguna akan mendapatkan produk pengganti yang setara atau pengembalian saldo.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">{index + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Kebijakan Refund */}
            <section id="refund" className="mb-8 scroll-mt-24">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💸</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Kebijakan Pengembalian Dana (Refund)</h2>
                    <p className="text-sm text-gray-600">Ketentuan refund untuk produk digital</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  Mengingat sifat produk digital yang tidak dapat dikembalikan setelah dikirim, kebijakan refund adalah sebagai berikut:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dapat Di-Refund */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Dapat Di-Refund
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Saldo yang belum digunakan untuk transaksi apapun.',
                        'Produk yang terbukti tidak sesuai deskripsi sebelum digunakan.',
                        'Pembatalan pesanan Jasa Verified BM sebelum proses dimulai.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tidak Dapat Di-Refund */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Tidak Dapat Di-Refund
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Produk digital yang sudah diakses dan diterima.',
                        'Saldo yang sudah digunakan untuk transaksi.',
                        'Jasa Verified BM yang sudah dalam proses pengerjaan.',
                        'Kerugian akibat kesalahan atau kelalaian Pengguna.',
                      ].map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mt-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Proses Refund</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Pengajuan dapat dilakukan melalui email atau WhatsApp CS dengan menyertakan bukti yang diperlukan. Proses refund membutuhkan waktu 3-7 hari kerja.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="mb-8 scroll-mt-24">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24 opacity-10"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold">
                      Pertanyaan tentang Syarat & Ketentuan?
                    </h2>
                  </div>
                  
                  <p className="text-sm text-indigo-100 leading-relaxed mb-6">
                    Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-20 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="text-xs text-indigo-100">Email</div>
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
                        <div className="text-xs text-indigo-100">Nomor Kontak</div>
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
                        <div className="text-xs text-indigo-100">Waktu Respons</div>
                      </div>
                      <div className="text-sm font-medium">Maksimal 1x24 jam</div>
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
          className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
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

export default TermsOfService;
