# Fitur Pengiriman Akun Pengganti untuk Garansi

## 📋 Analisa Kebutuhan

### Skenario
Ketika member mengajukan claim dengan tipe **replacement**, admin perlu:
1. Approve claim
2. **Mengirim akun pengganti** (BM/Personal Account)
3. Member menerima akun baru sebagai pengganti

### Data yang Tersedia
- `warranty_claims.resolution_details` (JSONB) - untuk menyimpan detail akun pengganti
- `warranty_claims.admin_notes` (TEXT) - untuk catatan admin
- `purchases.account_details` (JSONB) - detail akun yang dibeli

---

## 🎯 Fitur yang Diperlukan

### 1. Modal untuk Input Akun Pengganti
Ketika admin approve claim dengan type = replacement:
- Form input untuk detail akun baru
- Field dinamis sesuai product type
- Preview akun yang akan dikirim
- Konfirmasi pengiriman

### 2. Penyimpanan Data
```json
{
  "resolution_details": {
    "replacement_account": {
      "email": "newaccount@example.com",
      "password": "newpassword123",
      "additional_info": "...",
      "provided_at": "2025-11-19T10:00:00Z",
      "provided_by": "admin_id"
    }
  }
}
```

### 3. Notifikasi ke Member
- Email notification dengan detail akun baru
- In-app notification
- Update status claim → completed

---

## 🔧 Implementasi

### A. Update Service
File: `src/features/member-area/services/adminClaimService.ts`

Tambah function baru:
```typescript
async provideReplacementAccount(
  claimId: string, 
  accountDetails: any, 
  adminNotes?: string
) {
  const { data, error } = await supabase
    .from('warranty_claims')
    .update({
      status: 'completed',
      admin_notes: adminNotes,
      resolution_details: {
        replacement_account: {
          ...accountDetails,
          provided_at: new Date().toISOString(),
        }
      },
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', claimId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### B. Update Component
File: `src/features/member-area/pages/admin/ClaimManagement.tsx`

Tambah modal baru untuk input akun pengganti:
```tsx
const [showReplacementModal, setShowReplacementModal] = useState(false);
const [replacementAccount, setReplacementAccount] = useState({
  email: '',
  password: '',
  additional_info: ''
});

const handleProvideReplacement = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedClaim) return;

  try {
    setProcessingAction(true);
    await provideReplacementAccount(
      selectedClaim.id,
      replacementAccount,
      responseNote || undefined
    );
    setShowReplacementModal(false);
    setSelectedClaim(null);
    setReplacementAccount({ email: '', password: '', additional_info: '' });
    fetchClaims();
    alert('Replacement account provided successfully!');
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Failed to provide replacement');
  } finally {
    setProcessingAction(false);
  }
};
```

### C. UI Modal
```tsx
{/* Replacement Account Modal */}
{showReplacementModal && selectedClaim && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Provide Replacement Account</h2>
      <p className="text-gray-600 mb-4">
        Provide a new account for {selectedClaim.user?.full_name}
      </p>
      
      <form onSubmit={handleProvideReplacement}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email/Username
            </label>
            <input
              type="text"
              value={replacementAccount.email}
              onChange={(e) => setReplacementAccount({
                ...replacementAccount,
                email: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="text"
              value={replacementAccount.password}
              onChange={(e) => setReplacementAccount({
                ...replacementAccount,
                password: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Info (Optional)
            </label>
            <textarea
              value={replacementAccount.additional_info}
              onChange={(e) => setReplacementAccount({
                ...replacementAccount,
                additional_info: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add notes for the user..."
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowReplacementModal(false);
              setSelectedClaim(null);
              setReplacementAccount({ email: '', password: '', additional_info: '' });
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            disabled={processingAction}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            disabled={processingAction}
          >
            {processingAction ? 'Processing...' : 'Send Replacement'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## 📊 Workflow

### Untuk Claim Type = Replacement

```
1. Member submit claim (replacement)
   ↓
2. Admin review claim
   ↓
3. Admin approve claim
   ↓
4. Admin klik "Provide Replacement"
   ↓
5. Modal muncul untuk input akun baru
   ↓
6. Admin input:
   - Email/Username
   - Password
   - Additional Info
   - Admin Notes
   ↓
7. Admin klik "Send Replacement"
   ↓
8. System:
   - Save to resolution_details
   - Update status → completed
   - Set resolved_at
   - (Optional) Send notification to member
   ↓
9. Member dapat akun baru
```

### Untuk Claim Type = Refund

```
1. Member submit claim (refund)
   ↓
2. Admin review claim
   ↓
3. Admin approve claim
   ↓
4. Admin klik "Process Refund"
   ↓
5. System:
   - Add amount to user balance
   - Update status → completed
   - Create refund transaction
```

---

## 🎨 UI Changes

### Tabel - Action Buttons

**SEBELUM:**
```
[Detail] [Approve] [Reject]
```

**SESUDAH:**
```
Status = pending/reviewing:
  [Detail] [Approve] [Reject]

Status = approved + claim_type = replacement:
  [Detail] [Provide Replacement]

Status = approved + claim_type = refund:
  [Detail] [Process Refund]

Status = completed:
  [Detail] [View Resolution]
```

### Detail Modal - Resolution Section

Jika claim sudah completed dan ada replacement_account:
```tsx
{selectedClaim.resolution_details?.replacement_account && (
  <div className="bg-green-50 rounded-2xl p-4">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">
      ✅ Replacement Account Provided
    </h3>
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-medium text-gray-500">
          Email/Username
        </label>
        <p className="mt-1 text-sm text-gray-900 font-mono">
          {selectedClaim.resolution_details.replacement_account.email}
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500">
          Password
        </label>
        <p className="mt-1 text-sm text-gray-900 font-mono">
          {selectedClaim.resolution_details.replacement_account.password}
        </p>
      </div>
      {selectedClaim.resolution_details.replacement_account.additional_info && (
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Additional Info
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {selectedClaim.resolution_details.replacement_account.additional_info}
          </p>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-500">
          Provided At
        </label>
        <p className="mt-1 text-sm text-gray-900">
          {new Date(selectedClaim.resolution_details.replacement_account.provided_at)
            .toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 📝 Checklist Implementasi

- [ ] Update adminClaimService.ts - tambah provideReplacementAccount()
- [ ] Update ClaimManagement.tsx - tambah state replacementAccount
- [ ] Update ClaimManagement.tsx - tambah showReplacementModal
- [ ] Update ClaimManagement.tsx - tambah handleProvideReplacement()
- [ ] Update ClaimManagement.tsx - tambah Replacement Modal UI
- [ ] Update action buttons - conditional berdasarkan status & claim_type
- [ ] Update detail modal - tampilkan resolution_details jika ada
- [ ] Test dengan data real
- [ ] (Optional) Tambah email notification
- [ ] (Optional) Tambah in-app notification

---

## 🚀 Quick Implementation

Saya akan implementasikan fitur ini sekarang!
