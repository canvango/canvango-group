# Requirements Document - Tripay Payment Gateway Integration

## Introduction

Dokumen ini menjelaskan requirements untuk integrasi Tripay Payment Gateway ke dalam aplikasi. Tripay adalah payment gateway Indonesia yang menyediakan berbagai channel pembayaran seperti Virtual Account, E-Wallet, QRIS, dan Convenience Store. Integrasi ini akan memungkinkan user untuk melakukan pembayaran produk menggunakan berbagai metode pembayaran yang tersedia di Tripay.

## Glossary

- **Tripay System**: Sistem payment gateway Tripay yang menyediakan API untuk pemrosesan pembayaran
- **Application**: Aplikasi frontend-only yang menggunakan Supabase sebagai backend
- **User**: Pengguna aplikasi yang akan melakukan pembayaran
- **Admin**: Administrator yang mengelola transaksi dan konfigurasi payment gateway
- **Payment Channel**: Metode pembayaran yang tersedia (Virtual Account, E-Wallet, QRIS, dll)
- **Transaction**: Record pembayaran yang dibuat melalui Tripay
- **Merchant Reference**: Nomor referensi unik dari aplikasi untuk setiap transaksi
- **Tripay Reference**: Nomor referensi unik dari Tripay untuk setiap transaksi
- **Pay Code**: Kode pembayaran atau nomor Virtual Account yang diberikan ke user
- **Callback**: Notifikasi otomatis dari Tripay ke aplikasi saat status pembayaran berubah
- **Closed Payment**: Jenis pembayaran dimana nominal ditentukan oleh merchant, kode bayar hanya bisa digunakan sekali
- **Open Payment**: Jenis pembayaran dimana nominal ditentukan oleh pelanggan, kode bayar bisa digunakan berkali-kali dengan masa aktif tertentu
- **UUID**: Unique identifier untuk Open Payment yang diberikan oleh Tripay System
- **Direct Channel**: Channel pembayaran yang prosesnya dilakukan di aplikasi sendiri tanpa redirect
- **Redirect Channel**: Channel pembayaran yang mengharuskan user diarahkan ke halaman Tripay
- **Sandbox Mode**: Mode testing untuk development
- **Production Mode**: Mode live untuk transaksi real
- **Signature**: Hash HMAC-SHA256 yang dibuat dari kombinasi merchant_code, merchant_ref, dan amount untuk validasi integritas data
- **Private Key**: Kunci rahasia dari Tripay yang digunakan untuk membuat signature
- **Merchant Code**: Kode unik merchant yang diberikan oleh Tripay
- **Order Items**: Array berisi detail produk yang dibeli (sku, name, price, quantity, subtotal, product_url, image_url)
- **Expired Time**: Unix timestamp yang menunjukkan batas waktu pembayaran
- **QR String**: String data untuk generate QR code (untuk channel yang support QR)
- **QR URL**: URL gambar QR code yang sudah di-generate oleh Tripay

## Requirements

### Requirement 1: Payment Channel Management

**User Story:** Sebagai Admin, saya ingin melihat daftar payment channel yang tersedia dari Tripay, sehingga saya dapat mengetahui metode pembayaran apa saja yang bisa digunakan oleh user.

#### Acceptance Criteria

1. WHEN THE Admin mengakses halaman payment channel management, THE Application SHALL menampilkan daftar payment channel dari Tripay API
2. WHILE menampilkan payment channel list, THE Application SHALL mengelompokkan channel berdasarkan group (Virtual Account, E-Wallet, Convenience Store)
3. WHEN THE payment channel ditampilkan, THE Application SHALL menampilkan informasi code, name, type (direct/redirect), fee structure, minimum amount, maximum amount, dan status active
4. WHEN THE Tripay API mengembalikan error, THE Application SHALL menampilkan error message yang informatif kepada Admin
5. WHILE menampilkan fee information, THE Application SHALL menampilkan fee merchant, fee customer, dan total fee dengan format yang mudah dibaca

### Requirement 2: Fee Calculator

**User Story:** Sebagai User, saya ingin melihat estimasi biaya transaksi untuk setiap payment channel sebelum memilih metode pembayaran, sehingga saya dapat memilih channel yang paling sesuai dengan kebutuhan saya.

#### Acceptance Criteria

1. WHEN THE User memilih nominal pembayaran, THE Application SHALL menghitung dan menampilkan total fee untuk setiap payment channel yang tersedia
2. WHEN THE fee calculation ditampilkan, THE Application SHALL menampilkan breakdown fee (flat fee dan percentage fee) untuk setiap channel
3. WHILE menampilkan fee calculation, THE Application SHALL menampilkan total amount yang harus dibayar (amount + fee) untuk setiap channel
4. WHEN THE User mengubah nominal pembayaran, THE Application SHALL secara otomatis memperbarui fee calculation
5. WHEN THE payment channel memiliki minimum atau maximum amount, THE Application SHALL menampilkan warning jika nominal tidak memenuhi syarat

### Requirement 3: Closed Payment Signature Generation

**User Story:** Sebagai System, saya ingin membuat signature HMAC-SHA256 untuk setiap request Closed Payment transaksi ke Tripay, sehingga integritas data terjamin dan request dapat divalidasi oleh Tripay System.

#### Acceptance Criteria

1. WHEN THE Application membuat Closed Payment transaksi baru, THE Application SHALL generate signature menggunakan algoritma HMAC-SHA256
2. WHEN THE signature dibuat, THE Application SHALL menggunakan Private Key dari environment variables sebagai secret key
3. WHEN THE signature dibuat untuk Closed Payment, THE Application SHALL menggabungkan merchant_code, merchant_ref, dan amount sebagai data yang di-hash
4. WHEN THE data digabungkan untuk signature, THE Application SHALL menggabungkan dalam format string "merchant_code + merchant_ref + amount" tanpa separator
5. WHEN THE signature selesai dibuat, THE Application SHALL menghasilkan hash dalam format hexadecimal string
6. WHEN THE Private Key tidak ditemukan di environment variables, THE Application SHALL menampilkan error message dan menghentikan proses create transaction
7. WHILE membuat signature, THE Application SHALL memastikan merchant_code, merchant_ref, dan amount dalam format string yang benar

### Requirement 4: Open Payment Signature Generation

**User Story:** Sebagai System, saya ingin membuat signature HMAC-SHA256 untuk setiap request Open Payment transaksi ke Tripay, sehingga integritas data terjamin dan kode bayar dapat digunakan berkali-kali dengan nominal yang ditentukan pelanggan.

#### Acceptance Criteria

1. WHEN THE Application membuat Open Payment transaksi baru, THE Application SHALL generate signature menggunakan algoritma HMAC-SHA256
2. WHEN THE signature dibuat, THE Application SHALL menggunakan Private Key dari environment variables sebagai secret key
3. WHEN THE signature dibuat untuk Open Payment, THE Application SHALL menggabungkan merchant_code, channel (payment method code), dan merchant_ref sebagai data yang di-hash
4. WHEN THE data digabungkan untuk signature, THE Application SHALL menggabungkan dalam format string "merchant_code + channel + merchant_ref" tanpa separator
5. WHEN THE signature selesai dibuat, THE Application SHALL menghasilkan hash dalam format hexadecimal string
6. WHEN THE Private Key tidak ditemukan di environment variables, THE Application SHALL menampilkan error message dan menghentikan proses create Open Payment
7. WHILE membuat signature, THE Application SHALL memastikan merchant_code, channel, dan merchant_ref dalam format string yang benar
8. WHEN THE Application perlu membedakan antara Closed dan Open Payment, THE Application SHALL menggunakan format signature yang sesuai (Closed: merchant_code + merchant_ref + amount, Open: merchant_code + channel + merchant_ref)

### Requirement 5: Create Open Payment Transaction

**User Story:** Sebagai User, saya ingin membuat kode pembayaran permanen (Open Payment) yang dapat digunakan berkali-kali dengan nominal yang saya tentukan sendiri, sehingga saya dapat melakukan top-up atau pembayaran fleksibel tanpa perlu membuat transaksi baru setiap kali.

#### Acceptance Criteria

1. WHEN THE User memilih untuk membuat Open Payment, THE Application SHALL generate signature terlebih dahulu menggunakan format merchant_code + channel + merchant_ref
2. WHEN THE signature berhasil dibuat, THE Application SHALL membuat request POST ke Tripay API endpoint /open-payment/create dengan Authorization header "Bearer {api_key}"
3. WHEN THE request dibuat, THE Application SHALL mengirim required parameters: method (payment channel code), merchant_ref (unique reference), dan signature
4. WHEN THE request dibuat, THE Application SHALL mengirim optional parameters: customer_name dan expired_time (unix timestamp untuk masa aktif kode bayar)
5. WHEN THE expired_time tidak disertakan, THE Application SHALL menggunakan default expiration time sesuai dengan kebijakan Tripay untuk Open Payment
6. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima data Open Payment termasuk uuid, reference, payment_method, payment_name, pay_code, status UNPAID, expired_time, dan instructions
7. WHEN THE Open Payment berhasil dibuat, THE Application SHALL menyimpan Open Payment data ke Supabase database dengan flag payment_type sebagai "OPEN"
8. WHEN THE Open Payment berhasil dibuat, THE Application SHALL menampilkan pay_code permanen kepada User dengan instruksi bahwa kode ini dapat digunakan berkali-kali
9. WHEN THE Open Payment berhasil dibuat, THE Application SHALL menampilkan payment instructions dengan penjelasan cara menggunakan pay_code untuk berbagai nominal
10. WHEN THE Tripay API mengembalikan error response, THE Application SHALL menampilkan error message dari response dan tidak menyimpan data ke database
11. WHILE membuat Open Payment, THE Application SHALL memastikan merchant_ref unik untuk setiap Open Payment code
12. WHEN THE Open Payment dibuat, THE Application SHALL menyimpan expired_time sebagai expired_at timestamp untuk tracking masa aktif kode bayar
13. WHEN THE User menggunakan pay_code untuk pembayaran, THE Application SHALL dapat menerima callback dari Tripay dengan informasi amount yang dibayarkan oleh User
14. WHEN THE callback diterima untuk Open Payment, THE Application SHALL mencatat setiap transaksi pembayaran yang masuk dengan amount yang berbeda-beda
15. WHILE menampilkan Open Payment detail, THE Application SHALL menampilkan history semua pembayaran yang telah dilakukan menggunakan pay_code tersebut

### Requirement 6: Open Payment Detail and Status Check

**User Story:** Sebagai User, saya ingin melihat detail Open Payment dan status terkini menggunakan UUID, sehingga saya dapat memonitor pay_code permanen dan melihat history pembayaran yang telah dilakukan menggunakan kode tersebut.

#### Acceptance Criteria

1. WHEN THE User mengakses detail Open Payment, THE Application SHALL membuat request GET ke Tripay API endpoint /open-payment/{uuid}/detail dengan Authorization header "Bearer {api_key}"
2. WHEN THE request dibuat, THE Application SHALL menggunakan UUID dari Open Payment yang telah dibuat sebelumnya
3. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima data Open Payment lengkap termasuk uuid, merchant_ref, customer_name, payment_name, payment_method, pay_code, qr_string, dan qr_url
4. WHEN THE detail Open Payment diterima, THE Application SHALL menampilkan pay_code permanen kepada User dengan status aktif atau expired
5. WHEN THE detail Open Payment memiliki qr_string atau qr_url, THE Application SHALL menampilkan QR code untuk memudahkan User melakukan pembayaran
6. WHEN THE Open Payment masih aktif, THE Application SHALL menampilkan instruksi penggunaan pay_code untuk berbagai nominal pembayaran
7. WHEN THE Open Payment sudah expired, THE Application SHALL menampilkan pesan bahwa kode bayar sudah tidak aktif dan menyarankan User untuk membuat Open Payment baru
8. WHEN THE Tripay API mengembalikan error response, THE Application SHALL menampilkan error message yang informatif kepada User
9. WHILE menampilkan detail Open Payment, THE Application SHALL menyediakan tombol untuk refresh status dari Tripay API
10. WHEN THE User mengklik refresh status, THE Application SHALL memperbarui data Open Payment dari Tripay API dan update database jika ada perubahan
11. WHEN THE detail Open Payment ditampilkan, THE Application SHALL menampilkan history semua transaksi pembayaran yang telah dilakukan menggunakan pay_code tersebut (jika ada)
12. WHEN THE history pembayaran ditampilkan, THE Application SHALL menampilkan informasi amount, paid_at timestamp, dan status untuk setiap transaksi
13. WHILE menampilkan Open Payment detail, THE Application SHALL menyimpan atau memperbarui data di Supabase database untuk caching dan offline access
14. WHEN THE User ingin menggunakan pay_code, THE Application SHALL menampilkan payment instructions dengan jelas termasuk cara transfer dengan nominal yang diinginkan
15. WHEN THE Open Payment memiliki customer_name, THE Application SHALL menampilkan informasi customer untuk konfirmasi

### Requirement 7: Create Closed Payment Transaction

**User Story:** Sebagai User, saya ingin membuat transaksi pembayaran dengan memilih payment channel yang tersedia, sehingga saya dapat melakukan pembayaran untuk produk yang saya beli.

#### Acceptance Criteria

1. WHEN THE User memilih payment channel dan mengklik tombol bayar, THE Application SHALL generate signature terlebih dahulu sebelum membuat request ke Tripay API
2. WHEN THE signature berhasil dibuat, THE Application SHALL membuat request POST ke Tripay API endpoint /transaction/create dengan Authorization header "Bearer {api_key}"
3. WHEN THE request dibuat, THE Application SHALL mengirim required parameters: method (payment channel code), merchant_ref (unique invoice number), amount (total pembayaran), customer_name, customer_email, dan signature
4. WHEN THE request dibuat, THE Application SHALL mengirim optional parameters: customer_phone, order_items (array dengan sku, name, price, quantity, subtotal, product_url, image_url), callback_url, return_url, dan expired_time (unix timestamp)
5. WHEN THE order_items disertakan, THE Application SHALL memastikan setiap item memiliki minimal name, price, dan quantity
6. WHEN THE expired_time tidak disertakan, THE Application SHALL menggunakan default expiration time 24 jam dari Tripay
7. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima data transaksi lengkap termasuk reference, payment_method, payment_name, pay_code, checkout_url, status UNPAID, expired_time, instructions, qr_string, dan qr_url
8. WHEN THE transaksi berhasil dibuat, THE Application SHALL menyimpan transaction data ke Supabase database dengan semua field dari response Tripay
9. WHEN THE transaksi menggunakan Direct Channel, THE Application SHALL menampilkan pay code atau nomor Virtual Account kepada User
10. WHEN THE transaksi menggunakan Redirect Channel, THE Application SHALL mengarahkan User ke checkout_url yang diberikan oleh Tripay
11. WHEN THE transaksi berhasil dibuat dan memiliki qr_string atau qr_url, THE Application SHALL menampilkan QR code untuk channel yang support QR payment
12. WHEN THE transaksi berhasil dibuat, THE Application SHALL menampilkan payment instructions dengan step-by-step guide sesuai channel
13. WHEN THE Tripay API mengembalikan error response, THE Application SHALL menampilkan error message dari response dan tidak menyimpan data ke database
14. WHILE membuat transaksi, THE Application SHALL menggunakan merchant_ref yang unik untuk setiap transaksi
15. WHEN THE transaksi dibuat, THE Application SHALL menyimpan expired_time sebagai expired_at timestamp untuk tracking expiration

### Requirement 8: Transaction List Management

**User Story:** Sebagai User, saya ingin melihat daftar transaksi pembayaran yang pernah saya buat, sehingga saya dapat melacak status pembayaran saya.

#### Acceptance Criteria

1. WHEN THE User mengakses halaman transaction history, THE Application SHALL menampilkan daftar transaksi dari Supabase database yang terkait dengan User tersebut
2. WHILE menampilkan transaction list, THE Application SHALL menampilkan informasi reference, merchant_ref, payment_method, payment_name, customer_name, amount, fee_merchant, fee_customer, total_fee, amount_received, pay_code, status, created_at, expired_at, dan paid_at
3. WHEN THE transaction list ditampilkan, THE Application SHALL menyediakan filter berdasarkan status (PAID, UNPAID, EXPIRED, FAILED, REFUND)
4. WHEN THE transaction list ditampilkan, THE Application SHALL menyediakan filter berdasarkan payment method code
5. WHEN THE transaction list ditampilkan, THE Application SHALL menyediakan filter berdasarkan reference (Tripay reference)
6. WHEN THE transaction list ditampilkan, THE Application SHALL menyediakan filter berdasarkan merchant_ref (merchant invoice number)
7. WHEN THE transaction list memiliki lebih dari 25 records, THE Application SHALL menampilkan pagination controls dengan informasi current_page, previous_page, next_page, last_page, per_page, dan total_records
8. WHEN THE User mengubah halaman pagination, THE Application SHALL memuat data transaksi sesuai dengan page yang dipilih
9. WHEN THE User memilih jumlah data per halaman, THE Application SHALL menampilkan data sesuai dengan per_page yang dipilih (maksimal 50 records per halaman)
10. WHEN THE User memilih sorting order, THE Application SHALL mengurutkan transaksi berdasarkan created_at dengan urutan ascending atau descending
11. WHEN THE User mengklik detail transaksi, THE Application SHALL menampilkan informasi lengkap transaksi termasuk order items, payment instructions, checkout_url, dan pay_url jika tersedia
12. WHEN THE Tripay API mengembalikan error saat fetch transaction list, THE Application SHALL menampilkan error message yang informatif kepada User

### Requirement 9: Transaction Detail and Status Check

**User Story:** Sebagai User, saya ingin melihat detail transaksi dan status pembayaran terkini dari Tripay API, sehingga saya dapat mengetahui apakah pembayaran saya sudah berhasil atau belum dengan informasi yang akurat dan real-time.

#### Acceptance Criteria

1. WHEN THE User mengakses detail transaksi, THE Application SHALL menampilkan informasi lengkap transaksi dari Supabase database terlebih dahulu
2. WHEN THE detail transaksi ditampilkan, THE Application SHALL menyediakan tombol untuk refresh status dari Tripay API
3. WHEN THE User mengklik refresh status, THE Application SHALL membuat request GET ke Tripay API endpoint /transaction/detail dengan parameter reference (Tripay reference number)
4. WHEN THE request dibuat, THE Application SHALL menyertakan Authorization header "Bearer {api_key}"
5. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima data transaksi lengkap termasuk reference, merchant_ref, payment_selection_type, payment_method, payment_name, customer_name, customer_email, customer_phone, callback_url, return_url, amount, fee_merchant, fee_customer, total_fee, amount_received, pay_code, pay_url, checkout_url, status, expired_time, order_items, instructions, qr_string, dan qr_url
6. WHEN THE status dari Tripay API berbeda dengan status di database, THE Application SHALL memperbarui status dan semua field terkait di Supabase database
7. WHEN THE transaksi berstatus UNPAID dan belum expired, THE Application SHALL menampilkan payment instructions, pay code, dan countdown timer untuk expiration
8. WHEN THE transaksi berstatus PAID, THE Application SHALL menampilkan paid_at timestamp, amount_received, dan konfirmasi pembayaran berhasil
9. WHEN THE transaksi berstatus EXPIRED, THE Application SHALL menampilkan pesan bahwa transaksi sudah kadaluarsa dan menyarankan User untuk membuat transaksi baru
10. WHEN THE transaksi berstatus FAILED, THE Application SHALL menampilkan pesan error dan alasan kegagalan jika tersedia
11. WHEN THE transaksi berstatus REFUND, THE Application SHALL menampilkan informasi refund dan tanggal refund
12. WHEN THE detail transaksi memiliki order_items, THE Application SHALL menampilkan daftar produk dengan sku, name, price, quantity, subtotal, product_url, dan image_url
13. WHEN THE detail transaksi memiliki qr_string atau qr_url, THE Application SHALL menampilkan QR code untuk channel yang support QR payment
14. WHEN THE Tripay API mengembalikan error response, THE Application SHALL menampilkan error message dan tetap menampilkan data dari database
15. WHILE menampilkan detail transaksi, THE Application SHALL menampilkan informasi fee breakdown (fee_merchant, fee_customer, total_fee) dan amount_received

### Requirement 10: Quick Transaction Status Check

**User Story:** Sebagai System, saya ingin melakukan quick check status transaksi tanpa mengambil detail lengkap, sehingga aplikasi dapat melakukan polling status secara efisien untuk update real-time status pembayaran.

#### Acceptance Criteria

1. WHEN THE Application perlu melakukan quick status check, THE Application SHALL membuat request GET ke Tripay API endpoint /transaction/check-status dengan query parameter reference (Tripay reference number)
2. WHEN THE request dibuat, THE Application SHALL menyertakan Authorization header "Bearer {api_key}"
3. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima response dengan success true dan message berisi status transaksi saat ini (contoh: "Status transaksi saat ini PAID")
4. WHEN THE response diterima, THE Application SHALL extract status dari message response
5. WHEN THE status dari Tripay API berbeda dengan status di database, THE Application SHALL memperbarui status di Supabase database
6. WHEN THE Tripay API mengembalikan error response dengan success false, THE Application SHALL menampilkan error message dari response
7. WHILE melakukan status polling, THE Application SHALL menggunakan check-status endpoint untuk efisiensi karena response lebih ringan dibanding detail endpoint
8. WHEN THE Application melakukan auto-refresh status untuk transaksi UNPAID, THE Application SHALL menggunakan check-status endpoint dengan interval polling yang sesuai (contoh: setiap 30 detik)
9. WHEN THE status berubah menjadi PAID atau EXPIRED atau FAILED, THE Application SHALL menghentikan polling dan menampilkan notifikasi kepada User
10. WHEN THE check-status API mengembalikan error, THE Application SHALL retry maksimal 3 kali sebelum menampilkan error kepada User

### Requirement 11: Payment Callback Handler

**User Story:** Sebagai System, saya ingin menerima notifikasi callback dari Tripay saat status pembayaran berubah, sehingga status transaksi di aplikasi dapat diperbarui secara real-time tanpa user perlu refresh manual.

#### Acceptance Criteria

1. WHEN THE Tripay System mengirim callback notification via POST request, THE Application SHALL menerima callback data di endpoint yang telah dikonfigurasi sebagai callback_url
2. WHEN THE callback diterima, THE Application SHALL membaca JSON payload yang berisi merchant_ref, reference, status, customer_name, customer_email, customer_phone, callback_virtual_account_id, external_id, account_number, payment_name, dan is_closed_payment
3. WHEN THE callback diterima, THE Application SHALL membaca HTTP header X-Callback-Event yang berisi event type (payment_status)
4. WHEN THE callback diterima, THE Application SHALL membaca HTTP header X-Callback-Signature yang berisi HMAC-SHA256 signature untuk validasi
5. WHEN THE Application memvalidasi callback signature, THE Application SHALL generate signature menggunakan Private Key sebagai secret key dan JSON payload sebagai data
6. WHEN THE generated signature cocok dengan X-Callback-Signature header, THE Application SHALL memproses callback data
7. WHEN THE callback signature tidak valid, THE Application SHALL menolak callback, log security warning, dan mengembalikan HTTP 403 Forbidden response
8. WHEN THE callback signature valid, THE Application SHALL mencari transaksi di Supabase database berdasarkan merchant_ref atau reference
9. WHEN THE transaksi ditemukan di database, THE Application SHALL memperbarui status transaksi sesuai dengan status dari callback payload
10. WHEN THE status dari callback adalah PAID, THE Application SHALL memperbarui status menjadi PAID dan menyimpan paid_at timestamp dengan waktu saat ini
11. WHEN THE status dari callback adalah FAILED, THE Application SHALL memperbarui status menjadi FAILED
12. WHEN THE status dari callback adalah REFUND, THE Application SHALL memperbarui status menjadi REFUND
13. WHEN THE callback berisi is_closed_payment dengan nilai 1, THE Application SHALL memproses sebagai Closed Payment transaction
14. WHEN THE callback berisi is_closed_payment dengan nilai 0, THE Application SHALL memproses sebagai Open Payment transaction
15. WHEN THE callback untuk Open Payment diterima, THE Application SHALL menyimpan transaksi pembayaran baru ke database dengan reference dari callback dan link ke UUID Open Payment
16. WHEN THE callback berisi callback_virtual_account_id, THE Application SHALL menyimpan virtual account ID untuk tracking
17. WHEN THE callback berisi external_id, THE Application SHALL menyimpan external ID untuk referensi tambahan
18. WHEN THE callback berisi account_number, THE Application SHALL menyimpan account number yang digunakan untuk pembayaran
19. WHEN THE callback processing berhasil, THE Application SHALL mengembalikan HTTP 200 OK response dengan JSON body berisi success: true
20. WHEN THE callback processing gagal karena transaksi tidak ditemukan, THE Application SHALL log error dan mengembalikan HTTP 404 Not Found response
21. WHEN THE callback processing gagal karena database error, THE Application SHALL log error details dan mengembalikan HTTP 500 Internal Server Error response
22. WHILE memproses callback, THE Application SHALL memastikan idempotency dengan mengecek apakah callback untuk merchant_ref tersebut sudah pernah diproses
23. WHEN THE callback untuk merchant_ref yang sama diterima lebih dari sekali, THE Application SHALL skip processing dan langsung return success response
24. WHEN THE callback berhasil diproses, THE Application SHALL log callback event ke database untuk audit trail dengan informasi merchant_ref, reference, status, timestamp, dan IP address pengirim
25. WHILE memproses callback, THE Application SHALL menggunakan database transaction untuk memastikan atomicity update status
26. WHEN THE callback processing selesai, THE Application SHALL trigger notification ke User jika status berubah menjadi PAID atau FAILED
27. WHEN THE Application menerima callback dengan X-Callback-Event selain payment_status, THE Application SHALL log event tersebut untuk future implementation
28. WHILE validating callback, THE Application SHALL memastikan request berasal dari IP address Tripay yang valid (optional security layer)

### Requirement 12: Payment Instructions Display

**User Story:** Sebagai User, saya ingin melihat instruksi pembayaran yang jelas untuk channel yang saya pilih, sehingga saya dapat menyelesaikan pembayaran dengan mudah.

#### Acceptance Criteria

1. WHEN THE User melihat detail transaksi UNPAID, THE Application SHALL menampilkan payment instructions dari Tripay API
2. WHEN THE payment instructions ditampilkan, THE Application SHALL menampilkan step-by-step instructions sesuai dengan payment channel
3. WHEN THE payment instructions mengandung pay_code placeholder, THE Application SHALL mengganti placeholder dengan pay code aktual
4. WHEN THE payment instructions mengandung amount placeholder, THE Application SHALL mengganti placeholder dengan nominal aktual
5. WHILE menampilkan payment instructions, THE Application SHALL menampilkan multiple instruction variants (Internet Banking, Mobile App, ATM) jika tersedia

### Requirement 13: Admin Transaction Management

**User Story:** Sebagai Admin, saya ingin melihat dan mengelola semua transaksi dari semua user, sehingga saya dapat memonitor dan menangani masalah pembayaran.

#### Acceptance Criteria

1. WHEN THE Admin mengakses admin transaction management, THE Application SHALL menampilkan daftar semua transaksi dari semua user
2. WHILE menampilkan admin transaction list, THE Application SHALL menyediakan filter berdasarkan status, payment method, date range, dan user
3. WHEN THE Admin mengklik detail transaksi, THE Application SHALL menampilkan informasi lengkap termasuk user information dan order items
4. WHEN THE Admin melihat transaksi dengan status anomali, THE Application SHALL menyediakan tombol untuk sync status dengan Tripay API
5. WHEN THE Admin melakukan sync status, THE Application SHALL memperbarui status di database sesuai dengan response dari Tripay API

### Requirement 14: Environment Configuration

**User Story:** Sebagai Developer, saya ingin dapat mengkonfigurasi Tripay credentials untuk Sandbox dan Production mode, sehingga saya dapat melakukan testing di Sandbox sebelum go-live di Production.

#### Acceptance Criteria

1. WHEN THE Application dijalankan, THE Application SHALL membaca Tripay API credentials dari environment variables
2. WHEN THE environment variable TRIPAY_MODE bernilai "sandbox", THE Application SHALL menggunakan Sandbox API URL dan Sandbox credentials
3. WHEN THE environment variable TRIPAY_MODE bernilai "production", THE Application SHALL menggunakan Production API URL dan Production credentials
4. WHEN THE Tripay credentials tidak ditemukan di environment variables, THE Application SHALL menampilkan error message yang jelas
5. WHILE melakukan API request ke Tripay, THE Application SHALL menggunakan API Key yang sesuai dengan mode yang aktif

### Requirement 15: Open Payment List Management

**User Story:** Sebagai User, saya ingin melihat daftar semua Open Payment yang pernah saya buat, sehingga saya dapat mengelola dan memonitor kode pembayaran permanen yang masih aktif atau sudah expired.

#### Acceptance Criteria

1. WHEN THE User mengakses halaman Open Payment list, THE Application SHALL membuat request GET ke Tripay API endpoint /open-payment/{uuid}/transactions dengan Authorization header "Bearer {api_key}"
2. WHEN THE request dibuat, THE Application SHALL menggunakan UUID dari Open Payment yang ingin dilihat daftar pembayarannya
3. WHEN THE request dibuat, THE Application SHALL mengirim optional query parameters: reference (nomor referensi transaksi), merchant_ref (nomor referensi sistem merchant), start_date (tanggal awal transaksi dalam format Y-m-d H:i:s), end_date (tanggal akhir transaksi dalam format Y-m-d H:i:s), dan per_page (jumlah data per halaman, maksimal 100)
4. WHEN THE Tripay API mengembalikan success response, THE Application SHALL menerima data array berisi daftar transaksi pembayaran yang telah dilakukan menggunakan Open Payment tersebut
5. WHEN THE daftar pembayaran ditampilkan, THE Application SHALL menampilkan informasi untuk setiap transaksi: reference, merchant_ref, payment_method, payment_name, customer_name, amount, fee_merchant, fee_customer, total_fee, amount_received, status, paid_at, dan note
6. WHEN THE daftar pembayaran memiliki lebih dari per_page records, THE Application SHALL menampilkan pagination controls dengan informasi current_page, from, to, per_page, last_page, dan total
7. WHEN THE User mengubah halaman pagination, THE Application SHALL memuat data transaksi sesuai dengan page yang dipilih
8. WHEN THE User memilih jumlah data per halaman, THE Application SHALL menampilkan data sesuai dengan per_page yang dipilih (maksimal 100 records per halaman)
9. WHEN THE User menggunakan filter reference, THE Application SHALL menampilkan hanya transaksi dengan nomor referensi yang sesuai
10. WHEN THE User menggunakan filter merchant_ref, THE Application SHALL menampilkan hanya transaksi dengan nomor referensi merchant yang sesuai
11. WHEN THE User menggunakan filter date range (start_date dan end_date), THE Application SHALL menampilkan hanya transaksi dalam rentang tanggal tersebut
12. WHEN THE daftar pembayaran kosong, THE Application SHALL menampilkan pesan bahwa belum ada pembayaran yang dilakukan menggunakan Open Payment code tersebut
13. WHEN THE daftar pembayaran ditampilkan, THE Application SHALL menampilkan total amount yang telah diterima dari semua transaksi PAID
14. WHEN THE User mengklik detail transaksi, THE Application SHALL menampilkan informasi lengkap transaksi termasuk fee breakdown dan timestamp
15. WHEN THE Tripay API mengembalikan error response, THE Application SHALL menampilkan error message yang informatif kepada User
16. WHILE menampilkan daftar pembayaran, THE Application SHALL menyediakan tombol refresh untuk memperbarui data dari Tripay API
17. WHEN THE daftar pembayaran berhasil dimuat, THE Application SHALL menyimpan atau memperbarui data di Supabase database untuk caching
18. WHEN THE User melihat transaksi dengan status PAID, THE Application SHALL menampilkan badge atau indicator yang jelas untuk status tersebut
19. WHEN THE daftar pembayaran ditampilkan, THE Application SHALL mengurutkan transaksi berdasarkan paid_at dengan urutan descending (terbaru di atas)
20. WHILE menampilkan fee information, THE Application SHALL menampilkan fee_merchant, fee_customer, total_fee, dan amount_received dengan format currency yang mudah dibaca

### Requirement 16: Error Handling and Logging

**User Story:** Sebagai Developer, saya ingin semua error dari Tripay API dan proses pembayaran di-log dengan baik, sehingga saya dapat melakukan debugging dan troubleshooting dengan mudah.

#### Acceptance Criteria

1. WHEN THE Tripay API mengembalikan error response, THE Application SHALL log error details ke console dan database
2. WHEN THE callback processing gagal, THE Application SHALL log error details termasuk callback payload untuk debugging
3. WHEN THE transaction creation gagal, THE Application SHALL menampilkan user-friendly error message kepada User
4. WHEN THE API request timeout, THE Application SHALL menampilkan timeout error message dan menyarankan User untuk retry
5. WHILE logging error, THE Application SHALL menyertakan timestamp, error type, error message, dan relevant context data
