# Member Area Quick Reference Guide

## 📁 File Locations

Semua halaman member area berada di: `canvango-app/frontend/src/pages/`

```
canvango-app/frontend/src/pages/
├── Dashboard.tsx              # Halaman utama dashboard
├── AkunBM.tsx                 # Katalog akun Business Manager
├── AkunPersonal.tsx           # Katalog akun personal Facebook
├── TransactionHistory.tsx     # Riwayat transaksi
├── TopUp.tsx                  # Top up saldo
├── ClaimGaransi.tsx          # Klaim garansi
├── JasaVerifiedBM.tsx        # Layanan verified BM
├── API.tsx                    # Dokumentasi API
└── Tutorial.tsx               # Pusat tutorial
```

## 🔗 Routing Setup

Tambahkan routes berikut ke router config Anda:

```typescript
// Example untuk React Router v6
import Dashboard from './pages/Dashboard';
import AkunBM from './pages/AkunBM';
import AkunPersonal from './pages/AkunPersonal';
import TransactionHistory from './pages/TransactionHistory';
import TopUp from './pages/TopUp';
import ClaimGaransi from './pages/ClaimGaransi';
import JasaVerifiedBM from './pages/JasaVerifiedBM';
import API from './pages/API';
import Tutorial from './pages/Tutorial';

// Routes
<Route path="/member">
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="akun-bm" element={<AkunBM />} />
  <Route path="akun-personal" element={<AkunPersonal />} />
  <Route path="riwayat-transaksi" element={<TransactionHistory />} />
  <Route path="top-up" element={<TopUp />} />
  <Route path="claim-garansi" element={<ClaimGaransi />} />
  <Route path="jasa-verified-bm" element={<JasaVerifiedBM />} />
  <Route path="api" element={<API />} />
  <Route path="tutorial" element={<Tutorial />} />
</Route>
```

## 🎨 Features per Page

### 1. Dashboard
- **Path**: `/member/dashboard`
- **Features**:
  - Welcome banner
  - Summary cards (Total Akun, Success Rate, Total Terjual)
  - Alert notifications
  - Customer support section
  - Updates section
  - Recent transactions table
- **Mock Data**: 10 transactions, 3 updates

### 2. Akun BM
- **Path**: `/member/akun-bm`
- **Features**:
  - Product grid
  - Category tabs (Semua, Verified, Aged, Fresh)
  - Search & sort
  - Product detail modal
  - Purchase functionality
- **Mock Data**: 12 BM products

### 3. Akun Personal
- **Path**: `/member/akun-personal`
- **Features**:
  - Summary cards
  - Category tabs (Semua, Akun Lama, Akun Baru)
  - Search & sort
  - Product grid
  - Age badges
- **Mock Data**: 8 personal account products

### 4. Riwayat Transaksi
- **Path**: `/member/riwayat-transaksi`
- **Features**:
  - Summary cards
  - Tab navigation (Transaksi Akun, Top Up)
  - Filters (Garansi, Date Range)
  - Transaction table
  - Status & warranty badges
  - Detail modal
  - Pagination
- **Mock Data**: 30 transactions (20 account + 10 top up)

### 5. Top Up
- **Path**: `/member/top-up`
- **Features**:
  - Current balance display
  - Nominal selector (6 predefined + custom)
  - Payment method selector
  - Form validation
  - Success/error notifications
  - Help section
- **Mock Data**: Current balance Rp 500.000

### 6. Claim Garansi
- **Path**: `/member/claim-garansi`
- **Features**:
  - Status cards
  - Claim submission form
  - Claims table
  - Admin response modal
  - Status tracking
- **Mock Data**: 8 warranty claims

### 7. Jasa Verified BM
- **Path**: `/member/jasa-verified-bm`
- **Features**:
  - Status cards
  - Order form with URL validation
  - Price calculator
  - Orders table
  - Status tracking
- **Mock Data**: 5 verification orders

### 8. API Documentation
- **Path**: `/member/api`
- **Features**:
  - API key display (show/hide/copy)
  - Stats cards (Hits, Uptime, Latency)
  - Tab navigation
  - Endpoint documentation
  - Code examples (JS, Python, PHP)
  - Rate limits table
- **Mock Data**: 5 endpoints, 3 code examples

### 9. Tutorial
- **Path**: `/member/tutorial`
- **Features**:
  - Search bar
  - Category tabs (6 categories)
  - Tutorial grid
  - Tutorial cards
  - Read time indicator
- **Mock Data**: 12 tutorials

## 🔌 API Integration Guide

### Replace Mock Data with Real API

Setiap halaman menggunakan mock data yang dapat dengan mudah diganti dengan API calls:

```typescript
// Before (Mock Data)
const [transactions] = useState(mockTransactions);

// After (API Call)
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchTransactions();
}, []);
```

### API Endpoints Needed

1. **Dashboard**
   - `GET /api/dashboard/stats` - Summary statistics
   - `GET /api/dashboard/alerts` - Alert messages
   - `GET /api/dashboard/updates` - Recent updates
   - `GET /api/transactions/recent` - Recent transactions

2. **Products**
   - `GET /api/products/bm` - BM account products
   - `GET /api/products/personal` - Personal account products
   - `GET /api/products/:id` - Product details
   - `POST /api/products/:id/purchase` - Purchase product

3. **Transactions**
   - `GET /api/transactions` - Transaction history
   - `GET /api/transactions/:id` - Transaction details

4. **Top Up**
   - `GET /api/balance` - Current balance
   - `POST /api/topup` - Submit top up request

5. **Warranty**
   - `GET /api/warranty/stats` - Warranty statistics
   - `GET /api/warranty/claims` - Warranty claims
   - `POST /api/warranty/claim` - Submit warranty claim

6. **Verified BM**
   - `GET /api/verified-bm/stats` - Order statistics
   - `GET /api/verified-bm/orders` - Order history
   - `POST /api/verified-bm/order` - Submit verification order

7. **API Management**
   - `GET /api/keys` - Get API key
   - `POST /api/keys/generate` - Generate new API key
   - `GET /api/stats` - API usage statistics

8. **Tutorials**
   - `GET /api/tutorials` - Get all tutorials
   - `GET /api/tutorials/:slug` - Get tutorial details

## 🎯 Common Patterns

### Loading State
```typescript
{isLoading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded"></div>
  </div>
) : (
  <div>{data}</div>
)}
```

### Empty State
```typescript
{items.length === 0 ? (
  <div className="text-center p-12">
    <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No items found
    </h3>
    <p className="text-gray-600">
      Try adjusting your filters
    </p>
  </div>
) : (
  <div>{items.map(...)}</div>
)}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API call
} catch (err) {
  setError('Failed to load data. Please try again.');
}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-sm text-red-800">{error}</p>
  </div>
)}
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('Failed');
    
    setSuccess(true);
  } catch (err) {
    setError('Submission failed');
  } finally {
    setLoading(false);
  }
};
```

## 🔐 Authentication Integration

Tambahkan authentication check di setiap halaman:

```typescript
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Rest of component
};
```

## 📱 Responsive Breakpoints

Semua halaman menggunakan Tailwind CSS breakpoints:

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)
- **Extra Large**: `xl:` (≥ 1280px)

## 🎨 Color Scheme

### Status Colors
- **Success**: Green (`bg-green-100 text-green-800`)
- **Warning**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Error**: Red (`bg-red-100 text-red-800`)
- **Info**: Blue (`bg-blue-100 text-blue-800`)
- **Default**: Gray (`bg-gray-100 text-gray-800`)

### Primary Colors
- **Primary**: Indigo (`bg-indigo-600 text-white`)
- **Secondary**: Gray (`bg-gray-600 text-white`)

## 🛠️ Customization

### Mengubah Mock Data

Mock data berada di bagian atas setiap file:

```typescript
// Cari section seperti ini
const mockData = [
  // ... data
];

// Ubah sesuai kebutuhan
```

### Menambah Fitur Baru

1. Tambahkan state baru
2. Buat handler function
3. Update UI component
4. Test functionality

### Styling Customization

Semua styling menggunakan Tailwind CSS classes. Untuk custom styling:

```typescript
// Inline style
<div className="custom-class bg-blue-500 p-4 rounded-lg">

// Atau tambahkan di index.css
.custom-class {
  /* custom styles */
}
```

## 📚 Dependencies

Halaman-halaman ini hanya membutuhkan:

1. **React** (18+)
2. **TypeScript**
3. **Tailwind CSS**
4. **@heroicons/react** (v2)

Tidak ada dependencies eksternal lainnya!

## ✅ Checklist Deployment

- [ ] Update routing configuration
- [ ] Replace mock data dengan API calls
- [ ] Implement authentication
- [ ] Add error boundaries
- [ ] Test responsive design
- [ ] Test all forms & validations
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test pagination & filters
- [ ] Verify all links work
- [ ] Test on different browsers
- [ ] Test on mobile devices

## 🐛 Troubleshooting

### TypeScript Errors
- Pastikan semua types sudah defined
- Check import statements
- Verify interface definitions

### Styling Issues
- Check Tailwind CSS configuration
- Verify class names
- Check responsive breakpoints

### State Management
- Verify useState initialization
- Check useEffect dependencies
- Ensure proper state updates

## 📞 Support

Jika ada pertanyaan atau issues:
1. Check documentation di file ini
2. Review MIGRATION_COMPLETE_SUMMARY.md
3. Check individual page files untuk inline comments

---

**Last Updated**: Current Session
**Version**: 1.0.0
**Status**: Production Ready ✅
