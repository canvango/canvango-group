# 🎨 FinTech Payment Layout - Usage Guide

## Overview

Modern, clean, professional payment layout components inspired by premium fintech platforms like Stripe, Midtrans, and Xendit.

## Design Philosophy

✨ **Visual Style:**
- Dominasi warna putih dengan aksen biru pastel lembut
- Spacing longgar dan tampilan lega
- Rounded corners (rounded-xl) untuk semua komponen
- Shadow lembut untuk depth
- Typography modern dan clean
- Tone minimalis dan elegan

🎯 **Layout:**
- Two-column responsive layout
- Left: Payment method & QR code
- Right: Transaction details & breakdown
- Mobile: Stacks vertically
- Desktop: Side by side

## Components

### 1. FinTechPaymentLayout

Main layout wrapper dengan 2 kolom.

```tsx
import { FinTechPaymentLayout } from '@/features/payment/components';

<FinTechPaymentLayout
  leftColumn={<YourLeftContent />}
  rightColumn={<YourRightContent />}
/>
```

### 2. Card Components

#### InfoRow
Display label-value pairs dengan styling clean.

```tsx
import { InfoRow } from '@/features/payment/components';

<InfoRow label="Merchant" value="CANVANGO GROUP" />
<InfoRow 
  label="Nomor Invoice" 
  value={<span className="font-mono">INV-123</span>}
  valueClassName="text-blue-600"
/>
```

#### SectionHeader
Section title dengan optional subtitle.

```tsx
import { SectionHeader } from '@/features/payment/components';

<SectionHeader 
  title="Informasi Transaksi" 
  subtitle="Detail lengkap transaksi Anda"
/>
```

#### AlertBox
Alert dengan 4 variants: info, success, warning, error.

```tsx
import { AlertBox } from '@/features/payment/components';

<AlertBox type="warning">
  <p>⏰ Menunggu Pembayaran</p>
  <p>Selesaikan sebelum 2 Desember 2025</p>
</AlertBox>

<AlertBox type="success">
  <p>✓ Biaya admin ditanggung seller</p>
</AlertBox>
```

#### AmountDisplay
Display amount dengan formatting currency.

```tsx
import { AmountDisplay } from '@/features/payment/components';

<AmountDisplay 
  label="Total Pembayaran" 
  amount={10000} 
  size="lg" 
  highlight 
/>
```

**Props:**
- `label`: string
- `amount`: number
- `size`: 'sm' | 'md' | 'lg'
- `highlight`: boolean (blue color if true)

#### Button
Button dengan 3 variants.

```tsx
import { Button } from '@/features/payment/components';

<Button variant="primary" fullWidth>
  Bayar Sekarang
</Button>

<Button variant="secondary" onClick={handleClick}>
  Cara Pembayaran
</Button>

<Button variant="outline" disabled>
  Loading...
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline'
- `fullWidth`: boolean
- `disabled`: boolean
- `onClick`: () => void

#### QRCodeContainer
Display QR code dengan styling modern.

```tsx
import { QRCodeContainer } from '@/features/payment/components';

<QRCodeContainer
  qrUrl="https://tripay.co.id/qr/T123456"
  title="QRIS"
  subtitle="Scan dengan aplikasi pembayaran QRIS"
/>
```

#### TimerDisplay
Countdown timer display.

```tsx
import { TimerDisplay } from '@/features/payment/components';

<TimerDisplay
  label="Waktu Tersisa"
  timeString="00:31:17"
  sublabel="Jam:Menit:Detik"
/>
```

#### Divider
Simple horizontal divider.

```tsx
import { Divider } from '@/features/payment/components';

<Divider />
```

## Example Implementation

Lihat file: `src/features/payment/pages/FinTechPaymentDemo.tsx`

```tsx
import React from 'react';
import {
  FinTechPaymentLayout,
  SectionHeader,
  InfoRow,
  AlertBox,
  Divider,
  AmountDisplay,
  Button,
  QRCodeContainer,
  TimerDisplay,
} from '@/features/payment/components';

const MyPaymentPage = () => {
  const leftColumn = (
    <div className="space-y-6">
      <AlertBox type="warning">
        <p>⏰ Menunggu Pembayaran</p>
      </AlertBox>
      
      <QRCodeContainer
        qrUrl={qrCodeUrl}
        title="QRIS"
        subtitle="Scan dengan aplikasi pembayaran"
      />
      
      <AmountDisplay 
        label="Total Pembayaran" 
        amount={amount} 
        size="lg" 
        highlight 
      />
      
      <Button variant="secondary" fullWidth>
        Cara Pembayaran
      </Button>
    </div>
  );

  const rightColumn = (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">MERCHANT NAME</h3>
          <p className="text-xs text-slate-500">Description</p>
        </div>
        <TimerDisplay 
          label="Waktu Tersisa" 
          timeString={timeLeft} 
        />
      </div>
      
      <Divider />
      
      <div>
        <SectionHeader title="Informasi Transaksi" />
        <InfoRow label="Merchant" value="CANVANGO GROUP" />
        <InfoRow label="Invoice" value={invoiceNumber} />
      </div>
      
      <Divider />
      
      <div>
        <SectionHeader title="Rincian Pembayaran" />
        <InfoRow label="Jumlah" value={formatCurrency(amount)} />
        <AlertBox type="success">
          <p>✓ Biaya admin ditanggung seller</p>
        </AlertBox>
      </div>
      
      <Button variant="outline" fullWidth>
        🔄 Refresh Status
      </Button>
    </div>
  );

  return (
    <FinTechPaymentLayout 
      leftColumn={leftColumn} 
      rightColumn={rightColumn} 
    />
  );
};
```

## Color Palette

```css
/* Background */
bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20

/* Cards */
bg-white
border-slate-200/60
shadow-sm

/* Text */
text-slate-900 (primary)
text-slate-600 (secondary)
text-slate-500 (tertiary)

/* Accent */
text-blue-600 (highlight)
bg-blue-50 (info)
bg-green-50 (success)
bg-amber-50 (warning)
bg-red-50 (error)
```

## Spacing Guidelines

- Card padding: `p-8 lg:p-10`
- Section spacing: `space-y-6`
- Element gap: `gap-4` or `gap-6`
- Divider margin: `my-6`

## Typography Scale

- Heading: `text-xl` to `text-3xl`
- Body: `text-sm` to `text-base`
- Caption: `text-xs`
- Font weight: `font-medium`, `font-semibold`, `font-bold`

## Responsive Behavior

**Mobile (< 1024px):**
- Single column layout
- Right column appears first (order-1)
- Left column appears second (order-2)
- Full width cards

**Desktop (≥ 1024px):**
- Two column grid
- Left column first (order-1)
- Right column second (order-2)
- Side by side layout

## Best Practices

1. **Spacing:** Use `space-y-6` for vertical spacing between sections
2. **Dividers:** Use `<Divider />` to separate major sections
3. **Colors:** Stick to slate/blue palette for consistency
4. **Buttons:** Use `fullWidth` for mobile-friendly CTAs
5. **Alerts:** Use appropriate type (info/success/warning/error)
6. **Typography:** Use semantic heading levels (h1, h2, h3)

## Integration with Existing Code

Untuk mengintegrasikan dengan `TripayPaymentGateway`:

```tsx
// Refactor TripayPaymentGateway to use FinTech components
import {
  FinTechPaymentLayout,
  QRCodeContainer,
  AmountDisplay,
  // ... other components
} from '@/features/payment/components';

// Replace existing layout with FinTechPaymentLayout
// Replace custom styled divs with FinTech components
```

---

**Status:** ✅ Ready to use
**Version:** 1.0.0
**Last Updated:** December 2, 2025
