/**
 * FinTech Payment Demo Page
 * Example implementation of modern fintech payment layout
 * This is a template - content will be filled by user
 */

import React from 'react';
import { FinTechPaymentLayout } from '../components/FinTechPaymentLayout';
import {
  SectionHeader,
  InfoRow,
  AlertBox,
  Divider,
  AmountDisplay,
  Button,
  QRCodeContainer,
  TimerDisplay,
} from '../components/FinTechCard';

const FinTechPaymentDemo: React.FC = () => {
  // Left Column Content
  const leftColumn = (
    <div className="space-y-6">
      {/* Alert Section */}
      <AlertBox type="warning">
        <p className="font-semibold mb-1">⏰ Menunggu Pembayaran</p>
        <p>Selesaikan sebelum 2 Desember 2025 pukul 19:05</p>
      </AlertBox>

      {/* Payment Method Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">QRIS</h2>
      </div>

      {/* QR Code */}
      <QRCodeContainer
        qrUrl="https://via.placeholder.com/300x300/e2e8f0/475569?text=QR+CODE"
        subtitle="Scan dengan aplikasi pembayaran QRIS"
      />

      {/* Amount Display */}
      <AmountDisplay label="Total Pembayaran" amount={10000} size="lg" highlight />

      {/* Fee Info */}
      <AlertBox type="success">
        <p className="text-center">✓ Biaya admin ditanggung oleh kami</p>
      </AlertBox>

      {/* Action Button */}
      <Button variant="secondary" fullWidth>
        Cara Pembayaran
      </Button>
    </div>
  );

  // Right Column Content
  const rightColumn = (
    <div className="space-y-6">
      {/* Header with Timer */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">CANVANGO GROUP</h3>
          <p className="text-xs text-slate-500 mt-1">ADVERTISING ACCOUNT PROVIDER</p>
        </div>
        <TimerDisplay label="Waktu Tersisa" timeString="00:31:17" sublabel="Jam:Menit:Detik" />
      </div>

      <Divider />

      {/* Transaction Info */}
      <div>
        <SectionHeader title="Informasi Transaksi" />
        <div className="space-y-0">
          <InfoRow label="Merchant" value="CANVANGO GROUP" />
          <InfoRow label="Nama Pemesan" value="member1" />
          <InfoRow
            label="Nomor Invoice"
            value={<span className="font-mono text-xs">5d83f4ab-c43-4963-b658-1f65505a4db7</span>}
          />
          <InfoRow
            label="Nomor Referensi"
            value={<span className="font-mono text-xs">T4715928829318KAWB</span>}
          />
          <InfoRow label="Email" value="member1@gmail.com" />
        </div>
      </div>

      <Divider />

      {/* Payment Breakdown */}
      <div>
        <SectionHeader title="Rincian Pembayaran" />
        <div className="space-y-3">
          <InfoRow label="Jumlah Top Up" value="Rp 10.000" />

          {/* Admin Fee Section */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-green-800">BIAYA ADMIN</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                Ditanggung Seller
              </span>
            </div>
            <div className="space-y-1 text-xs text-green-700 ml-2">
              <div className="flex justify-between">
                <span>Biaya Tetap</span>
                <span>Rp 820</span>
              </div>
              <div className="flex justify-between">
                <span>Total Biaya</span>
                <span>Rp 820</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">Total Bayar</span>
              <span className="text-2xl font-bold text-blue-600">Rp 10.000</span>
            </div>
          </div>

          {/* Info Message */}
          <AlertBox type="success">
            <p>
              ✓ Bayar sebanyak <span className="font-semibold">Rp 10.000</span> dan saldo Anda
              akan bertambah <span className="font-semibold">Rp 10.000</span>. Biaya admin{' '}
              <span className="font-semibold">Rp 820</span> ditanggung oleh seller.
            </p>
          </AlertBox>
        </div>
      </div>

      {/* Refresh Button */}
      <Button variant="outline" fullWidth>
        🔄 Refresh Status Pembayaran
      </Button>
    </div>
  );

  return <FinTechPaymentLayout leftColumn={leftColumn} rightColumn={rightColumn} />;
};

export default FinTechPaymentDemo;
