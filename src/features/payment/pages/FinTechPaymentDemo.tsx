/**
 * FinTech Payment Demo Page
 * Example implementation of modern fintech payment layout
 * This is a template - content will be filled by user
 */

import React from 'react';
import { FinTechPaymentLayout } from '../components/FinTechPaymentLayout';
import {
  InfoRow,
  Divider,
  AlertBox,
  Button,
  TimerDisplay,
} from '../components/FinTechCard';

const FinTechPaymentDemo: React.FC = () => {
  // Left Column Content
  const leftColumn = (
    <div className="space-y-6">
      {/* Alert Section - Outside Card */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-3 mb-6">
          {/* Clock Icon */}
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* Text */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Menunggu Pembayaran</h3>
            <p className="text-sm text-slate-600">Selesaikan pembayaran sebelum 3 Desember 2025 pukul 15:56</p>
          </div>
        </div>
      </div>

      {/* Payment Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 space-y-6">
        {/* Header: Payment Method + Logo */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">QRIS</h2>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/2560px-QRIS_logo.svg.png" 
            alt="QRIS" 
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* QR Code - Simple without heavy border */}
        <div className="text-center py-4">
          <div className="inline-block">
            <img
              src="https://via.placeholder.com/200x200/000000/FFFFFF?text=QR"
              alt="QR Code"
              className="w-48 h-48"
            />
          </div>
          <p className="text-sm text-slate-500 mt-4">Scan dengan aplikasi pembayaran QRIS</p>
        </div>

        {/* Amount Section */}
        <div>
          <p className="text-sm text-slate-600 mb-2">Jumlah Bayar</p>
          <div className="flex justify-between items-center">
            <p className="text-3xl font-bold text-slate-900">Rp50.000</p>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
              Salin
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors">
          Cara Pembayaran
        </button>
      </div>
    </div>
  );

  // Right Column Content - 2 Separate Cards
  const rightColumn = (
    <div className="space-y-4">
      {/* Card 1: Header - Logo + Timer */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <img
              src="https://res.cloudinary.com/dubmxw6kl/image/upload/v1764639586/Canvango_Group_5_iu5nrz.png"
              alt="Canvango Group"
              className="h-14 w-auto object-contain"
            />
          </div>
          <TimerDisplay label="Waktu Tersisa" timeString="00:31:17" sublabel="Jam:Menit:Detik" />
        </div>
      </div>

      {/* Card 2: Transaction Info + Payment Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="space-y-6">
          {/* Transaction Info Section */}
          <div>
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

          {/* Payment Breakdown Section */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Rincian Pembayaran</h3>
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
      </div>
    </div>
  );

  return <FinTechPaymentLayout leftColumn={leftColumn} rightColumn={rightColumn} />;
};

export default FinTechPaymentDemo;
