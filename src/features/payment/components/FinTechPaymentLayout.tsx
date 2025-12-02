/**
 * FinTechPaymentLayout Component
 * Modern, clean, professional payment layout inspired by Stripe/Midtrans
 * Two-column layout with soft colors and generous spacing
 */

import React from 'react';

interface FinTechPaymentLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export const FinTechPaymentLayout: React.FC<FinTechPaymentLayoutProps> = ({
  leftColumn,
  rightColumn,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 lg:p-10">
              {leftColumn}
            </div>
          </div>

          {/* Right Column */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 lg:p-10">
              {rightColumn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinTechPaymentLayout;
