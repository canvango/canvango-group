import React from 'react';
import { Mail, Wrench, ShieldAlert } from 'lucide-react';

interface CustomerSupportSectionProps {
  technicalEmail?: string;
  reportEmail?: string;
  ownerEmail?: string;
  termsLink?: string;
  privacyLink?: string;
}

const CustomerSupportSection: React.FC<CustomerSupportSectionProps> = ({
  technicalEmail = 'support@canvangogroup.com',
  reportEmail = 'report@canvangogroup.com',
  ownerEmail = 'owner@canvangogroup.com',
  termsLink = '/terms',
  privacyLink = '/privacy'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 leading-tight">
        Customer Support & Security
      </h3>
      <div className="space-y-2.5 md:space-y-3">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <Wrench className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
            <p className="font-semibold text-gray-900 text-sm md:text-base leading-tight">Bantuan Teknis</p>
          </div>
          <p className="text-xs md:text-sm text-gray-700 leading-snug">
            Tim Customer Service kami siap membantu mengatasi kendala teknis atau masalah yang Anda alami di website. Hubungi kami untuk mendapatkan solusi yang tepat dan cepat.
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-amber-600 flex-shrink-0" />
            <p className="font-semibold text-gray-900 text-sm md:text-base leading-tight">Pelaporan Penipuan</p>
          </div>
          <p className="text-xs md:text-sm text-gray-700 mb-1.5 leading-snug">
            Jika menemukan pihak yang mengatasnamakan <span className="italic">Rere Media Group</span> di platform lain (WhatsApp, Telegram, Instagram, atau media sosial lainnya), segera laporkan kepada tim keamanan kami untuk di tindak lanjuti.
          </p>
          <div className="flex items-center space-x-2 text-xs md:text-sm mb-1.5">
            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
            <a
              href={`mailto:${reportEmail}`}
              className="font-medium text-primary-600 hover:text-indigo-800 break-all leading-tight"
              aria-label={`Email report to ${reportEmail}`}
            >
              ripper@canvangogroup.com
            </a>
          </div>
          <p className="text-xs md:text-sm text-gray-700 leading-snug">
            <span className="font-semibold">Incentive Program:</span> Dapatkan Cashback 15% Top Up untuk setiap laporan yang terverifikasi valid. Program ini berlaku permanen sebagai bentuk apresiasi atas partisipasi Anda dalam menjaga keamanan komunitas.
          </p>
        </div>

        <p className="text-xs md:text-sm text-gray-600 italic pt-1.5 border-t border-gray-200 leading-snug">
          Kami berkomitmen untuk memberikan layanan terbaik dan menjaga kepercayaan Anda. Setiap masukan akan kami tangani dengan serius dan profesional.
        </p>
      </div>
    </div>
  );
};

export default CustomerSupportSection;
