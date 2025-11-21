import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { getSupabaseClient } from '../config/supabase.js';

interface SeedUser {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'member';
  balance: number;
}

interface SeedTransaction {
  username: string;
  product_name: string;
  product_type: string;
  quantity: number;
  total_amount: number;
  status: string;
}

interface SeedTutorial {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  view_count: number;
}

/**
 * Detect if we should use Supabase client or PostgreSQL pool
 */
function shouldUseSupabase(): boolean {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return !!(supabaseUrl && supabaseKey);
}

/**
 * Seed database using Supabase client
 */
async function seedWithSupabase() {
  const supabase = getSupabaseClient();
  
  try {
    console.log('🌱 Starting database seeding with Supabase...');
    console.log('🔗 Using Supabase client for data insertion');
    
    // Note: Supabase doesn't support transactions in the same way as raw SQL
    // Each operation is atomic, but we can't wrap multiple operations in a single transaction
    
    const userIds: { [key: string]: string } = {};
    
    // 1. Seed Admin User
    console.log('👤 Seeding admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .upsert({
        username: 'admin',
        email: 'admin@canvango.com',
        password: adminPassword,
        full_name: 'System Administrator',
        role: 'admin',
        balance: 10000.00
      }, {
        onConflict: 'email',
        ignoreDuplicates: true
      })
      .select('id')
      .single();
    
    if (adminError && adminError.code !== '23505') {
      console.error('Error seeding admin:', adminError);
    } else {
      console.log('✅ Admin user seeded');
    }
    
    // 2. Seed Sample Members
    console.log('👥 Seeding sample members...');
    const members: SeedUser[] = [
      {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'John Doe',
        role: 'member',
        balance: 5000.00
      },
      {
        username: 'janesmit',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Jane Smith',
        role: 'member',
        balance: 3500.00
      },
      {
        username: 'bobwilson',
        email: 'bob.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Bob Wilson',
        role: 'member',
        balance: 7500.00
      },
      {
        username: 'alicejohnson',
        email: 'alice.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Alice Johnson',
        role: 'member',
        balance: 2000.00
      },
      {
        username: 'charliebrown',
        email: 'charlie.brown@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Charlie Brown',
        role: 'member',
        balance: 4200.00
      }
    ];
    
    for (const member of members) {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          username: member.username,
          email: member.email,
          password: member.password,
          full_name: member.full_name,
          role: member.role,
          balance: member.balance
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select('id, username')
        .single();
      
      if (error && error.code !== '23505') {
        console.error(`Error seeding member ${member.username}:`, error);
      } else if (data) {
        userIds[data.username] = data.id;
      }
    }
    
    console.log(`✅ ${members.length} sample members seeded`);
    
    // 3. Seed Sample Transactions
    console.log('💳 Seeding sample transactions...');
    const transactions: SeedTransaction[] = [
      {
        username: 'johndoe',
        product_name: 'Akun BM RMSO Baru',
        product_type: 'RMSO_NEW',
        quantity: 2,
        total_amount: 500.00,
        status: 'BERHASIL'
      },
      {
        username: 'johndoe',
        product_name: 'Akun Personal Tua',
        product_type: 'PERSONAL_TUA',
        quantity: 1,
        total_amount: 300.00,
        status: 'BERHASIL'
      },
      {
        username: 'janesmit',
        product_name: 'Akun BM RM Baru',
        product_type: 'RM_NEW',
        quantity: 3,
        total_amount: 750.00,
        status: 'BERHASIL'
      },
      {
        username: 'janesmit',
        product_name: 'Jasa Verified BM J202',
        product_type: 'J202_VERIFIED_BM',
        quantity: 1,
        total_amount: 1000.00,
        status: 'PENDING'
      },
      {
        username: 'bobwilson',
        product_name: 'Akun BM RM Tua',
        product_type: 'RM_TUA',
        quantity: 2,
        total_amount: 800.00,
        status: 'BERHASIL'
      },
      {
        username: 'bobwilson',
        product_name: 'Akun BM RMSO Baru',
        product_type: 'RMSO_NEW',
        quantity: 1,
        total_amount: 250.00,
        status: 'GAGAL'
      },
      {
        username: 'alicejohnson',
        product_name: 'Akun Personal Tua',
        product_type: 'PERSONAL_TUA',
        quantity: 2,
        total_amount: 600.00,
        status: 'BERHASIL'
      },
      {
        username: 'charliebrown',
        product_name: 'Jasa Verified BM J202',
        product_type: 'J202_VERIFIED_BM',
        quantity: 1,
        total_amount: 1000.00,
        status: 'BERHASIL'
      },
      {
        username: 'charliebrown',
        product_name: 'Akun BM RM Baru',
        product_type: 'RM_NEW',
        quantity: 5,
        total_amount: 1250.00,
        status: 'PENDING'
      }
    ];
    
    const transactionIds: string[] = [];
    
    for (const transaction of transactions) {
      const userId = userIds[transaction.username];
      if (userId) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            product_name: transaction.product_name,
            product_type: transaction.product_type,
            quantity: transaction.quantity,
            total_amount: transaction.total_amount,
            status: transaction.status
          })
          .select('id')
          .single();
        
        if (error) {
          console.error(`Error seeding transaction for ${transaction.username}:`, error);
        } else if (data) {
          transactionIds.push(data.id);
        }
      }
    }
    
    console.log(`✅ ${transactions.length} sample transactions seeded`);
    
    // 4. Seed Sample Top-ups
    console.log('💰 Seeding sample top-ups...');
    const topups = [
      { username: 'johndoe', amount: 1000.00, payment_method: 'Bank Transfer', status: 'SUCCESS' },
      { username: 'janesmit', amount: 500.00, payment_method: 'E-Wallet', status: 'SUCCESS' },
      { username: 'bobwilson', amount: 2000.00, payment_method: 'Credit Card', status: 'SUCCESS' },
      { username: 'alicejohnson', amount: 750.00, payment_method: 'QRIS', status: 'PENDING' },
      { username: 'charliebrown', amount: 1500.00, payment_method: 'Bank Transfer', status: 'SUCCESS' }
    ];
    
    for (const topup of topups) {
      const userId = userIds[topup.username];
      if (userId) {
        const { error } = await supabase
          .from('topups')
          .insert({
            user_id: userId,
            amount: topup.amount,
            payment_method: topup.payment_method,
            status: topup.status,
            transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
        
        if (error) {
          console.error(`Error seeding top-up for ${topup.username}:`, error);
        }
      }
    }
    
    console.log(`✅ ${topups.length} sample top-ups seeded`);
    
    // 5. Seed Sample Claims
    console.log('📋 Seeding sample claims...');
    if (transactionIds.length > 0) {
      const claims = [
        {
          username: 'johndoe',
          transactionIndex: 0,
          reason: 'Akun tidak berfungsi',
          description: 'Akun BM yang saya beli tidak dapat digunakan untuk beriklan. Mohon penggantian atau refund.',
          status: 'PENDING'
        },
        {
          username: 'bobwilson',
          transactionIndex: 5,
          reason: 'Transaksi gagal tapi saldo terpotong',
          description: 'Transaksi saya gagal tetapi saldo sudah terpotong. Mohon dikembalikan.',
          status: 'APPROVED'
        }
      ];
      
      for (const claim of claims) {
        const userId = userIds[claim.username];
        const transactionId = transactionIds[claim.transactionIndex];
        if (userId && transactionId) {
          const { error } = await supabase
            .from('claims')
            .insert({
              user_id: userId,
              transaction_id: transactionId,
              reason: claim.reason,
              description: claim.description,
              status: claim.status
            });
          
          if (error) {
            console.error(`Error seeding claim for ${claim.username}:`, error);
          }
        }
      }
      
      console.log(`✅ ${claims.length} sample claims seeded`);
    }
    
    // 6. Seed Sample Tutorials
    console.log('📚 Seeding sample tutorials...');
    const tutorials: SeedTutorial[] = [
      {
        title: 'Cara Membuat Akun Business Manager Facebook',
        description: 'Panduan lengkap untuk membuat dan mengatur Business Manager Facebook dari awal.',
        content: `# Cara Membuat Akun Business Manager Facebook

## Pendahuluan
Business Manager adalah platform gratis dari Facebook yang membantu Anda mengelola halaman, akun iklan, dan aset bisnis lainnya di satu tempat.

## Langkah-langkah

### 1. Buka Business Manager
- Kunjungi business.facebook.com
- Klik "Buat Akun"

### 2. Masukkan Informasi Bisnis
- Nama bisnis Anda
- Nama Anda
- Email bisnis

### 3. Verifikasi Email
- Cek inbox email Anda
- Klik link verifikasi

### 4. Lengkapi Profil Bisnis
- Alamat bisnis
- Nomor telepon
- Website (opsional)

## Tips Penting
- Gunakan email bisnis yang valid
- Pastikan informasi akurat
- Simpan kredensial dengan aman

## Kesimpulan
Setelah mengikuti langkah-langkah di atas, akun Business Manager Anda siap digunakan untuk mengelola kampanye iklan Facebook.`,
        category: 'Facebook Ads',
        tags: ['business manager', 'facebook', 'setup', 'pemula'],
        view_count: 245
      },
      {
        title: 'Panduan Verifikasi Business Manager',
        description: 'Cara melakukan verifikasi Business Manager untuk meningkatkan limit iklan.',
        content: `# Panduan Verifikasi Business Manager

## Mengapa Perlu Verifikasi?
Verifikasi Business Manager meningkatkan kepercayaan Facebook terhadap bisnis Anda dan membuka akses ke fitur-fitur premium.

## Dokumen yang Diperlukan
1. KTP/Paspor
2. NPWP (untuk Indonesia)
3. Dokumen bisnis (SIUP/NIB)
4. Bukti alamat bisnis

## Proses Verifikasi

### Langkah 1: Akses Pengaturan Bisnis
- Buka Business Manager
- Klik "Pengaturan Bisnis"
- Pilih "Keamanan" > "Verifikasi Bisnis"

### Langkah 2: Upload Dokumen
- Pilih jenis dokumen
- Upload file yang jelas dan terbaca
- Pastikan tidak ada bagian yang tertutup

### Langkah 3: Tunggu Review
- Proses review 1-3 hari kerja
- Cek email untuk update status

## Tips Agar Verifikasi Berhasil
- Dokumen harus asli dan jelas
- Informasi harus konsisten
- Gunakan dokumen terbaru

## Troubleshooting
Jika verifikasi ditolak:
- Periksa kualitas dokumen
- Pastikan nama sesuai
- Hubungi support Facebook`,
        category: 'Facebook Ads',
        tags: ['verifikasi', 'business manager', 'dokumen', 'limit'],
        view_count: 189
      },
      {
        title: 'Strategi Targeting Iklan Facebook yang Efektif',
        description: 'Pelajari cara menargetkan audiens yang tepat untuk meningkatkan ROI iklan Facebook Anda.',
        content: `# Strategi Targeting Iklan Facebook yang Efektif

## Pengenalan Targeting
Targeting yang tepat adalah kunci kesuksesan kampanye iklan Facebook. Dengan targeting yang baik, Anda bisa menjangkau orang yang paling mungkin tertarik dengan produk Anda.

## Jenis-jenis Targeting

### 1. Demographic Targeting
- Usia
- Jenis kelamin
- Lokasi
- Bahasa
- Pendidikan
- Pekerjaan

### 2. Interest Targeting
- Hobi dan minat
- Halaman yang disukai
- Aktivitas online

### 3. Behavior Targeting
- Perilaku pembelian
- Device yang digunakan
- Travel behavior

### 4. Custom Audiences
- Website visitors
- Customer list
- App users
- Engagement audiences

### 5. Lookalike Audiences
- Berdasarkan customer terbaik
- Ekspansi jangkauan
- Similarity percentage

## Best Practices

### Mulai dengan Broad Targeting
- Biarkan algoritma Facebook belajar
- Gunakan Advantage+ audience

### Gunakan Layering
- Kombinasikan beberapa targeting
- Jangan terlalu sempit

### Test dan Optimize
- A/B testing berbagai audience
- Monitor performance metrics
- Scale yang berhasil

## Kesalahan yang Harus Dihindari
1. Targeting terlalu sempit
2. Overlapping audiences
3. Tidak menggunakan exclusions
4. Mengabaikan data analytics

## Kesimpulan
Targeting yang efektif membutuhkan pemahaman mendalam tentang audiens Anda dan eksperimen berkelanjutan.`,
        category: 'Facebook Ads',
        tags: ['targeting', 'strategi', 'iklan', 'roi', 'audience'],
        view_count: 312
      },
      {
        title: 'Cara Mengatasi Akun Iklan yang Disabled',
        description: 'Solusi dan langkah-langkah untuk mengatasi akun iklan Facebook yang di-disable.',
        content: `# Cara Mengatasi Akun Iklan yang Disabled

## Mengapa Akun Iklan Di-disable?
Facebook memiliki kebijakan ketat untuk menjaga kualitas platform. Akun bisa di-disable karena:
- Pelanggaran kebijakan iklan
- Aktivitas mencurigakan
- Pembayaran bermasalah
- Konten yang melanggar

## Langkah-langkah Penanganan

### 1. Cek Notifikasi
- Buka Business Manager
- Lihat pesan dari Facebook
- Pahami alasan disable

### 2. Review Kebijakan
- Baca Facebook Advertising Policies
- Identifikasi pelanggaran
- Perbaiki masalah

### 3. Submit Appeal
- Klik "Request Review"
- Jelaskan situasi dengan jelas
- Lampirkan bukti jika ada

### 4. Tunggu Response
- Proses review 1-2 hari kerja
- Cek email dan notifikasi
- Siap dengan dokumen tambahan

## Tips Mencegah Disable

### Ikuti Kebijakan
- Baca dan pahami policy
- Update dengan perubahan terbaru
- Hindari konten sensitif

### Jaga Kualitas Akun
- Bayar tagihan tepat waktu
- Gunakan payment method valid
- Jaga engagement rate

### Hindari Red Flags
- Jangan spam
- Hindari clickbait
- Gunakan landing page berkualitas

## Jika Appeal Ditolak
1. Buat akun iklan baru
2. Gunakan BM berbeda
3. Pastikan tidak mengulangi kesalahan
4. Pertimbangkan jasa verifikasi

## Kesimpulan
Pencegahan lebih baik daripada perbaikan. Selalu ikuti kebijakan Facebook dan jaga kualitas iklan Anda.`,
        category: 'Troubleshooting',
        tags: ['disabled', 'banned', 'appeal', 'kebijakan', 'solusi'],
        view_count: 428
      },
      {
        title: 'Optimasi Budget Iklan Facebook untuk UMKM',
        description: 'Strategi mengoptimalkan budget iklan Facebook untuk bisnis kecil dan menengah.',
        content: `# Optimasi Budget Iklan Facebook untuk UMKM

## Tantangan UMKM dalam Beriklan
Budget terbatas adalah tantangan utama UMKM. Namun dengan strategi yang tepat, Anda tetap bisa mendapatkan hasil maksimal.

## Menentukan Budget yang Tepat

### Hitung Cost per Acquisition (CPA)
- Berapa biaya untuk 1 customer?
- Berapa profit per customer?
- Tentukan budget berdasarkan target

### Mulai dengan Budget Kecil
- Test dengan Rp 50.000 - 100.000/hari
- Pelajari performance
- Scale bertahap

## Strategi Optimasi Budget

### 1. Campaign Budget Optimization (CBO)
- Biarkan Facebook distribusikan budget
- Fokus ke ad set terbaik
- Lebih efisien

### 2. Pilih Objective yang Tepat
- Awareness: Brand awareness
- Consideration: Traffic, engagement
- Conversion: Sales, leads

### 3. Bidding Strategy
- Lowest cost untuk testing
- Cost cap untuk kontrol
- Bid cap untuk competitive niche

### 4. Schedule Iklan
- Jalankan saat audience aktif
- Hindari jam sepi
- Gunakan dayparting

### 5. Placement Optimization
- Automatic placement untuk awal
- Manual placement setelah punya data
- Fokus ke placement terbaik

## Tips Hemat Budget

### Gunakan Organic Content
- Post organik dulu
- Boost yang perform baik
- Hemat production cost

### Retargeting
- Target warm audience
- Conversion rate lebih tinggi
- CPA lebih rendah

### User Generated Content
- Minta testimoni customer
- Gunakan sebagai ad creative
- Lebih authentic dan murah

### A/B Testing Sistematis
- Test 1 variable per waktu
- Jangan test terlalu banyak
- Fokus ke yang impact besar

## Metrics yang Harus Dimonitor
1. CTR (Click Through Rate)
2. CPC (Cost Per Click)
3. CPM (Cost Per Mille)
4. Conversion Rate
5. ROAS (Return on Ad Spend)

## Kesimpulan
Budget kecil bukan halangan untuk sukses beriklan di Facebook. Dengan strategi yang tepat dan optimasi berkelanjutan, UMKM bisa bersaing dengan brand besar.`,
        category: 'Facebook Ads',
        tags: ['budget', 'optimasi', 'umkm', 'strategi', 'hemat'],
        view_count: 267
      },
      {
        title: 'Panduan Lengkap Facebook Pixel',
        description: 'Cara install dan menggunakan Facebook Pixel untuk tracking konversi.',
        content: `# Panduan Lengkap Facebook Pixel

## Apa itu Facebook Pixel?
Facebook Pixel adalah kode JavaScript yang dipasang di website untuk tracking aktivitas pengunjung dan mengoptimalkan iklan.

## Manfaat Facebook Pixel
1. Track konversi
2. Retargeting pengunjung
3. Optimasi iklan otomatis
4. Analisis audience behavior
5. Build custom audiences

## Cara Install Facebook Pixel

### Langkah 1: Buat Pixel
- Buka Events Manager
- Klik "Connect Data Sources"
- Pilih "Web"
- Beri nama pixel

### Langkah 2: Install Pixel Code
**Metode 1: Manual**
- Copy pixel base code
- Paste di <head> website
- Sebelum </head> tag

**Metode 2: Partner Integration**
- Shopify
- WordPress
- WooCommerce
- Wix

**Metode 3: Google Tag Manager**
- Buat tag baru
- Pilih Custom HTML
- Paste pixel code

### Langkah 3: Verifikasi Installation
- Gunakan Facebook Pixel Helper
- Cek di Events Manager
- Test dengan browser

## Event Tracking

### Standard Events
- ViewContent
- AddToCart
- InitiateCheckout
- Purchase
- Lead
- CompleteRegistration

### Custom Events
- Buat event sesuai kebutuhan
- Track action spesifik
- Gunakan untuk optimasi

## Advanced Features

### Custom Conversions
- Buat konversi dari URL
- Tidak perlu edit code
- Mudah di-setup

### Event Parameters
- Value
- Currency
- Content_type
- Content_ids

### Conversion API
- Server-side tracking
- Lebih akurat
- Bypass ad blockers

## Troubleshooting

### Pixel Tidak Terdeteksi
- Cek placement code
- Clear cache
- Disable ad blocker

### Event Tidak Fire
- Cek event code
- Test dengan Pixel Helper
- Verify parameter

## Best Practices
1. Install pixel sejak awal
2. Track semua important events
3. Gunakan standard events
4. Test secara berkala
5. Monitor di Events Manager

## Kesimpulan
Facebook Pixel adalah tool essential untuk digital marketing. Install dan gunakan dengan benar untuk maksimalkan ROI iklan Anda.`,
        category: 'Technical',
        tags: ['pixel', 'tracking', 'konversi', 'technical', 'analytics'],
        view_count: 356
      }
    ];
    
    for (const tutorial of tutorials) {
      const { error } = await supabase
        .from('tutorials')
        .insert({
          title: tutorial.title,
          description: tutorial.description,
          content: tutorial.content,
          category: tutorial.category,
          tags: tutorial.tags,
          view_count: tutorial.view_count
        });
      
      if (error) {
        console.error(`Error seeding tutorial "${tutorial.title}":`, error);
      }
    }
    
    console.log(`✅ ${tutorials.length} sample tutorials seeded`);
    
    console.log('\n🎉 Database seeding completed successfully with Supabase!');
    console.log('\n📝 Seed Summary:');
    console.log('   - 1 Admin user (admin@canvango.com / admin123)');
    console.log(`   - ${members.length} Member users (password: password123)`);
    console.log(`   - ${transactions.length} Transactions`);
    console.log(`   - ${topups.length} Top-ups`);
    console.log(`   - ${tutorials.length} Tutorials`);
    console.log('\n💡 You can now login with:');
    console.log('   Admin: admin@canvango.com / admin123');
    console.log('   Member: john.doe@example.com / password123');
    console.log('\n🔗 Data inserted via Supabase client');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding with Supabase failed:', error);
    process.exit(1);
  }
}

/**
 * Seed database using PostgreSQL pool (legacy method)
 */
async function seedWithPostgres() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding with PostgreSQL...');
    console.log('🔗 Using PostgreSQL connection pool');
    
    await client.query('BEGIN');
    
    const userIds: { [key: string]: string } = {};
    
    // 1. Seed Admin User
    console.log('👤 Seeding admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminResult = await client.query(`
      INSERT INTO users (username, email, password, full_name, role, balance)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['admin', 'admin@canvango.com', adminPassword, 'System Administrator', 'admin', 10000.00]);
    
    console.log('✅ Admin user seeded');
    
    // 2. Seed Sample Members
    console.log('👥 Seeding sample members...');
    const members: SeedUser[] = [
      {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'John Doe',
        role: 'member',
        balance: 5000.00
      },
      {
        username: 'janesmit',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Jane Smith',
        role: 'member',
        balance: 3500.00
      },
      {
        username: 'bobwilson',
        email: 'bob.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Bob Wilson',
        role: 'member',
        balance: 7500.00
      },
      {
        username: 'alicejohnson',
        email: 'alice.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Alice Johnson',
        role: 'member',
        balance: 2000.00
      },
      {
        username: 'charliebrown',
        email: 'charlie.brown@example.com',
        password: await bcrypt.hash('password123', 10),
        full_name: 'Charlie Brown',
        role: 'member',
        balance: 4200.00
      }
    ];
    
    for (const member of members) {
      const result = await client.query(`
        INSERT INTO users (username, email, password, full_name, role, balance)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, username
      `, [member.username, member.email, member.password, member.full_name, member.role, member.balance]);
      
      if (result.rows.length > 0) {
        userIds[result.rows[0].username] = result.rows[0].id;
      }
    }
    
    console.log(`✅ ${members.length} sample members seeded`);
    
    // 3. Seed Sample Transactions
    console.log('💳 Seeding sample transactions...');
    const transactions: SeedTransaction[] = [
      {
        username: 'johndoe',
        product_name: 'Akun BM RMSO Baru',
        product_type: 'RMSO_NEW',
        quantity: 2,
        total_amount: 500.00,
        status: 'BERHASIL'
      },
      {
        username: 'johndoe',
        product_name: 'Akun Personal Tua',
        product_type: 'PERSONAL_TUA',
        quantity: 1,
        total_amount: 300.00,
        status: 'BERHASIL'
      },
      {
        username: 'janesmit',
        product_name: 'Akun BM RM Baru',
        product_type: 'RM_NEW',
        quantity: 3,
        total_amount: 750.00,
        status: 'BERHASIL'
      },
      {
        username: 'janesmit',
        product_name: 'Jasa Verified BM J202',
        product_type: 'J202_VERIFIED_BM',
        quantity: 1,
        total_amount: 1000.00,
        status: 'PENDING'
      },
      {
        username: 'bobwilson',
        product_name: 'Akun BM RM Tua',
        product_type: 'RM_TUA',
        quantity: 2,
        total_amount: 800.00,
        status: 'BERHASIL'
      },
      {
        username: 'bobwilson',
        product_name: 'Akun BM RMSO Baru',
        product_type: 'RMSO_NEW',
        quantity: 1,
        total_amount: 250.00,
        status: 'GAGAL'
      },
      {
        username: 'alicejohnson',
        product_name: 'Akun Personal Tua',
        product_type: 'PERSONAL_TUA',
        quantity: 2,
        total_amount: 600.00,
        status: 'BERHASIL'
      },
      {
        username: 'charliebrown',
        product_name: 'Jasa Verified BM J202',
        product_type: 'J202_VERIFIED_BM',
        quantity: 1,
        total_amount: 1000.00,
        status: 'BERHASIL'
      },
      {
        username: 'charliebrown',
        product_name: 'Akun BM RM Baru',
        product_type: 'RM_NEW',
        quantity: 5,
        total_amount: 1250.00,
        status: 'PENDING'
      }
    ];
    
    const transactionIds: string[] = [];
    
    for (const transaction of transactions) {
      const userId = userIds[transaction.username];
      if (userId) {
        const result = await client.query(`
          INSERT INTO transactions (user_id, product_name, product_type, quantity, total_amount, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [userId, transaction.product_name, transaction.product_type, transaction.quantity, transaction.total_amount, transaction.status]);
        
        transactionIds.push(result.rows[0].id);
      }
    }
    
    console.log(`✅ ${transactions.length} sample transactions seeded`);
    
    // 4. Seed Sample Top-ups
    console.log('💰 Seeding sample top-ups...');
    const topups = [
      { username: 'johndoe', amount: 1000.00, payment_method: 'Bank Transfer', status: 'SUCCESS' },
      { username: 'janesmit', amount: 500.00, payment_method: 'E-Wallet', status: 'SUCCESS' },
      { username: 'bobwilson', amount: 2000.00, payment_method: 'Credit Card', status: 'SUCCESS' },
      { username: 'alicejohnson', amount: 750.00, payment_method: 'QRIS', status: 'PENDING' },
      { username: 'charliebrown', amount: 1500.00, payment_method: 'Bank Transfer', status: 'SUCCESS' }
    ];
    
    for (const topup of topups) {
      const userId = userIds[topup.username];
      if (userId) {
        await client.query(`
          INSERT INTO topups (user_id, amount, payment_method, status, transaction_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, topup.amount, topup.payment_method, topup.status, `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`]);
      }
    }
    
    console.log(`✅ ${topups.length} sample top-ups seeded`);
    
    // 5. Seed Sample Claims
    console.log('📋 Seeding sample claims...');
    if (transactionIds.length > 0) {
      const claims = [
        {
          username: 'johndoe',
          transactionIndex: 0,
          reason: 'Akun tidak berfungsi',
          description: 'Akun BM yang saya beli tidak dapat digunakan untuk beriklan. Mohon penggantian atau refund.',
          status: 'PENDING'
        },
        {
          username: 'bobwilson',
          transactionIndex: 5,
          reason: 'Transaksi gagal tapi saldo terpotong',
          description: 'Transaksi saya gagal tetapi saldo sudah terpotong. Mohon dikembalikan.',
          status: 'APPROVED'
        }
      ];
      
      for (const claim of claims) {
        const userId = userIds[claim.username];
        const transactionId = transactionIds[claim.transactionIndex];
        if (userId && transactionId) {
          await client.query(`
            INSERT INTO claims (user_id, transaction_id, reason, description, status)
            VALUES ($1, $2, $3, $4, $5)
          `, [userId, transactionId, claim.reason, claim.description, claim.status]);
        }
      }
      
      console.log(`✅ ${claims.length} sample claims seeded`);
    }
    
    // 6. Seed Sample Tutorials
    console.log('📚 Seeding sample tutorials...');
    const tutorials: SeedTutorial[] = [
      {
        title: 'Cara Membuat Akun Business Manager Facebook',
        description: 'Panduan lengkap untuk membuat dan mengatur Business Manager Facebook dari awal.',
        content: `# Cara Membuat Akun Business Manager Facebook

## Pendahuluan
Business Manager adalah platform gratis dari Facebook yang membantu Anda mengelola halaman, akun iklan, dan aset bisnis lainnya di satu tempat.

## Langkah-langkah

### 1. Buka Business Manager
- Kunjungi business.facebook.com
- Klik "Buat Akun"

### 2. Masukkan Informasi Bisnis
- Nama bisnis Anda
- Nama Anda
- Email bisnis

### 3. Verifikasi Email
- Cek inbox email Anda
- Klik link verifikasi

### 4. Lengkapi Profil Bisnis
- Alamat bisnis
- Nomor telepon
- Website (opsional)

## Tips Penting
- Gunakan email bisnis yang valid
- Pastikan informasi akurat
- Simpan kredensial dengan aman

## Kesimpulan
Setelah mengikuti langkah-langkah di atas, akun Business Manager Anda siap digunakan untuk mengelola kampanye iklan Facebook.`,
        category: 'Facebook Ads',
        tags: ['business manager', 'facebook', 'setup', 'pemula'],
        view_count: 245
      },
      {
        title: 'Panduan Verifikasi Business Manager',
        description: 'Cara melakukan verifikasi Business Manager untuk meningkatkan limit iklan.',
        content: `# Panduan Verifikasi Business Manager

## Mengapa Perlu Verifikasi?
Verifikasi Business Manager meningkatkan kepercayaan Facebook terhadap bisnis Anda dan membuka akses ke fitur-fitur premium.

## Dokumen yang Diperlukan
1. KTP/Paspor
2. NPWP (untuk Indonesia)
3. Dokumen bisnis (SIUP/NIB)
4. Bukti alamat bisnis

## Proses Verifikasi

### Langkah 1: Akses Pengaturan Bisnis
- Buka Business Manager
- Klik "Pengaturan Bisnis"
- Pilih "Keamanan" > "Verifikasi Bisnis"

### Langkah 2: Upload Dokumen
- Pilih jenis dokumen
- Upload file yang jelas dan terbaca
- Pastikan tidak ada bagian yang tertutup

### Langkah 3: Tunggu Review
- Proses review 1-3 hari kerja
- Cek email untuk update status

## Tips Agar Verifikasi Berhasil
- Dokumen harus asli dan jelas
- Informasi harus konsisten
- Gunakan dokumen terbaru

## Troubleshooting
Jika verifikasi ditolak:
- Periksa kualitas dokumen
- Pastikan nama sesuai
- Hubungi support Facebook`,
        category: 'Facebook Ads',
        tags: ['verifikasi', 'business manager', 'dokumen', 'limit'],
        view_count: 189
      },
      {
        title: 'Strategi Targeting Iklan Facebook yang Efektif',
        description: 'Pelajari cara menargetkan audiens yang tepat untuk meningkatkan ROI iklan Facebook Anda.',
        content: `# Strategi Targeting Iklan Facebook yang Efektif

## Pengenalan Targeting
Targeting yang tepat adalah kunci kesuksesan kampanye iklan Facebook. Dengan targeting yang baik, Anda bisa menjangkau orang yang paling mungkin tertarik dengan produk Anda.

## Jenis-jenis Targeting

### 1. Demographic Targeting
- Usia
- Jenis kelamin
- Lokasi
- Bahasa
- Pendidikan
- Pekerjaan

### 2. Interest Targeting
- Hobi dan minat
- Halaman yang disukai
- Aktivitas online

### 3. Behavior Targeting
- Perilaku pembelian
- Device yang digunakan
- Travel behavior

### 4. Custom Audiences
- Website visitors
- Customer list
- App users
- Engagement audiences

### 5. Lookalike Audiences
- Berdasarkan customer terbaik
- Ekspansi jangkauan
- Similarity percentage

## Best Practices

### Mulai dengan Broad Targeting
- Biarkan algoritma Facebook belajar
- Gunakan Advantage+ audience

### Gunakan Layering
- Kombinasikan beberapa targeting
- Jangan terlalu sempit

### Test dan Optimize
- A/B testing berbagai audience
- Monitor performance metrics
- Scale yang berhasil

## Kesalahan yang Harus Dihindari
1. Targeting terlalu sempit
2. Overlapping audiences
3. Tidak menggunakan exclusions
4. Mengabaikan data analytics

## Kesimpulan
Targeting yang efektif membutuhkan pemahaman mendalam tentang audiens Anda dan eksperimen berkelanjutan.`,
        category: 'Facebook Ads',
        tags: ['targeting', 'strategi', 'iklan', 'roi', 'audience'],
        view_count: 312
      },
      {
        title: 'Cara Mengatasi Akun Iklan yang Disabled',
        description: 'Solusi dan langkah-langkah untuk mengatasi akun iklan Facebook yang di-disable.',
        content: `# Cara Mengatasi Akun Iklan yang Disabled

## Mengapa Akun Iklan Di-disable?
Facebook memiliki kebijakan ketat untuk menjaga kualitas platform. Akun bisa di-disable karena:
- Pelanggaran kebijakan iklan
- Aktivitas mencurigakan
- Pembayaran bermasalah
- Konten yang melanggar

## Langkah-langkah Penanganan

### 1. Cek Notifikasi
- Buka Business Manager
- Lihat pesan dari Facebook
- Pahami alasan disable

### 2. Review Kebijakan
- Baca Facebook Advertising Policies
- Identifikasi pelanggaran
- Perbaiki masalah

### 3. Submit Appeal
- Klik "Request Review"
- Jelaskan situasi dengan jelas
- Lampirkan bukti jika ada

### 4. Tunggu Response
- Proses review 1-2 hari kerja
- Cek email dan notifikasi
- Siap dengan dokumen tambahan

## Tips Mencegah Disable

### Ikuti Kebijakan
- Baca dan pahami policy
- Update dengan perubahan terbaru
- Hindari konten sensitif

### Jaga Kualitas Akun
- Bayar tagihan tepat waktu
- Gunakan payment method valid
- Jaga engagement rate

### Hindari Red Flags
- Jangan spam
- Hindari clickbait
- Gunakan landing page berkualitas

## Jika Appeal Ditolak
1. Buat akun iklan baru
2. Gunakan BM berbeda
3. Pastikan tidak mengulangi kesalahan
4. Pertimbangkan jasa verifikasi

## Kesimpulan
Pencegahan lebih baik daripada perbaikan. Selalu ikuti kebijakan Facebook dan jaga kualitas iklan Anda.`,
        category: 'Troubleshooting',
        tags: ['disabled', 'banned', 'appeal', 'kebijakan', 'solusi'],
        view_count: 428
      },
      {
        title: 'Optimasi Budget Iklan Facebook untuk UMKM',
        description: 'Strategi mengoptimalkan budget iklan Facebook untuk bisnis kecil dan menengah.',
        content: `# Optimasi Budget Iklan Facebook untuk UMKM

## Tantangan UMKM dalam Beriklan
Budget terbatas adalah tantangan utama UMKM. Namun dengan strategi yang tepat, Anda tetap bisa mendapatkan hasil maksimal.

## Menentukan Budget yang Tepat

### Hitung Cost per Acquisition (CPA)
- Berapa biaya untuk 1 customer?
- Berapa profit per customer?
- Tentukan budget berdasarkan target

### Mulai dengan Budget Kecil
- Test dengan Rp 50.000 - 100.000/hari
- Pelajari performance
- Scale bertahap

## Strategi Optimasi Budget

### 1. Campaign Budget Optimization (CBO)
- Biarkan Facebook distribusikan budget
- Fokus ke ad set terbaik
- Lebih efisien

### 2. Pilih Objective yang Tepat
- Awareness: Brand awareness
- Consideration: Traffic, engagement
- Conversion: Sales, leads

### 3. Bidding Strategy
- Lowest cost untuk testing
- Cost cap untuk kontrol
- Bid cap untuk competitive niche

### 4. Schedule Iklan
- Jalankan saat audience aktif
- Hindari jam sepi
- Gunakan dayparting

### 5. Placement Optimization
- Automatic placement untuk awal
- Manual placement setelah punya data
- Fokus ke placement terbaik

## Tips Hemat Budget

### Gunakan Organic Content
- Post organik dulu
- Boost yang perform baik
- Hemat production cost

### Retargeting
- Target warm audience
- Conversion rate lebih tinggi
- CPA lebih rendah

### User Generated Content
- Minta testimoni customer
- Gunakan sebagai ad creative
- Lebih authentic dan murah

### A/B Testing Sistematis
- Test 1 variable per waktu
- Jangan test terlalu banyak
- Fokus ke yang impact besar

## Metrics yang Harus Dimonitor
1. CTR (Click Through Rate)
2. CPC (Cost Per Click)
3. CPM (Cost Per Mille)
4. Conversion Rate
5. ROAS (Return on Ad Spend)

## Kesimpulan
Budget kecil bukan halangan untuk sukses beriklan di Facebook. Dengan strategi yang tepat dan optimasi berkelanjutan, UMKM bisa bersaing dengan brand besar.`,
        category: 'Facebook Ads',
        tags: ['budget', 'optimasi', 'umkm', 'strategi', 'hemat'],
        view_count: 267
      },
      {
        title: 'Panduan Lengkap Facebook Pixel',
        description: 'Cara install dan menggunakan Facebook Pixel untuk tracking konversi.',
        content: `# Panduan Lengkap Facebook Pixel

## Apa itu Facebook Pixel?
Facebook Pixel adalah kode JavaScript yang dipasang di website untuk tracking aktivitas pengunjung dan mengoptimalkan iklan.

## Manfaat Facebook Pixel
1. Track konversi
2. Retargeting pengunjung
3. Optimasi iklan otomatis
4. Analisis audience behavior
5. Build custom audiences

## Cara Install Facebook Pixel

### Langkah 1: Buat Pixel
- Buka Events Manager
- Klik "Connect Data Sources"
- Pilih "Web"
- Beri nama pixel

### Langkah 2: Install Pixel Code
**Metode 1: Manual**
- Copy pixel base code
- Paste di <head> website
- Sebelum </head> tag

**Metode 2: Partner Integration**
- Shopify
- WordPress
- WooCommerce
- Wix

**Metode 3: Google Tag Manager**
- Buat tag baru
- Pilih Custom HTML
- Paste pixel code

### Langkah 3: Verifikasi Installation
- Gunakan Facebook Pixel Helper
- Cek di Events Manager
- Test dengan browser

## Event Tracking

### Standard Events
- ViewContent
- AddToCart
- InitiateCheckout
- Purchase
- Lead
- CompleteRegistration

### Custom Events
- Buat event sesuai kebutuhan
- Track action spesifik
- Gunakan untuk optimasi

## Advanced Features

### Custom Conversions
- Buat konversi dari URL
- Tidak perlu edit code
- Mudah di-setup

### Event Parameters
- Value
- Currency
- Content_type
- Content_ids

### Conversion API
- Server-side tracking
- Lebih akurat
- Bypass ad blockers

## Troubleshooting

### Pixel Tidak Terdeteksi
- Cek placement code
- Clear cache
- Disable ad blocker

### Event Tidak Fire
- Cek event code
- Test dengan Pixel Helper
- Verify parameter

## Best Practices
1. Install pixel sejak awal
2. Track semua important events
3. Gunakan standard events
4. Test secara berkala
5. Monitor di Events Manager

## Kesimpulan
Facebook Pixel adalah tool essential untuk digital marketing. Install dan gunakan dengan benar untuk maksimalkan ROI iklan Anda.`,
        category: 'Technical',
        tags: ['pixel', 'tracking', 'konversi', 'technical', 'analytics'],
        view_count: 356
      }
    ];
    
    for (const tutorial of tutorials) {
      await client.query(`
        INSERT INTO tutorials (title, description, content, category, tags, view_count)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [tutorial.title, tutorial.description, tutorial.content, tutorial.category, tutorial.tags, tutorial.view_count]);
    }
    
    console.log(`✅ ${tutorials.length} sample tutorials seeded`);
    
    await client.query('COMMIT');
    
    console.log('\n🎉 Database seeding completed successfully with PostgreSQL!');
    console.log('\n📝 Seed Summary:');
    console.log('   - 1 Admin user (admin@canvango.com / admin123)');
    console.log(`   - ${members.length} Member users (password: password123)`);
    console.log(`   - ${transactions.length} Transactions`);
    console.log(`   - ${topups.length} Top-ups`);
    console.log(`   - ${tutorials.length} Tutorials`);
    console.log('\n💡 You can now login with:');
    console.log('   Admin: admin@canvango.com / admin123');
    console.log('   Member: john.doe@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding with PostgreSQL failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

/**
 * Main seed function - detects which method to use
 */
async function seedDatabase() {
  const useSupabase = shouldUseSupabase();
  
  if (useSupabase) {
    console.log('🔍 Detected Supabase configuration');
    await seedWithSupabase();
  } else {
    console.log('🔍 Using PostgreSQL connection pool');
    await seedWithPostgres();
  }
}

seedDatabase();